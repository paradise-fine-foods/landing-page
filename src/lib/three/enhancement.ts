export interface EnhancementSignals {
  saveData: boolean;
  reducedMotion: boolean;
  webglAvailable: boolean;
}

export function shouldEnhance3D({
  saveData,
  reducedMotion,
  webglAvailable,
}: EnhancementSignals): boolean {
  return !saveData && !reducedMotion && webglAvailable;
}
