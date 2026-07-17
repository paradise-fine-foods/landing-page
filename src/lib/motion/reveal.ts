export interface RevealController { dispose(): void }

export interface RevealDependencies {
  createObserver?: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => IntersectionObserver;
}

const defaultCreateObserver: RevealDependencies['createObserver'] =
  typeof globalThis.IntersectionObserver === 'function'
    ? (callback, options) => new IntersectionObserver(callback, options)
    : undefined;

export function installReveals(
  root: ParentNode,
  dependencies: RevealDependencies = { createObserver: defaultCreateObserver },
): RevealController {
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const settle = () => {
    for (const node of nodes) node.dataset.revealed = 'true';
  };
  if (nodes.length === 0 || !dependencies.createObserver) {
    settle();
    return { dispose() {} };
  }

  let disposed = false;
  const revealed = new Set<Element>();
  let observer: IntersectionObserver | undefined;
  try {
    observer = dependencies.createObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || revealed.has(entry.target)) continue;
        revealed.add(entry.target);
        (entry.target as HTMLElement).dataset.revealed = 'true';
        observer?.unobserve(entry.target);
      }
    }, { threshold: 0.18 });
    for (const node of nodes) observer.observe(node);
  } catch {
    observer?.disconnect();
    settle();
    return { dispose() {} };
  }

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
    },
  };
}
