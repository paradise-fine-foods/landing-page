export interface StageAttributeTarget {
  dataset: Record<string, string | undefined>;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
}

export interface StageStatusTarget {
  textContent: string | null;
}

export interface InteractiveStageCopy {
  accessibleLabel: string;
  interactionPrompt: string;
  statusId: string;
}

const interactiveAttributes = ['role', 'aria-label', 'aria-describedby', 'tabindex', 'aria-busy'] as const;

export function upgradeStageInteraction(
  target: StageAttributeTarget,
  status: StageStatusTarget,
  copy: InteractiveStageCopy,
) {
  delete target.dataset.failed;
  target.dataset.eligible = 'true';
  target.setAttribute('role', 'group');
  target.setAttribute('aria-label', copy.accessibleLabel);
  target.setAttribute('aria-describedby', copy.statusId);
  target.setAttribute('tabindex', '0');
  status.textContent = copy.interactionPrompt;
}

export function restoreStageFallback(
  target: StageAttributeTarget,
  status: StageStatusTarget | undefined,
  fallbackStatus: string,
  failed: boolean,
) {
  delete target.dataset.ready;
  delete target.dataset.eligible;
  if (failed) target.dataset.failed = 'true';
  else delete target.dataset.failed;
  for (const attribute of interactiveAttributes) target.removeAttribute(attribute);
  if (status) status.textContent = fallbackStatus;
}
