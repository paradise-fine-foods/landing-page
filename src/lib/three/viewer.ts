import {
  AmbientLight,
  Box3,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { BufferGeometry, Material, Object3D, Texture } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const MAX_ROTATION_DEGREES = 18;
export const MODEL_LOAD_DEADLINE_MS = 5_000;

const MAX_ROTATION_RADIANS = MAX_ROTATION_DEGREES * Math.PI / 180;
const MAX_DEVICE_PIXEL_RATIO = 1.5;

interface ViewerOptions {
  canvas: HTMLCanvasElement;
  modelSrc: string;
  onReady: () => void;
  onError: () => void;
}

export interface ViewerController {
  dispose: () => void;
}

interface RendererLike {
  setClearColor: (color: number, alpha: number) => void;
  setPixelRatio: (ratio: number) => void;
  setSize: (width: number, height: number, updateStyle: boolean) => void;
  render: (scene: Scene, camera: PerspectiveCamera) => void;
  dispose: () => void;
  forceContextLoss: () => void;
}

interface LoaderLike {
  parse: (
    data: ArrayBuffer,
    path: string,
    onLoad: (gltf: { scene: Object3D }) => void,
    onError: (error: unknown) => void,
  ) => void;
}

interface ResizeObserverLike {
  observe: (target: Element) => void;
  disconnect: () => void;
}

interface FetchResponseLike {
  ok: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface ViewerDependencies {
  createRenderer: (canvas: HTMLCanvasElement) => RendererLike;
  createLoader: () => LoaderLike;
  createResizeObserver: (callback: () => void) => ResizeObserverLike;
  fetchModel: (url: string, init: { signal: AbortSignal }) => Promise<FetchResponseLike>;
  createAbortController: () => AbortController;
  setDeadline: (callback: () => void, milliseconds: number) => ReturnType<typeof setTimeout>;
  clearDeadline: (timer: ReturnType<typeof setTimeout>) => void;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  resolveModelBasePath: (modelSrc: string) => string;
  devicePixelRatio: () => number;
}

type RenderableObject = Object3D & {
  geometry?: BufferGeometry;
  material?: Material | Material[];
};

const defaultDependencies: ViewerDependencies = {
  createRenderer: (canvas) => new WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
  }),
  createLoader: () => new GLTFLoader(),
  createResizeObserver: (callback) => new ResizeObserver(callback),
  fetchModel: (url, init) => fetch(url, init),
  createAbortController: () => new AbortController(),
  setDeadline: (callback, milliseconds) => setTimeout(callback, milliseconds),
  clearDeadline: (timer) => clearTimeout(timer),
  requestFrame: (callback) => requestAnimationFrame(callback),
  cancelFrame: (handle) => cancelAnimationFrame(handle),
  resolveModelBasePath: (modelSrc) => new URL('.', new URL(modelSrc, document.baseURI)).href,
  devicePixelRatio: () => window.devicePixelRatio || 1,
};

function disposeObject(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const textures = new Set<Texture>();
  const materials = new Set<Material>();

  root.traverse((object) => {
    const renderable = object as RenderableObject;
    if (renderable.geometry) geometries.add(renderable.geometry);
    const objectMaterials = Array.isArray(renderable.material)
      ? renderable.material
      : renderable.material ? [renderable.material] : [];

    for (const material of objectMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value as Texture);
      }
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}

export function mountProductViewer(
  { canvas, modelSrc, onReady, onError }: ViewerOptions,
  dependencyOverrides: Partial<ViewerDependencies> = {},
): ViewerController {
  const dependencies = { ...defaultDependencies, ...dependencyOverrides };
  let renderer: RendererLike | undefined;
  let loader: LoaderLike | undefined;
  let abortController: AbortController | undefined;
  let resizeObserver: ResizeObserverLike | undefined;
  let scene: Scene | undefined;
  let camera: PerspectiveCamera | undefined;
  const modelBounds = new Box3();
  const modelSize = new Vector3();
  const modelCenter = new Vector3();
  let model: Object3D | undefined;
  let disposed = false;
  let errorReported = false;
  let listenersAttached = false;
  let renderFrame = 0;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let pointerId: number | undefined;
  let pointerStartX = 0;
  let rotationStart = 0;

  function clearLoadDeadline() {
    if (deadline === undefined) return;
    dependencies.clearDeadline(deadline);
    deadline = undefined;
  }

  function releasePointerCapture() {
    if (pointerId === undefined) return;
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId = undefined;
  }

  function dispose(releaseContext = true) {
    if (disposed) return;
    disposed = true;
    clearLoadDeadline();
    abortController?.abort();
    resizeObserver?.disconnect();
    releasePointerCapture();
    if (listenersAttached) {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      listenersAttached = false;
    }
    if (renderFrame) dependencies.cancelFrame(renderFrame);
    renderFrame = 0;
    if (model) {
      disposeObject(model);
      model = undefined;
    }
    renderer?.dispose();
    if (releaseContext) renderer?.forceContextLoss();
  }

  function fail(releaseContext = true) {
    if (disposed) return;
    try {
      if (!errorReported) {
        errorReported = true;
        onError();
      }
    } finally {
      dispose(releaseContext);
    }
  }

  function requestRender() {
    if (disposed || renderFrame) return;
    renderFrame = dependencies.requestFrame(() => {
      renderFrame = 0;
      if (!disposed && renderer && scene && camera) renderer.render(scene, camera);
    });
  }

  function resize() {
    if (disposed) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    if (!renderer || !camera) return;
    renderer.setPixelRatio(Math.min(dependencies.devicePixelRatio(), MAX_DEVICE_PIXEL_RATIO));
    renderer.setSize(Math.round(width), Math.round(height), false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }

  function onPointerDown(event: PointerEvent) {
    if (!model || !event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    rotationStart = model.rotation.y;
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (!model || pointerId !== event.pointerId) return;
    const width = Math.max(canvas.clientWidth, 1);
    const delta = (event.clientX - pointerStartX) / width * (MAX_ROTATION_RADIANS * 2);
    model.rotation.y = Math.max(-MAX_ROTATION_RADIANS, Math.min(MAX_ROTATION_RADIANS, rotationStart + delta));
    requestRender();
  }

  function endPointer(event: PointerEvent) {
    if (pointerId !== event.pointerId) return;
    releasePointerCapture();
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    fail(false);
  }

  const controller = { dispose: () => dispose() };

  try {
    renderer = dependencies.createRenderer(canvas);
    renderer.setClearColor(0xf7f8f4, 1);
    loader = dependencies.createLoader();
    abortController = dependencies.createAbortController();
    scene = new Scene();
    camera = new PerspectiveCamera(34, 1, 0.01, 100);
    canvas.style.touchAction = 'pan-y';
    scene.add(new AmbientLight(0xffffff, 1.8));
    const keyLight = new DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const fillLight = new DirectionalLight(0xcfe3ef, 1.2);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);

    resizeObserver = dependencies.createResizeObserver(resize);
    resizeObserver.observe(canvas);
    listenersAttached = true;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('webglcontextlost', onContextLost);

    resize();
    const createdDeadline = dependencies.setDeadline(() => {
      deadline = undefined;
      fail();
    }, MODEL_LOAD_DEADLINE_MS);
    if (disposed) dependencies.clearDeadline(createdDeadline);
    else deadline = createdDeadline;
    if (disposed) return controller;

    const modelRequest = dependencies.fetchModel(modelSrc, { signal: abortController.signal });
    void modelRequest
      .then((response) => {
        if (!response.ok) throw new Error('Model request failed');
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (disposed || !loader) return;
        loader.parse(
          buffer,
          dependencies.resolveModelBasePath(modelSrc),
          ({ scene: loadedModel }) => {
            if (disposed || !renderer || !scene || !camera) {
              disposeObject(loadedModel);
              return;
            }

            try {
              clearLoadDeadline();
              model = loadedModel;
              modelBounds.setFromObject(model).getSize(modelSize);
              modelBounds.getCenter(modelCenter);
              model.position.sub(modelCenter);
              const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z, 0.01);
              const distance = maxDimension / (2 * Math.tan(camera.fov * Math.PI / 360)) * 1.35;
              camera.near = Math.max(distance / 100, 0.01);
              camera.far = distance * 100;
              camera.position.set(0, maxDimension * 0.08, distance);
              camera.lookAt(0, 0, 0);
              camera.updateProjectionMatrix();
              scene.add(model);
              renderer.render(scene, camera);
              onReady();
            } catch {
              fail();
            }
          },
          () => fail(),
        );
      })
      .catch(() => fail());
  } catch {
    fail();
  }

  return controller;
}
