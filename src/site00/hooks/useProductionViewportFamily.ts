import { useEffect, useState } from 'react';
import { productionViewportFamilyForWidth, type ProductionViewportFamily } from '../config/production-authority-registry';

function read(): ProductionViewportFamily {
  if (typeof window === 'undefined') return 'mobile';
  return productionViewportFamilyForWidth(window.innerWidth);
}

/** Viewport family for Production (mobile 9:16 / tablet 4:3 / desktop 16:9 authorities). */
export function useProductionViewportFamily(): ProductionViewportFamily {
  const [family, setFamily] = useState<ProductionViewportFamily>(read);
  useEffect(() => {
    const onResize = () => setFamily(read());
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return family;
}
