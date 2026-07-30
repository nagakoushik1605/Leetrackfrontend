import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  Swords,
  Search,
  RefreshCw,
  Menu,
  X,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsername } from '@/hooks/useUsernameContext';
import { useAuth } from '@/hooks/useAuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/problems', label: 'Problems Solved', icon: BarChart3 },
  { to: '/contests', label: 'Contests', icon: Swords },
];

export default function Navbar() {
  const { username, setUsername } = useUsername();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // Order matters: sign out of Supabase first, then clear the
      // locally-tracked LeetCode username and any cached query data, then
      // navigate. Clearing local state *before* the Supabase call resolved
      // was the root cause of "logout doesn't work on next login" — a
      // stale session could get restored on remount and silently
      // re-authenticate the user right after they'd "logged out".
      await signOut();
      setUsername(null);
      queryClient.clear();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setSearchValue('');
    setSearchOpen(false);
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-base-border/80 bg-base-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-orange shadow-glow">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              LeetCode<span className="text-brand-purpleLight">Tracker</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-[1px] left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-orange"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="hidden overflow-hidden sm:block"
              >
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search username"
                  className="w-full rounded-lg border border-base-border bg-base-charcoal px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-purple"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="btn-ghost !px-2.5 !py-2.5"
            aria-label="Search username"
            title="Search username"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="btn-ghost !px-2.5 !py-2.5"
            aria-label="Refresh profile"
            title="Refresh profile"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-orange text-sm font-bold text-white sm:flex">
            {username ? username.slice(0, 2).toUpperCase() : '??'}
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-ghost hidden !px-2.5 !py-2.5 sm:inline-flex"
            aria-label="Log out"
            title="Log out"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          </button>

          <button
            className="btn-ghost !px-2.5 !py-2.5 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-base-border/80 bg-base-black/95 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? 'bg-brand-purple/15 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <form onSubmit={handleSearch} className="pt-2">
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search username"
                  className="w-full rounded-lg border border-base-border bg-base-charcoal px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-purple"
                />
              </form>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
              >
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Log out
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
