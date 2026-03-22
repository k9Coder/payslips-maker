import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';

/**
 * Syncs the Clerk-authenticated user to the MongoDB database.
 * Called once on first sign-in to handle webhook race conditions.
 */
export function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { postSync } = useApiClient();
  const queryClient = useQueryClient();
  const synced = useRef(false);

  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') return;
    if (!isSignedIn || !user || synced.current) return;

    const sync = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress ?? '';
        const fullName = user.fullName ?? email;
        await postSync(email, fullName);
        synced.current = true;
        // Invalidate currentUser query so it refetches with the new DB entry
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } catch {
        // Silently fail - webhook may have already created the user
      }
    };

    sync();
  }, [isSignedIn, user, postSync, queryClient]);
}
