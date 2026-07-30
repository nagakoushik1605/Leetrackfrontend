import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  targetDate: Date;
  label: string;
}

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ targetDate, label }: Props) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { value: remaining.days, label: 'Days' },
    { value: remaining.hours, label: 'Hrs' },
    { value: remaining.minutes, label: 'Min' },
    { value: remaining.seconds, label: 'Sec' },
  ];

  return (
    <div className="charcoal-card p-5">
      <div className="mb-4 flex items-center gap-2 text-slate-300">
        <Clock className="h-4 w-4 text-brand-orangeLight" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div key={u.label} className="rounded-xl border border-base-border bg-base-charcoal2 py-3 text-center">
            <div className="stat-value text-xl">{String(u.value).padStart(2, '0')}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{u.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
