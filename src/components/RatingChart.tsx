import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { ContestBadge } from '@/types';

interface Props {
  history: ContestBadge[];
  title?: string;
}

export default function RatingChart({ history, title = 'Contest Rating Progress' }: Props) {
  const data = history.map((h) => ({
    name: h.contest.title.replace('Weekly Contest ', 'W').replace('Biweekly Contest ', 'B'),
    rating: Math.round(h.rating),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="charcoal-card p-5"
    >
      <h3 className="section-title mb-4">{title}</h3>
      <div className="h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No contest history yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8b8b99', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b8b99', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip
                contentStyle={{
                  background: '#16161c',
                  border: '1px solid #2a2a35',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#ratingGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
