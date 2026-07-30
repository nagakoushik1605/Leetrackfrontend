import { motion } from 'framer-motion';
import { CheckCircle2, Code2 } from 'lucide-react';
import { RecentSubmission } from '@/types';

interface Props {
  submissions: RecentSubmission[];
  limit?: number;
}

function timeAgo(unixTs: string) {
  const seconds = Math.floor(Date.now() / 1000) - Number(unixTs);
  const units: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label} ago`;
  }
  return 'just now';
}

export default function SubmissionsTable({ submissions, limit = 10 }: Props) {
  const rows = submissions.slice(0, limit);

  return (
    <div className="charcoal-card overflow-hidden p-5">
      <h3 className="section-title mb-4">Recent Accepted Problems</h3>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No recent submissions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-base-border text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Problem</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Language</th>
                <th className="pb-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <motion.tr
                  key={`${s.titleSlug}-${s.timestamp}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="border-b border-base-border/60 last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="py-3 pr-4 font-medium text-slate-200">{s.title}</td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {s.statusDisplay}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="badge-purple flex w-fit items-center gap-1">
                      <Code2 className="h-3 w-3" />
                      {s.lang}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{timeAgo(s.timestamp)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
