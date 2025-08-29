'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type SmartImageProps = React.ComponentProps<'img'> & {
  loaderClassName?: string;
  fallbackSrc?: string;
};

export default function SmartImage({
  src,
  className,
  loaderClassName,
  fallbackSrc = '/notfound.png',
  ...props
}: SmartImageProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (loading) {
  }

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', loaderClassName)}>
      {loading && !error && (
        <Loader2 className="animate-spin size-3 absolute opacity-60" strokeWidth={2} />
      )}

      <img
        src={error ? fallbackSrc : src}
        className={cn(
          className,
          loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
