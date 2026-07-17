export interface MotionPreferences {
  reduceMotion: boolean;
  saveData: boolean;
}

export const shouldEnhanceMotion = ({ reduceMotion, saveData }: MotionPreferences): boolean =>
  !reduceMotion && !saveData;
