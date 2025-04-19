import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodStats {
  averageScore?: number;
  trendData?: Array<{
    date: string;
    score: number;
  }>;
  mostFrequentMood?: string;
}

interface MoodTrackingProps {
  stats?: MoodStats;
}

export default function MoodTracking({ stats = {} }: MoodTrackingProps) {
  const { averageScore = 0, trendData = [], mostFrequentMood = 'neutral' } = stats;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white/90">Mood Tracking</h3>
        <div className="text-sm text-white/60">
          Average Mood Score: {averageScore.toFixed(1)}
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(26,26,26,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
