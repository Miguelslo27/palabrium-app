import React from 'react';

type Props = {
  title: string;
  description: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
};

export default function MetadataForm({ title, description, setTitle, setDescription }: Props) {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-800 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 h-40 resize-none"
          required
        />
      </div>
    </div>
  );
}
