import { HTMLAttributes, ReactNode } from 'react';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level: 1 | 2 | 3 | 4;
}

export default function Heading({ 
  children, 
  level,
  className = '',
  ...props 
}: HeadingProps) {
  const levelClasses = {
    1: 'text-4xl font-bold text-gray-800 mb-2',
    2: 'text-3xl font-bold text-gray-800 mb-2',
    3: 'text-2xl font-semibold text-gray-800 mb-2',
    4: 'text-xl font-semibold text-gray-800 mb-2',
  };

  const classes = `${levelClasses[level]} ${className}`;

  if (level === 1) {
    return <h1 className={classes} {...props}>{children}</h1>;
  } else if (level === 2) {
    return <h2 className={classes} {...props}>{children}</h2>;
  } else if (level === 3) {
    return <h3 className={classes} {...props}>{children}</h3>;
  } else {
    return <h4 className={classes} {...props}>{children}</h4>;
  }
}

