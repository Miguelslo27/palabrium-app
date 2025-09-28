"use client";

import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
  widthClass?: string; // e.g. 'w-72'
};

export default function StoriesSidebar({ children, className = '', widthClass = 'w-72' }: Props) {
  return (
    <aside className={`${widthClass} border-r border-gray-100 overflow-y-auto ${className}`}>
      {children}
    </aside>
  );
}
