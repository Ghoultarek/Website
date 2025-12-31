import { HTMLAttributes, ReactNode } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: 'white' | 'gray';
}

export default function Section({ 
  children, 
  background = 'gray',
  className = '',
  ...props 
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white dark:bg-[#0D0D0D]',
    gray: 'bg-beige-50 dark:bg-[#0D0D0D]',
  };

  const baseClasses = 'py-6';
  const classes = `${baseClasses} ${backgroundClasses[background]} ${className}`;

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

