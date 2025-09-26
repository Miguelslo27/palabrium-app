"use client";
import React from 'react';

type Props = {
  header?: React.ReactNode;
  children?: React.ReactNode;
};

export default function SidebarShell({ header, children }: Props) {
  return (
    <aside className="w-72 h-full bg-gray-50 p-6 border-r border-gray-300 flex flex-col overflow-y-auto">
      {header}
      {children}
    </aside>
  );
}
