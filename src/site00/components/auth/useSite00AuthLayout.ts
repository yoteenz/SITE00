import { useEffect, useState } from 'react';

const DESKTOP_AUTH_MQ = '(min-width: 1024px)';

/** Match site00-auth.css — only one sign-in form in DOM (avoids autofill targeting hidden desktop fields on mobile). */
export function useSite00AuthLayout(): 'desktop' | 'mobile' {
  const [layout, setLayout] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window === 'undefined') return 'mobile';
    return window.matchMedia(DESKTOP_AUTH_MQ).matches ? 'desktop' : 'mobile';
  });

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_AUTH_MQ);
    const onChange = () => setLayout(mq.matches ? 'desktop' : 'mobile');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return layout;
}
