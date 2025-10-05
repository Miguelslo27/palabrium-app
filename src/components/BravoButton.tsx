'use client';

import { useOptimistic, useTransition } from 'react';
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
  
  // Optimistic state for instant UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    { bravos: initialBravos, braved: isBraved },
    (state, newBraved: boolean) => ({
      bravos: newBraved ? state.bravos + 1 : state.bravos - 1,
      braved: newBraved,
    })
  );

  const handleBravo = () => {
    if (!userId) return;

    const newBraved = !optimisticState.braved;
    
    startTransition(async () => {
      // Update UI optimistically INSIDE the transition
      setOptimisticState(newBraved);
      
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
        alert('Error al enviar Bravo. Por favor intenta de nuevo.');
      }
    });
  };

  return (
    <button
      onClick={handleBravo}
      disabled={!userId || isPending}
      className={`px-4 py-2 rounded transition-colors ${
        optimisticState.braved 
          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
          : 'bg-gray-200 hover:bg-gray-300'
      } ${!userId || isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {!userId && <>Bravo</>}
      {userId && (
        <>
          {optimisticState.braved ? 'Bravos' : 'Bravo'} ({optimisticState.bravos})
        </>
      )}
    </button>
  );
}
