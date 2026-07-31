import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Swords, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useUsername } from '@/hooks/useUsernameContext';
import { verifyUsername, ApiError } from '@/api/client';
import PageTransition from '@/components/PageTransition';

export default function Auth() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once sign-in/sign-up succeeds; we hold off on saving the username
  // and navigating away until `session` below actually reflects it.
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  const { signInWithUsername, session } = useAuth();
  const { setUsername } = useUsername();
  const navigate = useNavigate();
  const location = useLocation();
  const from = '/dashboard';

  // This effect is the fix for the "blank page until refresh" bug: calling
  // navigate() right after signInWithUsername() resolved was too early —
  // Supabase's session update reaches this app's React state a tick later
  // via onAuthStateChange, so the dashboard could mount before there was a
  // session for it to use. Waiting for `session` to actually be set here
  // guarantees the rest of the app has what it needs before we navigate.
  useEffect(() => {
    if (session && pendingUsername) {
      setUsername(pendingUsername);
      navigate(from, { replace: true });
    }
  }, [session, pendingUsername, setUsername, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // Make sure it's a real LeetCode username before creating/using an
      // account for it.
      const { exists } = await verifyUsername(trimmed);
      if (!exists) {
        setError('LeetCode username not found. Please enter a valid username.');
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('LeetCode username not found. Please enter a valid username.');
        } else if (err.status === 0) {
          setError(
            "Can't reach the backend server. Make sure it's running (npm run dev in /backend) on the expected port."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong while verifying your username. Please try again.');
      }
      setLoading(false);
      return;
    }

    const result = await signInWithUsername(trimmed);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Don't navigate yet — the effect above handles it once `session` is
    // confirmed, so the dashboard never mounts before it's ready.
    setPendingUsername(trimmed);
  };

  return (
    <PageTransition>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade" />
        <motion.div
          className="pointer-events-none absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-brand-purple/25 blur-[100px]"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[10%] right-[12%] h-80 w-80 rounded-full bg-brand-orange/20 blur-[110px]"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-orange shadow-glow"
            >
              <Swords className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              Welcome
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your LeetCode username to continue. No email or password needed — your
              username is your account.
            </p>
          </div>

          <div className="glass-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="leetcode-username" className="mb-1.5 block text-xs font-medium text-slate-400">
                  LeetCode Username
                </label>
                <input
                  id="leetcode-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. neal_wu"
                  className="w-full rounded-xl border border-base-border bg-base-charcoal px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-brand-purple"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
