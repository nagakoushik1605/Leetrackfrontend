import { useMemo } from 'react';
import { CheckCircle2, Zap, Flame, Percent, Trophy, Star, Swords, Target } from 'lucide-react';
import { useUsername } from '@/hooks/useUsernameContext';
import { useProfile, useProblems, useContests, useActivity, useSubmissions } from '@/api/queries';
import PageTransition from '@/components/PageTransition';
import ProfileCard from '@/components/ProfileCard';
import StatCard from '@/components/StatCard';
import Heatmap from '@/components/Heatmap';
import MonthlyChart from '@/components/MonthlyChart';
import SubmissionsTable from '@/components/SubmissionsTable';
import { SkeletonCard, SkeletonBlock } from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { ApiError } from '@/api/client';

function buildMonthlyData(calendar: Record<string, number>) {
  const now = new Date();
  const months: { key: string; month: string; solved: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString('en-US', { month: 'short' }),
      solved: 0,
    });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));

  Object.entries(calendar).forEach(([ts, count]) => {
    const date = new Date(Number(ts) * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const idx = monthIndex.get(key);
    if (idx !== undefined) months[idx].solved += count;
  });

  return months.map(({ month, solved }) => ({ month, solved }));
}

export default function Dashboard() {
  const { username } = useUsername();
  const profileQ = useProfile(username || undefined);
  const problemsQ = useProblems(username || undefined);
  const contestsQ = useContests(username || undefined);
  const activityQ = useActivity(username || undefined);
  const submissionsQ = useSubmissions(username || undefined);

  const monthlyData = useMemo(
    () => buildMonthlyData(activityQ.data?.submissionCalendar || {}),
    [activityQ.data]
  );

  if (profileQ.isError) {
    const message =
      profileQ.error instanceof ApiError ? profileQ.error.message : 'Failed to load profile.';
    return (
      <PageTransition>
        <ErrorState message={message} onRetry={() => profileQ.refetch()} />
      </PageTransition>
    );
  }

  const summary = problemsQ.data?.summary;

  return (
    <PageTransition>
      <div className="space-y-6">
        {profileQ.isLoading || !profileQ.data ? (
          <SkeletonBlock height="h-40" />
        ) : (
          <ProfileCard profile={profileQ.data} contest={contestsQ.data} />
        )}

        <div>
          <h2 className="section-title mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {problemsQ.isLoading || !summary ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard label="Total Solved" value={summary.totalSolved} icon={CheckCircle2} accent="purple" delay={0} />
                <StatCard label="Easy Solved" value={summary.easySolved} icon={Zap} accent="green" delay={0.03} />
                <StatCard label="Medium Solved" value={summary.mediumSolved} icon={Flame} accent="orange" delay={0.06} />
                <StatCard label="Hard Solved" value={summary.hardSolved} icon={Target} accent="red" delay={0.09} />
                <StatCard label="Acceptance Rate" value={summary.acceptanceRate} suffix="%" decimals={1} icon={Percent} accent="blue" delay={0.12} />
                <StatCard
                  label="Contest Rating"
                  value={contestsQ.data?.currentRating ? Math.round(contestsQ.data.currentRating) : 0}
                  icon={Star}
                  accent="purple"
                  delay={0.15}
                />
                <StatCard
                  label="Global Ranking"
                  value={profileQ.data?.ranking || 0}
                  icon={Trophy}
                  accent="orange"
                  delay={0.18}
                />
                <StatCard
                  label="Contests Joined"
                  value={contestsQ.data?.attendedContestsCount || 0}
                  icon={Swords}
                  accent="green"
                  delay={0.21}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title mb-4">Activity</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activityQ.isLoading || !activityQ.data ? (
              <>
                <SkeletonBlock />
                <SkeletonBlock />
              </>
            ) : (
              <>
                <Heatmap submissionCalendar={activityQ.data.submissionCalendar} />
                <MonthlyChart data={monthlyData} />
              </>
            )}
          </div>
        </div>

        <div>
          {submissionsQ.isLoading || !submissionsQ.data ? (
            <SkeletonBlock height="h-72" />
          ) : (
            <SubmissionsTable submissions={submissionsQ.data} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
