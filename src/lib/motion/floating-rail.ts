export interface FloatingRailController { dispose(): void }

export interface FloatingRailDependencies {
  viewport?: Pick<Window, 'addEventListener' | 'removeEventListener'> & {
    scrollY: number;
    innerHeight: number;
    innerWidth: number;
  };
  document?: Pick<Document, 'addEventListener' | 'removeEventListener'>;
}

export const shouldShowFloatingRail = (scrollY: number, viewportHeight: number): boolean =>
  scrollY > viewportHeight;

const noopController: FloatingRailController = { dispose() {} };

export function initializeFloatingRail(
  root: HTMLElement,
  dependencies: FloatingRailDependencies = {},
): FloatingRailController {
  const toggle = root.querySelector<HTMLButtonElement>('[data-floating-rail-toggle]');
  const panel = root.querySelector<HTMLElement>('#floating-rail-panel');
  const viewport = dependencies.viewport ?? (typeof window !== 'undefined' ? window : undefined);
  const documentTarget = dependencies.document ?? (typeof document !== 'undefined' ? document : undefined);
  if (!toggle || !panel || !viewport || !documentTarget) return noopController;

  const setExpanded = (expanded: boolean) => {
    root.dataset.expanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? toggle.dataset.closeLabel ?? '' : toggle.dataset.openLabel ?? '');
  };
  const updateVisibility = () => {
    const visible = shouldShowFloatingRail(viewport.scrollY, viewport.innerHeight);
    const wasVisible = root.dataset.visible === 'true';
    root.dataset.visible = String(visible);
    if (!visible) setExpanded(false);
    else if (!wasVisible) setExpanded(viewport.innerWidth > 768);
  };
  const onScroll = () => updateVisibility();
  const onClick = () => setExpanded(root.dataset.expanded !== 'true');
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || root.dataset.expanded !== 'true') return;
    setExpanded(false);
    toggle.focus();
  };

  root.dataset.ready = 'true';
  setExpanded(false);
  updateVisibility();
  let isWide = viewport.innerWidth > 768;
  const onResize = () => {
    const nextIsWide = viewport.innerWidth > 768;
    if (nextIsWide === isWide) return;
    isWide = nextIsWide;
    if (root.dataset.visible === 'true') setExpanded(isWide);
  };
  viewport.addEventListener('scroll', onScroll, { passive: true });
  viewport.addEventListener('resize', onResize);
  toggle.addEventListener('click', onClick);
  documentTarget.addEventListener('keydown', onKeydown);

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('resize', onResize);
      toggle.removeEventListener('click', onClick);
      documentTarget.removeEventListener('keydown', onKeydown);
    },
  };
}
