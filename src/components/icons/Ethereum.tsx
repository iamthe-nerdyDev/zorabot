import React from 'react';

export default function Ethereum({
  width,
  height,
  className,
  fill,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      width={width || 50}
      height={height || 50}
      viewBox="0 0 24 24"
      role="img"
      className={className}
      fill={fill || 'currentColor'}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  );
}
