
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, this triggers the Next.js error overlay with context
      // Do not use console.error here to avoid double overlays
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
