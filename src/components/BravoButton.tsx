'use client';

import { useState, useEffect } from 'react';
import getClientUserId from '@/lib/getClientUserId';

interface BravoButtonProps {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
  onToggle?: (bravos: number, braved: boolean) => void;
  braved?: boolean;
}

export default function BravoButton({ storyId, initialBravos, userBravos, onToggle, braved: controlledBraved }: BravoButtonProps) {
  const [bravos, setBravos] = useState(initialBravos);
  const [userId, setUserId] = useState<string | null>(null);
  const [internalBraved, setInternalBraved] = useState(false);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      setUserId(id);
      setInternalBraved(id ? userBravos.includes(id) : false);
    });
    return () => { mounted = false; };
  }, [userBravos]);

  const handleBravo = async () => {
    try {
      const headers: Record<string, string> = {};
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch(`/api/stories/${storyId}/bravo`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Bravo POST failed', res.status, text);
        // minimal user feedback for dev/testing; replace with nicer UI later
        // do not update UI if server returned error
        alert(text || `Request failed: ${res.status}`);
        return;
      }
  const data = await res.json();
  setBravos(data.bravos);
  // if parent controls braved via prop, parent will update it via onToggle; otherwise update internal state
  if (typeof controlledBraved === 'undefined') setInternalBraved(data.braved);
  if (typeof onToggle === 'function') onToggle(data.bravos, data.braved);
    } catch (err) {
      console.error('Bravo toggle error', err);
      alert('Error al enviar Bravo. Revisa la consola.');
    }
  };

  return (
    <button
      onClick={handleBravo}
      disabled={!userId}
      className={`px-4 py-2 rounded ${((typeof controlledBraved !== 'undefined') ? controlledBraved : internalBraved) ? 'bg-yellow-500 text-white' : 'bg-gray-200'} ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {!userId && <>...</>}
      {userId && (<>{((typeof controlledBraved !== 'undefined') ? controlledBraved : internalBraved) ? 'Bravos' : 'Bravo'} ({bravos})</>)}
    </button>
  );
}
