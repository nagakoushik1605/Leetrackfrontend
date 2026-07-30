import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface Props {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  accent?: 'purple' | 'orange' | 'green' | 'red' | 'blue';
  delay?: number;
}

const ACCENTS: Record<string, string> = {
  purple: 'from-brand-purple/20 to-brand-purple/5 text-brand-purpleLight border-brand-purple/25',
  orange: 'from-brand-orange/20 to-brand-orange/5 text-brand-orangeLight border-brand-orange/25',
  green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/25',
  red: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/25',
  blue: 'from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/25',
};

export default function StatCard({
  label,
  value,
  suffix = '',
  decimals = 0,
  icon: Icon,
  accent = 'purple',
  delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="charcoal-card group relative overflow-hidden p-5"
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70 ${ACCENTS[accent]}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="stat-value mt-2">
            <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
          </p>
        </div>
        <div className={`rounded-xl border p-2.5 ${ACCENTS[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
