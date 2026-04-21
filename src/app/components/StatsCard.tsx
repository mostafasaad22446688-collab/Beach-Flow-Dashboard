import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  subtitle?: string;
  icon: LucideIcon;
  color: 'cyan' | 'blue' | 'amber' | 'emerald';
  showTrend?: boolean;
}

const colorClasses = {
  cyan: {
    bg: 'from-cyan-500 to-cyan-600',
    light: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  emerald: {
    bg: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
};

export function StatsCard({
  title,
  value,
  change,
  trend = 'up',
  subtitle,
  icon: Icon,
  color,
  showTrend = true,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border ${colors.border} hover:shadow-xl transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.light} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {showTrend && change !== undefined && (
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-600 text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
