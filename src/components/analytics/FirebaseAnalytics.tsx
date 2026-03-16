'use client';

import { useEffect } from 'react';
import { getAnalytics } from 'firebase/analytics';
import app from '@/lib/firebase';

export default function FirebaseAnalytics() {
  useEffect(() => {
    getAnalytics(app);
  }, []);

  return null;
}
