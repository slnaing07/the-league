import { CURRENT_YEAR } from '@/lib/constants';

interface Props {
  year: number;
  variant?: 'badge' | 'banner';
}

export default function InProgressBadge({ year, variant = 'badge' }: Props) {
  if (year !== CURRENT_YEAR) return null;

  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/8 px-4 py-2 text-sm text-gold-400">
        <span className="text-base">⏳</span>
        <span>
          <strong>{CURRENT_YEAR} season is still in progress.</strong>{' '}
          Standings, records, and all-time stats will update as the season concludes.
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/50 bg-gold-500/10 px-2 py-0.5 text-xs font-semibold text-gold-400">
      ⏳ In Progress
    </span>
  );
}
