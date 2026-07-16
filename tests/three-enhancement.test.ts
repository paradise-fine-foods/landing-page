import { expect, test } from 'bun:test';
import { shouldEnhance3D } from '../src/lib/three/enhancement';

test.each([
  [{ saveData: false, reducedMotion: false, webglAvailable: true }, true],
  [{ saveData: true, reducedMotion: false, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: true, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: false, webglAvailable: false }, false],
])('3D eligibility %o => %s', (input, expected) => {
  expect(shouldEnhance3D(input)).toBe(expected);
});
