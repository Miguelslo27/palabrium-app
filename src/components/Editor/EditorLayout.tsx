"use client";
import React from 'react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-white">{children}</div>
  );
}
