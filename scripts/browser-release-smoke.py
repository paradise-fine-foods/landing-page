#!/usr/bin/env python3
"""Headless browser release matrix for an already-running built Astro Worker."""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


def load_manifest(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    routes = data.get("routes")
    if not isinstance(routes, list) or not routes:
        raise ValueError("manifest.routes must be a non-empty array")
    return routes


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
    return html


def inspect_page(page, url, route, screenshot_path=None):
    response = page.goto(url)
    page.wait_for_load_state("networkidle")
    if response is None or response.status != route.get("status", 200):
        raise AssertionError(f"{url}: browser status mismatch")
    if page.locator("html").get_attribute("lang") != route["lang"]:
        raise AssertionError(f"{url}: html language mismatch")
    if page.locator("main").count() != 1:
        raise AssertionError(f"{url}: expected one main landmark")
    canonical = page.locator('link[rel="canonical"]')
    if canonical.count() != 1 or not canonical.get_attribute("href"):
        raise AssertionError(f"{url}: canonical is missing")
    if page.locator('link[rel="alternate"][hreflang="en"]').count() != 1:
        raise AssertionError(f"{url}: en alternate is missing")
    if page.locator('link[rel="alternate"][hreflang="vi"]').count() != 1:
        raise AssertionError(f"{url}: vi alternate is missing")
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
            desktop_shot = evidence / f"{route['lang']}-desktop.png" if evidence else None
            inspect_page(desktop_page, url, route, desktop_shot)
            desktop.close()
            checks += 1

            mobile = browser.new_context(viewport={"width": 390, "height": 844})
            mobile_page = mobile.new_page()
            mobile_shot = evidence / f"{route['lang']}-mobile.png" if evidence else None
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
