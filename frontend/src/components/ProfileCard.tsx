import { motion } from 'framer-motion';
import { Globe2, Trophy, Star, Shield } from 'lucide-react';
import { LeetCodeProfile, ContestStats } from '@/types';

interface Props {
  profile: LeetCodeProfile;
  contest?: ContestStats;
}

export default function ProfileCard({ profile, contest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card relative overflow-hidden p-6 sm:p-8"
    >
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand-purple/25 blur-3xl animate-pulse-slow" />
      <div className="absolute -right-10 -bottom-24 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl animate-pulse-slow" />

      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <motion.div
          className="animate-float"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="h-24 w-24 rounded-2xl border-2 border-brand-purple/40 object-cover shadow-glow sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-brand-purple/40 bg-base-charcoal2 text-3xl font-bold text-brand-purpleLight shadow-glow sm:h-28 sm:w-28">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </motion.div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {profile.realName || profile.username}
            </h1>
            {profile.badge && (
              <span className="badge-purple flex items-center gap-1">
                <Shield className="h-3 w-3" /> {profile.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-slate-400">@{profile.username}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
            {profile.country && (
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-brand-purpleLight" /> {profile.country}
              </span>
            )}
            {profile.ranking !== null && (
              <span className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-brand-orangeLight" />
                Global Rank #{profile.ranking.toLocaleString()}
              </span>
            )}
            {contest?.currentRating !== undefined && contest?.currentRating !== null && (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-400" />
                Contest Rating {Math.round(contest.currentRating)}
              </span>
            )}
            {profile.reputation !== null && (
              <span className="flex items-center gap-1.5 text-slate-400">
                Reputation: {profile.reputation}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
