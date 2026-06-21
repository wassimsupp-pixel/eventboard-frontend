import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: 'blue' | 'purple' | 'green' | 'yellow';
  showPercent?: boolean;
  className?: string;
}

const colorMap = {
  blue: 'bg-accent-blue',
  purple: 'bg-accent-purple',
  green: 'bg-status-success',
  yellow: 'bg-status-warning',
};

export default function ProgressBar({
  value,
  label,
  color = 'blue',
  showPercent = true,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercent && <span className="text-text-primary font-medium">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
