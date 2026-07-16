import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { shouldEnhance3D } from '../src/lib/three/enhancement';

const stageSource = readFileSync(resolve(import.meta.dir, '../src/components/three/ProductStage.astro'), 'utf8');
const viewerSource = readFileSync(resolve(import.meta.dir, '../src/lib/three/viewer.ts'), 'utf8');

test.each([
  [{ saveData: false, reducedMotion: false, webglAvailable: true }, true],
  [{ saveData: true, reducedMotion: false, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: true, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: false, webglAvailable: false }, false],
])('3D eligibility %o => %s', (input, expected) => {
  expect(shouldEnhance3D(input)).toBe(expected);
});

test('activates only at the viewport boundary or through intentional interaction', () => {
  expect(stageSource).toContain("rootMargin: '0px'");
  expect(stageSource).toContain("this.addEventListener('focusin'");
  expect(stageSource).toContain("this.addEventListener('pointerenter'");
  expect(stageSource).toContain("this.addEventListener('pointerdown'");
  expect(stageSource).not.toContain("rootMargin: '160px'");
});

test('keeps Three.js and the model behind the activation boundary', () => {
  expect(stageSource).toContain("import('../../lib/three/viewer')");
  expect(stageSource).not.toContain("import('@google/model-viewer')");
  expect(stageSource).not.toMatch(/<model-viewer\b/);
  expect(stageSource).toContain('data-model-src={modelSrc}');
});

test('uses the supported minimal Three.js loader without general orbit controls', () => {
  expect(viewerSource).toContain("from 'three'");
  expect(viewerSource).toContain("from 'three/addons/loaders/GLTFLoader.js'");
  expect(viewerSource).not.toContain('OrbitControls');
});

test('bounds interaction, preserves scrolling, and handles failure paths', () => {
  expect(viewerSource).toContain('MAX_ROTATION_DEGREES = 18');
  expect(viewerSource).toContain("canvas.style.touchAction = 'pan-y'");
  expect(viewerSource).toContain("canvas.addEventListener('webglcontextlost'");
  expect(viewerSource).toContain('onError');
});

test('owns resize, animation, listener, and WebGL resource cleanup', () => {
  expect(viewerSource).toContain('new ResizeObserver');
  expect(viewerSource).toContain('cancelAnimationFrame');
  expect(viewerSource).toContain('geometry?.dispose()');
  expect(viewerSource).toContain('material.dispose()');
  expect(viewerSource).toContain('renderer.dispose()');
  expect(viewerSource).toContain('renderer.forceContextLoss()');
  expect(stageSource).toContain('disconnectedCallback()');
});
