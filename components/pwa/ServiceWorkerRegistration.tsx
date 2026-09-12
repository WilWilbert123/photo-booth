'use client';

import { useEffect } from 'react';
import { useOffline } from '@/hooks/useOffline';

export const ServiceWorkerRegistration = () => {
  useOffline();
  return null;
};
