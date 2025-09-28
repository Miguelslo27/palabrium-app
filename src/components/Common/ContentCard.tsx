"use client";
import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function ContentCard({ children, className = '' }: Props) {
  return (
    <div className={`bg-white border border-gray-300 rounded shadow-sm min-h-0 flex flex-col ${className}`}>
      {children}
    </div>
  );
}
