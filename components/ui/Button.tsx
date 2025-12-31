import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle';
  children: ReactNode;
  href?: string;
  external?: boolean;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  href,
  external = false,
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-3 py-2 text-base font-medium transition-colors duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow focus:ring-primary-500',
    secondary: 'bg-transparent text-primary-600 border border-gray-200 hover:bg-gray-50 focus:ring-primary-500',
    subtle: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-primary-500',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a 
          href={href} 
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

