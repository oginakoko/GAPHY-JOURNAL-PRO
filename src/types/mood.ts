export type MoodType = 'HAPPY' | 'SAD' | 'EXCITED' | 'PEACEFUL' | 'NEUTRAL' | 'ANXIOUS' | 'ANGRY';

export interface MoodDefinition {
  label: string;
  emoji: string;
  score: number;
}

export const MOODS: Record<MoodType, MoodDefinition> = {
  HAPPY: { label: "Happy", emoji: "😊", score: 9 },
  EXCITED: { label: "Excited", emoji: "🤗", score: 10 },
  PEACEFUL: { label: "Peaceful", emoji: "😌", score: 8 },
  NEUTRAL: { label: "Neutral", emoji: "😐", score: 5 },
  ANXIOUS: { label: "Anxious", emoji: "😰", score: 3 },
  SAD: { label: "Sad", emoji: "😔", score: 2 },
  ANGRY: { label: "Angry", emoji: "😠", score: 1 }
} as const;
