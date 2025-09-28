"use client";
import { useState } from 'react';
import Button from '@/components/Editor/Shared/Button';

async function detectUserId(): Promise<string | null> {
  try {
    // @ts-ignore
    const cl = (window as any).Clerk;
    if (cl && cl.user) return cl.user.id;
    // @ts-ignore
    if ((window as any).__USER_ID__) return (window as any).__USER_ID__;
    return null;
  } catch (err) {
    return null;
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ImportModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const userId = await detectUserId();
      if (userId) headers['x-user-id'] = String(userId);
      if (dryRun) headers['x-dry-run'] = '1';

      const res = await fetch('/api/stories/import', { method: 'POST', body: fd, headers });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Import stories modal">
      <div className="absolute inset-0 bg-black opacity-20" onClick={onClose}></div>
      <div className="bg-white rounded shadow-lg z-10 w-full max-w-2xl p-6 ring-1 ring-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Import stories</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">JSON file</label>
            <input className="mt-1" type="file" accept="application/json" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div className="flex items-center">
            <input id="dry" type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="mr-2" />
            <label htmlFor="dry" className="text-sm">Dry run (validate only)</label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
              {submitting ? 'Importing…' : 'Run import'}
            </Button>
            <Button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-200">Close</Button>
          </div>
        </form>

        {result && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded">
            <pre className="text-sm whitespace-pre-wrap text-gray-900">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
