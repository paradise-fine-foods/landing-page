export interface LivingCanvasController {
  dispose(): void;
}

interface ResizeObserverHandle {
  observe(target: Element): void;
  disconnect(): void;
}

export interface LivingCanvasDependencies {
  devicePixelRatio: number;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(handle: number): void;
  createResizeObserver?: (callback: () => void) => ResizeObserverHandle;
}

export interface LivingParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

const particleCount = 10;
const noopController: LivingCanvasController = { dispose() {} };

export const createLivingParticles = (): LivingParticle[] =>
  Array.from({ length: particleCount }, (_, index) => ({
    x: (index * 0.097) % 1,
    y: (index * 0.173) % 1,
    radius: 3 + (index % 4),
    speed: 0.000015 + (index % 3) * 0.000004,
  }));

export function createLivingCanvasController(
  canvas: HTMLCanvasElement,
  dependencies: LivingCanvasDependencies,
): LivingCanvasController {
  const context = canvas.getContext('2d');
  if (!context) return noopController;

  const particles = createLivingParticles();
  let frame: number | undefined;
  let previous = 0;
  let disposed = false;
  let observer: ResizeObserverHandle | undefined;

  const clearOutput = () => {
    try { context.clearRect(0, 0, canvas.width, canvas.height); } catch {}
    try { canvas.width = 1; } catch {}
    try { canvas.height = 1; } catch {}
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    if (frame !== undefined) {
      try { dependencies.cancelFrame(frame); } catch {}
      frame = undefined;
    }
    try { observer?.disconnect(); } catch {}
    clearOutput();
  };

  const resize = () => {
    const ratio = Math.min(Math.max(dependencies.devicePixelRatio || 1, 1), 2);
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = (time: number) => {
    if (disposed) return;
    frame = undefined;
    const delta = Math.min(32, time - previous || 16);
    previous = time;
    const { width, height } = canvas.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgba(250, 108, 71, 0.28)';
    for (const particle of particles) {
      particle.y = (particle.y + particle.speed * delta) % 1;
      context.beginPath();
      context.ellipse(
        particle.x * width,
        particle.y * height,
        particle.radius,
        particle.radius * 1.45,
        0.55,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    try {
      frame = dependencies.requestFrame(draw);
    } catch {
      cleanup();
    }
  };

  const observedResize = () => {
    if (disposed) return;
    try {
      resize();
    } catch {
      cleanup();
    }
  };

  try {
    observer = dependencies.createResizeObserver?.(observedResize);
    observer?.observe(canvas);
    if (disposed) return noopController;
    resize();
    frame = dependencies.requestFrame(draw);
  } catch {
    cleanup();
    return noopController;
  }

  return {
    dispose: cleanup,
  };
}

export function mountLivingCanvas(canvas: HTMLCanvasElement): LivingCanvasController {
  const requestFrame = globalThis.requestAnimationFrame?.bind(globalThis);
  const cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis);
  if (!requestFrame || !cancelFrame) return noopController;

  return createLivingCanvasController(canvas, {
    devicePixelRatio: globalThis.devicePixelRatio || 1,
    requestFrame,
    cancelFrame,
    createResizeObserver: typeof ResizeObserver === 'undefined'
      ? undefined
      : (callback) => new ResizeObserver(callback),
  });
}
