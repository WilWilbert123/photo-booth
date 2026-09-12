import { useState, useEffect, useCallback } from 'react';
import { StorageQuotaInfo } from '@/types/storage';
import { getStorageQuota } from '@/lib/storage/migrations';

export function useStorageQuota() {
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo>({
    usageBytes: 0,
    quotaBytes: 0,
    usagePercentage: 0,
    formattedUsage: '0 MB',
    formattedQuota: 'Unknown',
  });

  const refreshQuota = useCallback(async () => {
    const info = await getStorageQuota();
    setQuotaInfo(info);
  }, []);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  return {
    ...quotaInfo,
    refreshQuota,
  };
}
