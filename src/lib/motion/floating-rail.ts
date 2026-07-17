export interface FloatingRailController { dispose(): void }

export interface FloatingRailDependencies {
  document?: Pick<Document, 'addEventListener' | 'removeEventListener'>;
}

const noopController: FloatingRailController = { dispose() {} };

export function initializeFloatingRail(
  root: HTMLElement,
  dependencies: FloatingRailDependencies = {},
): FloatingRailController {
  const toggle = root.querySelector<HTMLButtonElement>('[data-floating-rail-toggle]');
  const panel = root.querySelector<HTMLElement>('#floating-rail-panel');
  const documentTarget = dependencies.document ?? (typeof document !== 'undefined' ? document : undefined);
  if (!toggle || !panel || !documentTarget) return noopController;

  const setExpanded = (expanded: boolean) => {
    root.dataset.expanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? toggle.dataset.closeLabel ?? '' : toggle.dataset.openLabel ?? '');
  };
  const onClick = () => setExpanded(root.dataset.expanded !== 'true');
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || root.dataset.expanded !== 'true') return;
    setExpanded(false);
    toggle.focus();
  };

  root.dataset.ready = 'true';
  root.dataset.visible = 'true';
  setExpanded(true);
  toggle.addEventListener('click', onClick);
  documentTarget.addEventListener('keydown', onKeydown);

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      toggle.removeEventListener('click', onClick);
      documentTarget.removeEventListener('keydown', onKeydown);
    },
  };
}
