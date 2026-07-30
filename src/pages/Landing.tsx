import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { verifyUsername, ApiError } from '@/api/client';
import { useUsername } from '@/hooks/useUsernameContext';
import PageTransition from '@/components/PageTransition';

export default function Landing() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUsername } = useUsername();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const { exists } = await verifyUsername(trimmed);
      if (!exists) {
        setError('LeetCode username not found. Please enter a valid username.');
        setLoading(false);
        return;
      }
      setUsername(trimmed);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('LeetCode username not found. Please enter a valid username.');
        } else if (err.status === 0) {
          setError(
            "Can't reach the backend server. Make sure it's running (npm run dev in /backend) on the expected port."
          );
        } else {
          // Surface the backend's actual message (e.g. LeetCode rate-limited
          // or blocked the server, or the GraphQL schema changed) instead of
          // a generic string, so the real cause is visible.
          setError(err.message);
        }
      } else {
        setError('Something went wrong while verifying your username. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* ambient background elements */}
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
          className="relative z-10 w-full max-w-xl text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-orange shadow-glow"
          >
            <Swords className="h-8 w-8 text-white" />
          </motion.div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            LeetCode <span className="bg-gradient-to-r from-brand-purpleLight to-brand-orangeLight bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-slate-400">
            Track your coding journey with beautiful analytics, contest performance, and live LeetCode statistics.
          </p>

          <form onSubmit={handleSubmit} className="mt-10">
            <div className="glass-card flex flex-col gap-3 p-2 sm:flex-row sm:items-center">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter your LeetCode username"
                className="flex-1 rounded-xl bg-transparent px-4 py-3.5 text-white outline-none placeholder:text-slate-500"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !value.trim()} className="btn-primary w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">e.g. koushik123</p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mx-auto mt-4 flex max-w-md items-center gap-2 overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span>No signup</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>No password</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Just your username</span>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
