import React, { useState } from 'react';
import { cn } from '../../lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const fallbackColors = [
  'bg-accent-primary',
  'bg-[var(--color-success)]',
  'bg-[var(--color-error)]',
  'bg-[var(--color-warning)]',
  'bg-[var(--color-info)]',
];

const getColorIndex = (text: string): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % fallbackColors.length;
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  const initials = fallback
    ? fallback
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : alt
        ? alt
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

  const colorClass = fallbackColors[getColorIndex(fallback || alt || '?')];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none',
        sizeStyles[size],
        !showImage && colorClass,
        className,
      )}
      title={alt || fallback || undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="font-semibold text-white leading-none">{initials}</span>
      )}
    </div>
  );
};
