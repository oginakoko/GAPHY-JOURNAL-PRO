export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

interface TimeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const timeRanges: Array<{ label: string; value: TimeRange }> = [
    { label: '1D', value: 'today' },
    { label: '1W', value: 'week' },
    { label: '1M', value: 'month' },
    { label: '1Y', value: 'year' },
    { label: 'All', value: 'all' }
  ];

  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-lg border border-white/10">
      {timeRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            value === range.value
              ? 'bg-blue-500 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}