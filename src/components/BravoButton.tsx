'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleBravoAction } from '@/app/actions';

interface BravoButtonProps {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
  userId: string | null;
  onToggle?: (bravos: number, braved: boolean) => void;
}

export default function BravoButton({
  storyId,
  initialBravos,
  userBravos,
  userId,
  onToggle
}: BravoButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isBraved = userId ? userBravos.includes(userId) : false;

  // Local state for optimistic updates
  const [optimisticBravos, setOptimisticBravos] = useState(initialBravos);
  const [optimisticBraved, setOptimisticBraved] = useState(isBraved);

  // Sync with props when they change (after server refresh)
  // Only update if we're not in the middle of a pending action
  useEffect(() => {
    if (!isPending) {
      setOptimisticBravos(initialBravos);
      setOptimisticBraved(isBraved);
    }
  }, [initialBravos, isBraved, isPending]);

  const handleBravo = () => {
    if (!userId || isPending) return;

    // Calculate the new state
    const newBraved = !isBraved;
    const newBravos = newBraved ? initialBravos + 1 : initialBravos - 1;

    // Update UI optimistically
    setOptimisticBraved(newBraved);
    setOptimisticBravos(newBravos);

    startTransition(async () => {
      try {
        const result = await toggleBravoAction(storyId);

        // Call onToggle callback if provided
        if (onToggle) {
          onToggle(result.bravos, result.braved);
        }

        // Refresh to get updated data from server
        router.refresh();
      } catch (error) {
        console.error('Bravo toggle error', error);
        // Revert optimistic update on error
        setOptimisticBraved(isBraved);
        setOptimisticBravos(initialBravos);
        alert('Error al enviar Bravo. Por favor intenta de nuevo.');
      }
    });
  };

  return (
    <button
      onClick={handleBravo}
      disabled={!userId || isPending}
      className={`px-4 py-2 rounded transition-colors ${optimisticBraved
        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
        : 'bg-gray-200 hover:bg-gray-300'
        } ${!userId || isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {!userId && <>Bravo</>}
      {userId && (
        <>
          {optimisticBraved ? 'Bravos' : 'Bravo'} ({optimisticBravos})
        </>
      )}
    </button>
  );
}
