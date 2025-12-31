'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'CV' },
    { href: '/publications', label: 'Publications' },
    { href: '/tools', label: 'Interactive Tools' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-gray-800 dark:bg-gray-800 sticky top-0 z-50 py-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-10">
        <div className="flex flex-row items-center justify-between bg-white dark:bg-[#171717] border border-neutral-400/20 dark:border-neutral-600/10 rounded-3xl p-1.5 text-sm text-neutral-500">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 flex-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="py-[8px] px-6 dark:hover:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:text-white hover:text-black rounded-full text-base font-normal text-start text-black dark:text-white">
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="relative flex sm:hidden items-center">
            <button
              className="py-1.5 px-4 dark:hover:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:text-white hover:text-black rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-7 h-7 text-black dark:text-neutral-200"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12.5h16.5m-16.5 6.5h16.5" />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <div className="bg-white dark:bg-dark border border-neutral-400/20 dark:border-neutral-600/10 rounded-3xl p-4 shadow-lg min-w-[200px]">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 px-4 dark:hover:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:text-white hover:text-black rounded-full text-base font-normal text-start text-black dark:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}





