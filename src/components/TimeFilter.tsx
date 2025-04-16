export type TimeRange = 'last3' | 'today' | 'week' | 'month' | 'year' | 'all';

interface TimeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Time Range:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeRange)}
        className="bg-[#1A1A1A] px-4 py-2 rounded-lg text-white"
      >
        <option value="last3">Last 3 Trades</option>
        <option value="today">Today</option>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}