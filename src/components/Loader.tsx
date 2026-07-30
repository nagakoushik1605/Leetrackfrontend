import { motion } from 'framer-motion';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-brand-purple/30 border-t-brand-purple"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`charcoal-card overflow-hidden p-5 ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-1/3 rounded bg-white/10" />
        <div className="h-7 w-2/3 rounded bg-white/10" />
      </div>
    </div>
  );
}

export function SkeletonBlock({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`charcoal-card animate-pulse p-5 ${height}`}>
      <div className="h-full w-full rounded-xl bg-white/[0.04]" />
    </div>
  );
}
