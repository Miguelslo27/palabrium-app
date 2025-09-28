"use client";
import React from 'react';

type Props = {
  // Pass full Tailwind classes literally to avoid purge issues.
  // Example: 'bg-gradient-to-r from-blue-50 to-white'
  gradientClass?: string;
  // Optional border class, e.g. 'border-blue-100'
  borderClass?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function Hero({
  gradientClass = 'bg-gradient-to-r from-blue-50 to-white',
  borderClass = 'border-blue-100',
  children,
  className = '',
}: Props) {
  return (
    <div className={`${gradientClass} ${borderClass} rounded-lg p-6 mb-6 ${className}`}>
      {children}
    </div>
  );
}
