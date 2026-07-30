import { useMemo } from 'react';
import { Star, Trophy, TrendingUp, Swords, Percent, Award } from 'lucide-react';
import { useUsername } from '@/hooks/useUsernameContext';
import { useContests } from '@/api/queries';
import PageTransition from '@/components/PageTransition';
import StatCard from '@/components/StatCard';
import RatingChart from '@/components/RatingChart';
import CountdownTimer from '@/components/CountdownTimer';
import { SkeletonCard, SkeletonBlock } from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { ApiError } from '@/api/client';

/** Next LeetCode Weekly Contest: Sundays, 02:30 UTC. */
function nextWeekly(): Date {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(2, 30, 0, 0);
  const day = target.getUTCDay(); // 0 = Sunday
  let diff = (7 - day) % 7;
  if (diff === 0 && target.getTime() <= now.getTime()) diff = 7;
  target.setUTCDate(target.getUTCDate() + diff);
  return target;
}

/** Next LeetCode Biweekly Contest: Saturdays, 14:30 UTC, alternating weeks (approximate). */
function nextBiweekly(): Date {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(14, 30, 0, 0);
  const day = target.getUTCDay(); // 6 = Saturday
  let diff = (6 - day + 7) % 7;
  if (diff === 0 && target.getTime() <= now.getTime()) diff = 7;
  target.setUTCDate(target.getUTCDate() + diff);
  return target;
}

export default function Contests() {
  const { username } = useUsername();
  const contestsQ = useContests(username || undefined);

  const weeklyDate = useMemo(() => nextWeekly(), []);
  const biweeklyDate = useMemo(() => nextBiweekly(), []);

  if (contestsQ.isError) {
    const message =
      contestsQ.error instanceof ApiError ? contestsQ.error.message : 'Failed to load contest stats.';
    return (
      <PageTransition>
        <ErrorState message={message} onRetry={() => contestsQ.refetch()} />
      </PageTransition>
    );
  }

  const data = contestsQ.data;
  const history = data?.history || [];
  const bestRank = history.length ? Math.min(...history.map((h) => h.ranking)) : null;
  const avgRank = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.ranking, 0) / history.length)
    : null;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="section-title text-2xl">Contests</h1>
          <p className="mt-1 text-sm text-slate-400">Contest rating, ranking, and history.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {contestsQ.isLoading || !data ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Current Rating"
                value={data.currentRating ? Math.round(data.currentRating) : 0}
                icon={Star}
                accent="purple"
              />
              <StatCard
                label="Highest Rating"
                value={data.highestRating || 0}
                icon={TrendingUp}
                accent="orange"
                delay={0.03}
              />
              <StatCard
                label="Global Rank"
                value={data.globalRanking || 0}
                icon={Trophy}
                accent="blue"
                delay={0.06}
              />
              <StatCard
                label="Contests Joined"
                value={data.attendedContestsCount || 0}
                icon={Swords}
                accent="green"
                delay={0.09}
              />
              <StatCard label="Best Rank" value={bestRank || 0} icon={Award} accent="purple" delay={0.12} />
              <StatCard label="Average Rank" value={avgRank || 0} icon={Award} accent="orange" delay={0.15} />
              <StatCard
                label="Top Percentage"
                value={data.topPercentage || 0}
                suffix="%"
                decimals={1}
                icon={Percent}
                accent="blue"
                delay={0.18}
              />
              <StatCard
                label="Total Participants"
                value={data.totalParticipants || 0}
                icon={Trophy}
                accent="green"
                delay={0.21}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CountdownTimer targetDate={weeklyDate} label="Upcoming Weekly Contest" />
          <CountdownTimer targetDate={biweeklyDate} label="Upcoming Biweekly Contest" />
        </div>

        {contestsQ.isLoading || !data ? (
          <SkeletonBlock height="h-80" />
        ) : (
          <RatingChart history={history} title="Rating Change Timeline" />
        )}
      </div>
    </PageTransition>
  );
}
