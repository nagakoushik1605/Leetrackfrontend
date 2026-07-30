import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { ProblemsSummary } from '@/types';

interface Props {
  summary: ProblemsSummary;
}

const COLORS = {
  Easy: '#34d399',
  Medium: '#fb923c',
  Hard: '#f87171',
};

export default function DifficultyChart({ summary }: Props) {
  const data = [
    { name: 'Easy', value: summary.easySolved },
    { name: 'Medium', value: summary.mediumSolved },
    { name: 'Hard', value: summary.hardSolved },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="charcoal-card p-5"
    >
      <h3 className="section-title mb-4">Difficulty Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
              animationDuration={900}
              animationBegin={100}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#16161c',
                border: '1px solid #2a2a35',
                borderRadius: 12,
                color: '#fff',
              }}
            />
            <Legend
              formatter={(value) => <span className="text-sm text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
