'use client';

import React, { useEffect, useState } from 'react';

export const FlashOverlay: React.FC = () => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white pointer-events-none transition-opacity duration-200 animate-out fade-out" />
  );
};
