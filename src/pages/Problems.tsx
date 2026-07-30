import { useMemo } from 'react';
import { CheckCircle2, Zap, Flame, Target, Percent } from 'lucide-react';
import { useUsername } from '@/hooks/useUsernameContext';
import { useProblems, useActivity, useSubmissions } from '@/api/queries';
import PageTransition from '@/components/PageTransition';
import StatCard from '@/components/StatCard';
import DifficultyChart from '@/components/DifficultyChart';
import MonthlyChart from '@/components/MonthlyChart';
import TopicProgress from '@/components/TopicProgress';
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

export default function Problems() {
  const { username } = useUsername();
  const problemsQ = useProblems(username || undefined);
  const activityQ = useActivity(username || undefined);
  const submissionsQ = useSubmissions(username || undefined);

  const monthlyData = useMemo(
    () => buildMonthlyData(activityQ.data?.submissionCalendar || {}),
    [activityQ.data]
  );

  if (problemsQ.isError) {
    const message =
      problemsQ.error instanceof ApiError ? problemsQ.error.message : 'Failed to load problem stats.';
    return (
      <PageTransition>
        <ErrorState message={message} onRetry={() => problemsQ.refetch()} />
      </PageTransition>
    );
  }

  const summary = problemsQ.data?.summary;
  const topics = problemsQ.data?.topics || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="section-title text-2xl">Problems Solved</h1>
          <p className="mt-1 text-sm text-slate-400">Complete breakdown of your solved problems.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {problemsQ.isLoading || !summary ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Total Solved" value={summary.totalSolved} icon={CheckCircle2} accent="purple" />
              <StatCard label="Easy" value={summary.easySolved} icon={Zap} accent="green" delay={0.03} />
              <StatCard label="Medium" value={summary.mediumSolved} icon={Flame} accent="orange" delay={0.06} />
              <StatCard label="Hard" value={summary.hardSolved} icon={Target} accent="red" delay={0.09} />
              <StatCard
                label="Acceptance"
                value={summary.acceptanceRate}
                suffix="%"
                decimals={1}
                icon={Percent}
                accent="blue"
                delay={0.12}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {problemsQ.isLoading || !summary ? (
            <>
              <SkeletonBlock />
              <SkeletonBlock />
            </>
          ) : (
            <>
              <DifficultyChart summary={summary} />
              {activityQ.isLoading || !activityQ.data ? (
                <SkeletonBlock />
              ) : (
                <MonthlyChart data={monthlyData} title="Submission Trend" />
              )}
            </>
          )}
        </div>

        {problemsQ.isLoading ? <SkeletonBlock height="h-96" /> : <TopicProgress topics={topics} />}

        {submissionsQ.isLoading || !submissionsQ.data ? (
          <SkeletonBlock height="h-72" />
        ) : (
          <SubmissionsTable submissions={submissionsQ.data} />
        )}
      </div>
    </PageTransition>
  );
}
