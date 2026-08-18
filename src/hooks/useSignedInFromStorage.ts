import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

/**
 * Keeps React `isSignedIn` aligned with `localStorage` (`isSignedIn` / `signInStateChanged`),
 * including on first paint (BAW sub-pages used to mount with `false` and never refresh).
 */
export function useSignedInFromStorage(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('isSignedIn') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const check = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn((prev) => (prev !== signedIn ? signedIn : prev));
      } catch {
        setIsSignedIn(false);
      }
    };
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    window.addEventListener('signInStateChanged', check as EventListener);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
      window.removeEventListener('signInStateChanged', check as EventListener);
    };
  }, []);

  return [isSignedIn, setIsSignedIn];
}
