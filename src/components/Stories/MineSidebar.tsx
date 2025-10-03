"use client";
import React from 'react';
import Link from 'next/link';
import Button from '@/components/Editor/Shared/Button';
import { useState } from 'react';
import ImportModal from '@/components/Stories/ImportModal';
import { useRouter } from 'next/navigation';
import SidebarShell from '@/components/Editor/Sidebar/SidebarShell';

interface Props {
  storiesCount: number;
  onImported?: () => void;
  onClear?: () => void;
}

export default function MineSidebar({ storiesCount, onImported, onClear }: Props) {
  const [openImport, setOpenImport] = useState(false);
  const router = useRouter();
  return (
    <SidebarShell header={<div className="mb-4"><span className="text-sm font-semibold text-gray-700 uppercase">Your books</span></div>}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-800 mb-2">Stories</label>
        <div className="text-lg font-bold text-gray-900">{storiesCount}</div>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-800 mb-2">Actions</label>
        <div className="flex flex-col gap-2">
          <Link href="/story/new">
            <Button className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-gray-800 text-center">Create story</Button>
          </Link>
          <Button onClick={() => setOpenImport(true)} className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-gray-800 text-left">Import stories</Button>
          {onClear && (
            <Button onClick={onClear} className="text-sm bg-red-50 border border-red-300 px-3 py-2 rounded text-red-700 text-left hover:bg-red-100">Clear all stories</Button>
          )}
          <ImportModal open={openImport} onClose={() => setOpenImport(false)} onImported={() => {
            setOpenImport(false);
            // notify parent (page) to refresh its data; fallback to router.refresh()
            try {
              if (typeof onImported === 'function') onImported();
              else router.refresh();
            } catch { /* ignore */ }
          }} />
        </div>
      </div>
    </SidebarShell>
  );
}
