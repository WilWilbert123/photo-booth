import { getDB } from './db';
import { UserSettings } from '@/types/storage';

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'PHOTO',
  defaultEffectId: 'normal',
  defaultCountdown: 3,
  soundEnabled: true,
  flashEnabled: true,
  poseGuideEnabled: false,
  theme: 'dark',
  preferredResolution: '1080p',
  autoSaveToDevice: false,
};

export async function getSettingsFromDB(): Promise<UserSettings> {
  try {
    const db = await getDB();
    const settings = await db.get('settings', 'user_preferences');
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsToDB(settings: Partial<UserSettings>): Promise<void> {
  const current = await getSettingsFromDB();
  const db = await getDB();
  await db.put('settings', { ...current, ...settings }, 'user_preferences');
}
