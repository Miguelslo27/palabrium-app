"use client";
import React from 'react';

type Props = {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
};

export default function EditorForm({ onSubmit, children }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
        {children}
      </form>
    </div>
  );
}
