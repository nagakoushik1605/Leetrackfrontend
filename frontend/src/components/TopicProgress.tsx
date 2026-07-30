import { motion } from 'framer-motion';
import { TopicTag } from '@/types';

interface Props {
  topics: TopicTag[];
  limit?: number;
}

const FEATURED_TAGS = [
  'Array',
  'String',
  'Hash Table',
  'Linked List',
  'Tree',
  'Graph',
  'Binary Search',
  'Dynamic Programming',
  'Backtracking',
  'Heap (Priority Queue)',
  'Stack',
  'Queue',
  'Greedy',
  'Math',
];

export default function TopicProgress({ topics, limit }: Props) {
  const featured = FEATURED_TAGS.map(
    (name) => topics.find((t) => t.tagName === name) || { tagName: name, tagSlug: name, problemsSolved: 0 }
  );
  const list = limit ? featured.slice(0, limit) : featured;
  const max = Math.max(...list.map((t) => t.problemsSolved), 1);

  return (
    <div className="charcoal-card p-5">
      <h3 className="section-title mb-5">Topic Analytics</h3>
      <div className="space-y-4">
        {list.map((t, i) => {
          const pct = Math.round((t.problemsSolved / max) * 100);
          return (
            <div key={t.tagSlug}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">{t.tagName}</span>
                <span className="text-slate-500">{t.problemsSolved} solved</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.03, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-orange"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
