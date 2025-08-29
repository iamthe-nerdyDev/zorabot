'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type SmartImageProps = React.ComponentProps<'img'> & {
  loaderClassName?: string;
  fallbackSrc?: string;
};

const GLOBAL_IMAGE_CACHE = new Set<string | Blob>();

function SmartImageImpl({
  src,
  className,
  loaderClassName,
  fallbackSrc = '/notfound.png',
  ...props
}: SmartImageProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);

  const isCached = !!src && GLOBAL_IMAGE_CACHE.has(src);
  const [loading, setLoading] = React.useState<boolean>(() => (src && !isCached ? true : false));
  const [error, setError] = React.useState(false);
  const [showSpinner, setShowSpinner] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }

    const t = setTimeout(() => setShowSpinner(true), 120);
    return () => clearTimeout(t);
  }, [loading]);

  React.useEffect(() => {
    if (!src) return;
    setError(false);
    // --
    if (GLOBAL_IMAGE_CACHE.has(src)) setLoading(false);
    else setLoading(true);
  }, [src]);

  React.useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    // --
    if (img.complete && img.naturalWidth > 0) {
      if (src) GLOBAL_IMAGE_CACHE.add(src);
      setLoading(false);
    }
  }, [src]);

  const handleLoad = () => {
    if (src) GLOBAL_IMAGE_CACHE.add(src);
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', loaderClassName)}>
      {showSpinner && !error && (
        <Loader2 className="animate-spin size-3 absolute opacity-60" strokeWidth={2} />
      )}

      <img
        ref={imgRef}
        src={error ? fallbackSrc : src}
        className={cn(
          className,
          loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'
        )}
        decoding="async"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

export default React.memo(SmartImageImpl);
