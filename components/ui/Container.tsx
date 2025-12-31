import { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'narrow' | 'standard' | 'wide' | 'full';
}

export default function Container({ 
  children, 
  size = 'standard',
  className = '',
  ...props 
}: ContainerProps) {
  const sizeClasses = {
    narrow: 'max-w-content',
    standard: 'max-w-standard',
    wide: 'max-w-wide',
    full: 'max-w-full',
  };

  const baseClasses = 'mx-auto px-4';
  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

