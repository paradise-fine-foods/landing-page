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
    root.dataset.visible = String(visible);
    if (!visible) setExpanded(false);
  };
  const onScroll = () => updateVisibility();
  const onClick = () => setExpanded(root.dataset.expanded !== 'true');
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || root.dataset.expanded !== 'true') return;
    setExpanded(false);
    toggle.focus();
  };

  root.dataset.ready = 'true';
  updateVisibility();
  setExpanded(viewport.innerWidth > 768);
  viewport.addEventListener('scroll', onScroll, { passive: true });
  toggle.addEventListener('click', onClick);
  documentTarget.addEventListener('keydown', onKeydown);

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      viewport.removeEventListener('scroll', onScroll);
      toggle.removeEventListener('click', onClick);
      documentTarget.removeEventListener('keydown', onKeydown);
    },
  };
}
