"use client";
import React from 'react';

interface EditorHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function EditorHeader({ title, children }: EditorHeaderProps) {
  return (
    <div className="p-6 bg-gray-200/70 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
