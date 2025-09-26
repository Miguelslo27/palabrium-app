import React from 'react';
import MetadataForm from './MetadataForm';
import SidebarShell from './SidebarShell';

type Props = {
  title: string;
  description: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
};

export default function Sidebar({ title, description, setTitle, setDescription }: Props) {
  return (
    <SidebarShell header={<div className="mb-4"><span className="text-sm font-semibold text-gray-700 uppercase">Your book</span></div>}>
      <MetadataForm title={title} description={description} setTitle={setTitle} setDescription={setDescription} />
    </SidebarShell>
  );
}
