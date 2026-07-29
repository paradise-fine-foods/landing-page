#!/usr/bin/env python3
"""Headless browser release matrix for an already-running built Astro Worker."""

import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


def load_manifest(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    routes = data.get("routes")
    if not isinstance(routes, list) or not routes:
        raise ValueError("manifest.routes must be a non-empty array")
    for route in routes:
        expected_seo(route)
    return routes


def expected_seo(route):
    seo = route.get("seo") if isinstance(route, dict) else None
    alternates = seo.get("alternates") if isinstance(seo, dict) else None
    canonical = seo.get("canonical") if isinstance(seo, dict) else None
    if not isinstance(canonical, str) or not canonical:
        raise ValueError(f"{route.get('path', '<unknown>')}: seo.canonical must be a non-empty string")
    if not isinstance(alternates, dict):
        raise ValueError(f"{route.get('path', '<unknown>')}: seo.alternates must be an object")
    for locale in ("en", "vi"):
        if not isinstance(alternates.get(locale), str) or not alternates[locale]:
            raise ValueError(f"{route.get('path', '<unknown>')}: seo.alternates.{locale} must be a non-empty string")
    return canonical, alternates


class MetadataParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None
        self.canonicals = []
        self.alternates = {}

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag.lower() == "html" and self.lang is None:
            self.lang = values.get("lang")
        if tag.lower() != "link":
            return
        relations = values.get("rel", "").lower().split()
        href = values.get("href")
        if "canonical" in relations and href:
            self.canonicals.append(href)
        if "alternate" in relations and href and values.get("hreflang"):
            locale = values["hreflang"].lower()
            self.alternates.setdefault(locale, []).append(href)


def assert_initial_metadata(html, route, url):
    canonical, alternates = expected_seo(route)
    parser = MetadataParser()
    parser.feed(html)
    parser.close()
    if parser.canonicals != [canonical]:
        raise AssertionError(f"{url}: canonical must equal {canonical!r}, received {parser.canonicals!r}")
    for locale in ("en", "vi"):
        if parser.alternates.get(locale, []) != [alternates[locale]]:
            raise AssertionError(
                f"{url}: {locale} alternate must equal {alternates[locale]!r}, "
                f"received {parser.alternates.get(locale, [])!r}"
            )


def initial_html(url, route):
    request = Request(url, headers={"Accept": "text/html", "User-Agent": "finefoods-release-smoke"})
    with urlopen(request, timeout=20) as response:
        html = response.read().decode("utf-8")
        if response.status != route.get("status", 200):
            raise AssertionError(f"{url}: initial status {response.status}")
    for value in (route.get("primary"), route.get("footer")):
        if value and value not in html:
            raise AssertionError(f"{url}: expected initial HTML text is missing")
    if route.get("islandFallback") and not re.search(r'role=["\']status["\']', html, re.I):
        raise AssertionError(f"{url}: server-island fallback is missing from initial HTML")
    assert_initial_metadata(html, route, url)
    return html


def assert_dom_metadata(page, route, url):
    canonical, alternates = expected_seo(route)
    expected_links = {
        'link[rel="canonical"]': ("canonical", canonical),
        'link[rel="alternate"][hreflang="en"]': ("en alternate", alternates["en"]),
        'link[rel="alternate"][hreflang="vi"]': ("vi alternate", alternates["vi"]),
    }
    for selector, (label, expected_href) in expected_links.items():
        links = page.locator(selector)
        actual_href = links.get_attribute("href") if links.count() == 1 else None
        if actual_href != expected_href:
            raise AssertionError(f"{url}: {label} must equal {expected_href!r}, received {actual_href!r}")


def inspect_page(page, url, route, screenshot_path=None):
    response = page.goto(url)
    page.wait_for_load_state("networkidle")
    if response is None or response.status != route.get("status", 200):
        raise AssertionError(f"{url}: browser status mismatch")
    if page.locator("html").get_attribute("lang") != route["lang"]:
        raise AssertionError(f"{url}: html language mismatch")
    if page.locator("main").count() != 1:
        raise AssertionError(f"{url}: expected one main landmark")
    assert_dom_metadata(page, route, url)
    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    if overflow:
        raise AssertionError(f"{url}: horizontal layout overflow")
    broken_images = page.locator("img").evaluate_all(
        "els => els.filter(img => !img.width || !img.height || !img.naturalWidth || !img.naturalHeight).length"
    )
    if broken_images:
        raise AssertionError(f"{url}: {broken_images} images lack stable/rendered dimensions")
    page.keyboard.press("Tab")
    if page.evaluate("document.activeElement === document.body"):
        raise AssertionError(f"{url}: keyboard focus did not reach an interactive element")
    if screenshot_path:
        page.screenshot(path=str(screenshot_path), full_page=True)


def screenshot_name(route, viewport):
    path = route["path"]
    readable_path = re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-") or "root"
    path_digest = hashlib.sha256(path.encode("utf-8")).hexdigest()
    return f"{readable_path}-{path_digest}--{route['lang']}--{viewport}.png"


def run(base_url, routes, evidence_dir):
    evidence = Path(evidence_dir) if evidence_dir else None
    if evidence:
        evidence.mkdir(parents=True, exist_ok=True)
    checks = 0
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for route in routes:
            url = urljoin(base_url.rstrip("/") + "/", route["path"].lstrip("/"))
            initial_html(url, route)
            desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
            desktop_page = desktop.new_page()
            desktop_shot = evidence / screenshot_name(route, 'desktop') if evidence else None
            inspect_page(desktop_page, url, route, desktop_shot)
            desktop.close()
            checks += 1

            mobile = browser.new_context(viewport={"width": 390, "height": 844})
            mobile_page = mobile.new_page()
            mobile_shot = evidence / screenshot_name(route, 'mobile') if evidence else None
            inspect_page(mobile_page, url, route, mobile_shot)
            mobile.close()
            checks += 1

            no_js = browser.new_context(java_script_enabled=False)
            no_js_page = no_js.new_page()
            no_js_page.goto(url)
            no_js_page.wait_for_load_state("networkidle")
            if no_js_page.locator("main").inner_text().strip() == "":
                raise AssertionError(f"{url}: no-JavaScript primary content is empty")
            no_js.close()
            checks += 1

            reduced = browser.new_context(reduced_motion="reduce")
            reduced_page = reduced.new_page()
            reduced_page.goto(url)
            reduced_page.wait_for_load_state("networkidle")
            if not reduced_page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"):
                raise AssertionError(f"{url}: reduced-motion emulation failed")
            reduced.close()
            checks += 1
        browser.close()
    return checks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--evidence-dir")
    args = parser.parse_args()
    routes = load_manifest(args.manifest)
    checks = run(args.base_url, routes, args.evidence_dir)
    print(json.dumps({"routes": len(routes), "browserChecks": checks, "status": "passed"}))


if __name__ == "__main__":
    main()
