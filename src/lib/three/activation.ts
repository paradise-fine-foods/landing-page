export interface StageIntersectionObserver {
  observe: (target: EventTarget) => void;
  disconnect: () => void;
}

export interface StageActivationOptions {
  target: EventTarget;
  activate: () => void;
  createObserver?: (onIntersection: (isIntersecting: boolean) => void) => StageIntersectionObserver;
}

export interface StageActivationController {
  dispose: () => void;
}

const intentEvents = ['focusin', 'pointerenter', 'pointerdown'] as const;

export function installStageActivation({
  target,
  activate,
  createObserver,
}: StageActivationOptions): StageActivationController {
  let listening = true;
  let observer: StageIntersectionObserver | undefined;

  const dispose = () => {
    if (!listening) return;
    listening = false;
    for (const eventName of intentEvents) target.removeEventListener(eventName, trigger);
    observer?.disconnect();
    observer = undefined;
  };
  const trigger = () => {
    if (!listening) return;
    dispose();
    activate();
  };

  for (const eventName of intentEvents) target.addEventListener(eventName, trigger);
  observer = createObserver?.((isIntersecting) => {
    if (isIntersecting) trigger();
  });
  if (listening) observer?.observe(target);
  else observer?.disconnect();

  return { dispose };
}
