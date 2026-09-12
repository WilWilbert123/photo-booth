import { StorageQuotaInfo } from '@/types/storage';

export async function getStorageQuota(): Promise<StorageQuotaInfo> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return {
      usageBytes: 0,
      quotaBytes: 0,
      usagePercentage: 0,
      formattedUsage: '0 MB',
      formattedQuota: 'Unknown',
    };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    const formattedUsage = (usage / (1024 * 1024)).toFixed(1) + ' MB';
    const formattedQuota = (quota / (1024 * 1024 * 1024)).toFixed(1) + ' GB';

    return {
      usageBytes: usage,
      quotaBytes: quota,
      usagePercentage: parseFloat(percentage.toFixed(1)),
      formattedUsage,
      formattedQuota,
    };
  } catch {
    return {
      usageBytes: 0,
      quotaBytes: 0,
      usagePercentage: 0,
      formattedUsage: '0 MB',
      formattedQuota: 'Unknown',
    };
  }
}
