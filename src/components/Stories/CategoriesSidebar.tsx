"use client";
import React from 'react';
import SidebarShell from '@/components/Editor/Sidebar/SidebarShell';
import Button from '@/components/Editor/Shared/Button';

const SAMPLE_CATEGORIES = ['All', 'Fiction', 'Sci‑Fi', 'Poetry', 'Non‑fiction'];

export default function CategoriesSidebar() {
  return (
    <SidebarShell header={<div className="mb-4"><span className="text-sm font-semibold text-gray-700 uppercase">Categories</span></div>}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-800 mb-2">Browse by</label>
        <div className="flex flex-col gap-2">
          {SAMPLE_CATEGORIES.map((c) => (
            <Button key={c} className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-gray-800 text-left" onClick={() => { /* future: filter by category */ }}>
              {c}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-auto text-xs text-gray-500">Categories are placeholders — coming soon.</div>
    </SidebarShell>
  );
}
