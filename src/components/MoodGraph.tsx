import { useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ZAxis, ReferenceLine 
} from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { MoodType, MOODS } from '../types/mood';

interface MoodData {
  date: string;
  mood: MoodType;
  score: number;
  pl?: number;
  source: 'trade' | 'journal';
}

interface MoodGraphProps {
  moodData: MoodData[];
  title?: string;
  subtitle?: string;
}

export function MoodGraph({ moodData, title, subtitle }: MoodGraphProps) {
  const stats = useMemo(() => {
    if (!moodData.length) return null;

    const tradeData = moodData.filter(m => m.source === 'trade');
    const totalPL = tradeData.reduce((sum, m) => sum + (m.pl || 0), 0);
    const avgScore = moodData.reduce((sum, m) => sum + m.score, 0) / moodData.length;

    // Calculate trade performance by mood
    const moodPerformance = tradeData.reduce((acc, m) => {
      const mood = m.mood;
      if (!acc[mood]) {
        acc[mood] = { totalPL: 0, trades: 0, avgPL: 0 };
      }
      acc[mood].totalPL += m.pl || 0;
      acc[mood].trades++;
      acc[mood].avgPL = acc[mood].totalPL / acc[mood].trades;
      return acc;
    }, {} as Record<MoodType, { totalPL: number; trades: number; avgPL: number }>);

    // Calculate correlation between mood scores and profit/loss
    const tradeScores = tradeData.map(m => m.score);
    const tradePLs = tradeData.map(m => m.pl || 0);
    const correlation = calculateCorrelation(tradeScores, tradePLs);

    return {
      totalPL,
      avgScore,
      moodPerformance,
      correlation,
      tradingDays: new Set(tradeData.map(m => m.date.split('T')[0])).size,
      journalEntries: moodData.filter(m => m.source === 'journal').length
    };
  }, [moodData]);

  const scatterData = useMemo(() => {
    return moodData
      .filter(m => m.source === 'trade')
      .map(m => ({
        x: m.score,
        y: m.pl || 0,
        mood: m.mood,
        date: new Date(m.date).toLocaleDateString()
      }));
  }, [moodData]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium text-white/90">{title}</h3>
          {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#252525]/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Correlation</span>
          </div>
          <span className="text-xl font-semibold text-white">
            {stats.correlation ? `${(stats.correlation * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>

        <div className="bg-[#252525]/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            {stats.totalPL >= 0 ? 
              <TrendingUp className="w-4 h-4 text-green-400" /> : 
              <TrendingDown className="w-4 h-4 text-red-400" />
            }
            <span className="text-sm">Best Mood</span>
          </div>
          <span className="text-xl font-semibold text-white">
            {getBestPerformingMood(stats.moodPerformance)}
          </span>
        </div>

        <div className="bg-[#252525]/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <span className="text-sm">Sample Size</span>
          </div>
          <span className="text-xl font-semibold text-white">
            {moodData.length} Trades
          </span>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Mood Score" 
              domain={[0, 10]}
              stroke="rgba(255,255,255,0.5)"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Profit/Loss"
              stroke="rgba(255,255,255,0.5)"
            />
            <ZAxis type="category" dataKey="mood" name="Mood" />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]?.payload) return null;
                const data = payload[0].payload as { date: string; mood: MoodType; y: number };
                return (
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-3">
                    <div className="text-sm text-white/90">
                      <div>Date: {data.date}</div>
                      <div>Mood: {MOODS[data.mood]?.emoji} {MOODS[data.mood]?.label}</div>
                      <div className={data.y >= 0 ? 'text-green-400' : 'text-red-400'}>
                        P/L: ${data.y.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter 
              data={scatterData} 
              fill="#8884d8"
              shape={(props: any) => (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={6} 
                  fill={props.payload.y >= 0 ? '#00C49F' : '#ff2d78'}
                  fillOpacity={0.6}
                />
              )}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper functions
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  return denominator === 0 ? 0 : numerator / denominator;
}

function getBestPerformingMood(moodPerformance: Record<MoodType, { avgPL: number }>): string {
  if (!moodPerformance || Object.keys(moodPerformance).length === 0) return 'N/A';
  
  const bestMood = Object.entries(moodPerformance)
    .sort(([, a], [, b]) => b.avgPL - a.avgPL)[0];
  
  return bestMood ? `${MOODS[bestMood[0] as MoodType]?.emoji} ${MOODS[bestMood[0] as MoodType]?.label}` : 'N/A';
}