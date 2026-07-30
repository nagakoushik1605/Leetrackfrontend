import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface Props {
  data: { month: string; solved: number }[];
  title?: string;
}

export default function MonthlyChart({ data, title = 'Monthly Solved Problems' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="charcoal-card p-5"
    >
      <h3 className="section-title mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8b8b99', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b8b99', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(139,92,246,0.08)' }}
              contentStyle={{
                background: '#16161c',
                border: '1px solid #2a2a35',
                borderRadius: 12,
                color: '#fff',
              }}
            />
            <Bar dataKey="solved" radius={[6, 6, 0, 0]} fill="#fb923c" animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
