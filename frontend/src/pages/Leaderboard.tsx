import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Trophy, Medal } from 'lucide-react';
import { useUsername } from '@/hooks/useUsernameContext';
import { getProfile, getProblems, getContests } from '@/api/client';
import { supabase } from '@/lib/supabaseClient';
import PageTransition from '@/components/PageTransition';
import { Spinner } from '@/components/Loader';
import { LeaderboardEntry } from '@/types';

type SortKey = 'totalSolved' | 'rating' | 'ranking';

const PAGE_SIZE = 5;

export default function Leaderboard() {
  const { username } = useUsername();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalSolved');
  const [page, setPage] = useState(1);

  // Only people who have actually signed in to this app show up here — the
  // leaderboard is sourced from the `leaderboard_profiles` view, which
  // exposes just the leetcode_username of every registered account (no
  // email or other private fields).
  const [registeredUsernames, setRegisteredUsernames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('get_leaderboard_usernames')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load leaderboard members:', error.message);
          return;
        }
        const names = (data ?? [])
          .map((row: { leetcode_username: string | null }) => row.leetcode_username)
          .filter((n: string | null): n is string => Boolean(n));
        setRegisteredUsernames(names);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const usernames = useMemo(() => {
    const pool = new Set(registeredUsernames);
    if (username) pool.add(username);
    return Array.from(pool);
  }, [registeredUsernames, username]);
  console.log("Leaderboard usernames:", usernames);

  const results = useQueries({
    queries: usernames.map((u) => ({
      queryKey: ['leaderboard-entry', u],
      queryFn: async (): Promise<LeaderboardEntry | null> => {
        try {
          const [profile, problems, contests] = await Promise.all([
            getProfile(u),
            getProblems(u),
            getContests(u),
          ]);
          return {
            rank: 0,
            username: profile.username,
            avatar: profile.avatar,
            totalSolved: problems.summary.totalSolved,
            rating: contests.currentRating,
            ranking: profile.ranking,
            contestsAttended: contests.attendedContestsCount || 0,
          };
        } catch {
          return null;
        }
      },
      staleTime: 60_000,
      retry: 0,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const entries = Array.from(
  new Map(
    results
      .map((r) => r.data)
      .filter((d): d is LeaderboardEntry => Boolean(d))
      .map((entry) => [entry.username.toLowerCase(), entry])
  ).values()
);

console.log("Results:", results);
console.log("Entries:", entries);

  const sorted = useMemo(() => {
    const copy = [...entries];
    copy.sort((a, b) => {
      if (sortKey === 'ranking') {
        return (a.ranking ?? Infinity) - (b.ranking ?? Infinity);
      }
      if (sortKey === 'rating') {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return b.totalSolved - a.totalSolved;
    });
    return copy.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, sortKey]);

  const filtered = sorted.filter((e) =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'totalSolved', label: 'Problems Solved' },
    { key: 'rating', label: 'Contest Rating' },
    { key: 'ranking', label: 'Global Ranking' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="section-title text-2xl">Leaderboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Compare stats across everyone who has signed in to LeetCode Tracker.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search username"
                className="rounded-xl border border-base-border bg-base-charcoal py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-purple"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                sortKey === opt.key
                  ? 'border-brand-purple/50 bg-brand-purple/15 text-brand-purpleLight'
                  : 'border-base-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpDown className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="charcoal-card overflow-hidden">
          {isLoading && entries.length === 0 ? (
            <Spinner label="Loading leaderboard..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-base-border text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Rank</th>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Solved</th>
                    <th className="px-5 py-3 font-medium">Rating</th>
                    <th className="px-5 py-3 font-medium">Global Rank</th>
                    <th className="px-5 py-3 font-medium">Contests</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((e, i) => (
                    <motion.tr
                      key={e.username}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className={`border-b border-base-border/60 last:border-0 hover:bg-white/[0.03] ${
                        e.username === username ? 'bg-brand-purple/[0.06]' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                          {e.rank <= 3 ? (
                            <Medal
                              className={`h-4 w-4 ${
                                e.rank === 1
                                  ? 'text-yellow-400'
                                  : e.rank === 2
                                  ? 'text-slate-300'
                                  : 'text-amber-600'
                              }`}
                            />
                          ) : (
                            <Trophy className="h-3.5 w-3.5 text-slate-600" />
                          )}
                          {e.rank}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {e.avatar ? (
                            <img src={e.avatar} alt={e.username} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-charcoal2 text-xs font-bold text-brand-purpleLight">
                              {e.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-200">{e.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{e.totalSolved}</td>
                      <td className="px-5 py-3.5 text-slate-300">
                        {e.rating ? Math.round(e.rating) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">
                        {e.ranking ? `#${e.ranking.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{e.contestsAttended}</td>
                    </motion.tr>
                  ))}
                  {pageData.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        No matching users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-base-border px-5 py-3.5 text-sm text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost !px-3 !py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost !px-3 !py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
