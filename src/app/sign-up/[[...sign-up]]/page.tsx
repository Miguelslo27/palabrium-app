"use client";

import CustomSignUp from '@/components/CustomSignUp';
import { useState } from 'react';

export default function Page() {
  const [debug, setDebug] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="h-screen flex">
      <div className="flex-1 bg-gray-900 p-8 overflow-auto text-white">
        {/* Left column: debug panel */}
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Debug (dev only)</h2>
            <div>
              <button
                onClick={async () => {
                  try {
                    const txt = JSON.stringify(debug ?? {}, null, 2);
                    await navigator.clipboard.writeText(txt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (e) {
                    console.error('Copy failed', e);
                  }
                }}
                disabled={!debug}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow-lg border border-gray-700">
            <pre className="whitespace-pre-wrap text-sm font-mono text-white/90">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        </div>
      </div>
      <div className="flex-1 h-full">
        <CustomSignUp onDebug={(d) => setDebug(d)} />
      </div>
    </div>
  );
}