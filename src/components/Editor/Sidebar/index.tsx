import React from 'react';
import MetadataForm from './MetadataForm';

type Props = {
  title: string;
  description: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
};

export default function Sidebar({ title, description, setTitle, setDescription }: Props) {
  return (
    <aside className="w-72 h-full bg-gray-50 p-6 border-r border-gray-300 flex flex-col overflow-y-auto">
      <div className="mb-4">
        <span className="text-sm font-semibold text-gray-700 uppercase">Your book</span>
      </div>
      <MetadataForm title={title} description={description} setTitle={setTitle} setDescription={setDescription} />
    </aside>
  );
}
