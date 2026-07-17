export interface MotionPreferences {
  reduceMotion: boolean;
  saveData: boolean;
}

export const shouldEnhanceMotion = ({ reduceMotion, saveData }: MotionPreferences): boolean =>
  !reduceMotion && !saveData;

export const shouldDisposePage = (event: Event | Pick<PageTransitionEvent, 'persisted'>): boolean =>
  !('persisted' in event && event.persisted);
