import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export default function Card({ 
  children, 
  interactive = false,
  className = '',
  ...props 
}: CardProps) {
  const baseClasses = 'bg-white border border-gray-200 p-6 rounded-3xl shadow-sm';
  const interactiveClasses = interactive 
    ? 'hover:shadow-md transition-shadow duration-150 cursor-pointer' 
    : '';
  
  const classes = `${baseClasses} ${interactiveClasses} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

