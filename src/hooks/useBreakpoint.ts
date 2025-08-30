import { useEffect, useState } from 'react';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');

  useEffect(() => {
    const calcBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpoints['2xl']) return setBreakpoint('2xl');
      if (width >= breakpoints.xl) return setBreakpoint('xl');
      if (width >= breakpoints.lg) return setBreakpoint('lg');
      if (width >= breakpoints.md) return setBreakpoint('md');
      if (width >= breakpoints.sm) return setBreakpoint('sm');
      return setBreakpoint('base');
    };

    calcBreakpoint();
    window.addEventListener('resize', calcBreakpoint);
    return () => window.removeEventListener('resize', calcBreakpoint);
  }, []);

  return breakpoint;
}
