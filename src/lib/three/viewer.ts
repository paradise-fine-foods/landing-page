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

type RenderableObject = Object3D & {
  geometry?: BufferGeometry;
  material?: Material | Material[];
};

function disposeObject(root: Object3D) {
  const textures = new Set<Texture>();
  const materials = new Set<Material>();

  root.traverse((object) => {
    const renderable = object as RenderableObject;
    renderable.geometry?.dispose();
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

  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}

export function mountProductViewer({ canvas, modelSrc, onReady, onError }: ViewerOptions): ViewerController {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.01, 100);
  const loader = new GLTFLoader();
  const modelBounds = new Box3();
  const modelSize = new Vector3();
  const modelCenter = new Vector3();
  let model: Object3D | undefined;
  let disposed = false;
  let renderFrame = 0;
  let pointerId: number | undefined;
  let pointerStartX = 0;
  let rotationStart = 0;

  canvas.style.touchAction = 'pan-y';
  renderer.setClearColor(0xffffff, 0);
  scene.add(new AmbientLight(0xffffff, 1.8));
  const keyLight = new DirectionalLight(0xffffff, 3.6);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  const fillLight = new DirectionalLight(0xcfe3ef, 1.2);
  fillLight.position.set(-4, 1, 2);
  scene.add(fillLight);

  const requestRender = () => {
    if (disposed || renderFrame) return;
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      if (!disposed) renderer.render(scene, camera);
    });
  };

  const resize = () => {
    if (disposed) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO));
    renderer.setSize(Math.round(width), Math.round(height), false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const onPointerDown = (event: PointerEvent) => {
    if (!model || !event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    rotationStart = model.rotation.y;
    canvas.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!model || pointerId !== event.pointerId) return;
    const width = Math.max(canvas.clientWidth, 1);
    const delta = (event.clientX - pointerStartX) / width * (MAX_ROTATION_RADIANS * 2);
    model.rotation.y = Math.max(-MAX_ROTATION_RADIANS, Math.min(MAX_ROTATION_RADIANS, rotationStart + delta));
    requestRender();
  };
  const endPointer = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    pointerId = undefined;
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    onError();
    dispose(false);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('webglcontextlost', onContextLost);

  const dispose = (releaseContext = true) => {
    if (disposed) return;
    disposed = true;
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', endPointer);
    canvas.removeEventListener('pointercancel', endPointer);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    if (renderFrame) cancelAnimationFrame(renderFrame);
    if (model) disposeObject(model);
    renderer.dispose();
    if (releaseContext) renderer.forceContextLoss();
  };

  resize();
  loader.load(
    modelSrc,
    ({ scene: loadedModel }) => {
      if (disposed) {
        disposeObject(loadedModel);
        return;
      }

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
      requestRender();
      onReady();
    },
    undefined,
    () => {
      if (disposed) return;
      onError();
      dispose();
    },
  );

  return { dispose };
}
