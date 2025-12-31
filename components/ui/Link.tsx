import NextLink from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  external?: boolean;
}

export default function Link({ 
  children, 
  href,
  external = false,
  className = '',
  ...props 
}: LinkProps) {
  const baseClasses = 'text-primary-600 hover:text-primary-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  const classes = `${baseClasses} ${className}`;

  if (external) {
    return (
      <a 
        href={href} 
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  );
}

