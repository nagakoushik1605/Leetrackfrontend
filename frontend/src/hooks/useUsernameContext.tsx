import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuthContext';

interface UsernameContextValue {
  username: string | null;
  setUsername: (username: string | null) => void;
}

const STORAGE_KEY = 'leetcode-tracker:username';

const UsernameContext = createContext<UsernameContextValue | undefined>(undefined);

export function UsernameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // sessionStorage is only used as an instant-paint cache so the UI doesn't
  // flash empty while the profile row is being fetched from Supabase. The
  // profiles table (keyed by user id) is the source of truth once a user is
  // signed in.
  const [username, setUsernameState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Tracks which user id the cached/local `username` value belongs to, so we
  // don't show one account's username while another account's profile is
  // still loading right after switching users.
  const loadedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Signed out — nothing to show.
      loadedForUserId.current = null;
      setUsernameState(null);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    if (loadedForUserId.current === user.id) return;

    let cancelled = false;

    supabase
      .from('profiles')
      .select('leetcode_username')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        loadedForUserId.current = user.id;
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load saved LeetCode username:', error.message);
          return;
        }
        const saved = data?.leetcode_username ?? null;
        setUsernameState(saved);
        try {
          if (saved) sessionStorage.setItem(STORAGE_KEY, saved);
          else sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setUsername = useCallback(
    (next: string | null) => {
      setUsernameState(next);
      try {
        if (next) sessionStorage.setItem(STORAGE_KEY, next);
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // sessionStorage unavailable — non-fatal, in-memory state still works
      }

      // Persist to the account so it's there next time this user logs in
      // from any device/browser. Fire-and-forget: the UI already reflects
      // the change optimistically above.
      if (user) {
        supabase
          .from('profiles')
          .upsert(
  {
    id: user.id,
    email: user.email,
    leetcode_username: next?.trim().toLowerCase() ?? null,
  },
  { onConflict: 'id' }
)
          .then(({ error }) => {
            if (error) {
              // eslint-disable-next-line no-console
              console.error('Failed to save LeetCode username:', error.message);
            }
          });
      }
    },
    [user]
  );

  return (
    <UsernameContext.Provider value={{ username, setUsername }}>
      {children}
    </UsernameContext.Provider>
  );
}

export function useUsername() {
  const ctx = useContext(UsernameContext);
  if (!ctx) throw new Error('useUsername must be used within a UsernameProvider');
  return ctx;
}
