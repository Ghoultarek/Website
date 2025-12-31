import { HTMLAttributes, ReactNode } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: 'white' | 'gray';
}

export default function Section({ 
  children, 
  background = 'white',
  className = '',
  ...props 
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
  };

  const baseClasses = 'py-6';
  const classes = `${baseClasses} ${backgroundClasses[background]} ${className}`;

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

