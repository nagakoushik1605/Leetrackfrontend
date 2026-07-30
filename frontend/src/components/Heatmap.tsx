import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Props {
  submissionCalendar: Record<string, number>;
  weeks?: number;
}

function getIntensityClass(count: number) {
  if (count === 0) return 'bg-white/[0.04]';
  if (count <= 2) return 'bg-brand-purple/30';
  if (count <= 5) return 'bg-brand-purple/55';
  if (count <= 9) return 'bg-brand-purple/80';
  return 'bg-brand-purple';
}

export default function Heatmap({ submissionCalendar, weeks = 26 }: Props) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = weeks * 7;
    const result: { date: Date; count: number }[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const epoch = Math.floor(d.getTime() / 1000);
      // LeetCode buckets by day in UTC seconds — find nearest key within the day window
      const dayStart = epoch - (epoch % 86400);
      const count =
        submissionCalendar[String(dayStart)] ??
        submissionCalendar[String(dayStart - (dayStart % 86400))] ??
        0;
      result.push({ date: d, count });
    }
    return result;
  }, [submissionCalendar, weeks]);

  const columns = useMemo(() => {
    const cols: { date: Date; count: number }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  const totalSubs = Object.values(submissionCalendar).reduce((a, b) => a + b, 0);

  return (
    <div className="charcoal-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">Activity Heatmap</h3>
        <span className="text-xs text-slate-400">{totalSubs} submissions (all time)</span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: (ci * 7 + di) * 0.002 }}
                  title={`${day.date.toDateString()}: ${day.count} submissions`}
                  className={`h-3 w-3 rounded-sm ${getIntensityClass(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-500">
        Less
        {[0, 2, 5, 9, 12].map((v) => (
          <div key={v} className={`h-3 w-3 rounded-sm ${getIntensityClass(v)}`} />
        ))}
        More
      </div>
    </div>
  );
}
