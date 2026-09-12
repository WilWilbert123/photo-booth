export interface StorageQuotaInfo {
  usageBytes: number;
  quotaBytes: number;
  usagePercentage: number;
  formattedUsage: string;
  formattedQuota: string;
}

export interface UserSettings {
  defaultMode: string;
  defaultEffectId: string;
  defaultCountdown: number;
  soundEnabled: boolean;
  flashEnabled: boolean;
  poseGuideEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  preferredResolution: string;
  autoSaveToDevice: boolean;
}
