export type SubjectCategory = 'GATE' | 'Placement' | 'Core CS' | 'Aptitude' | 'Other';

export interface UserProfile {
  id: string; // Google sub id or unique ID
  name: string;
  email: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  provider: 'google' | 'demo';
  signedInAt: string;
}

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  color: string; // Tailwind color or hex
  description?: string;
  targetDailyHours: number; // default e.g. 1.5
  createdAt: string;
  syllabus?: string[];
}

export interface StudyLog {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  hours: number; // e.g. 0.5, 1.0, 1.5, 2.0, 2.5, 3.0
  notes?: string;
  topicsCovered?: string[];
  timestamp: number;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Anytime';
  icon: string; // emoji or icon name
  description?: string;
  category: 'Vitamins' | 'Cognitive' | 'Hydration' | 'Recovery';
}

export interface DailySupplementLog {
  date: string; // YYYY-MM-DD
  takenSupplementIds: string[];
  waterGlasses: number; // e.g. 8 glasses = ~2-2.5L
  sleepHours: number; // e.g. 7.5
  energyLevel?: number; // 1 to 5
}

export interface SubjectNote {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  category: 'Formula' | 'Concept' | 'Mistake Log' | 'Interview Question' | 'General';
  tags: string[];
  updatedAt: string;
}

export interface StudyReminder {
  id: string;
  time: string; // HH:MM (24-hour)
  label: string;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export type HeatmapView = 'all' | 'gate' | 'placement' | string; // or subjectId

export type FieldCategory =
  | 'Cognitive & Mind'
  | 'World & Systems'
  | 'Human Dynamics'
  | 'Body & Vitality'
  | 'Strategic Thinking'
  | 'Other';

export interface LifeField {
  id: string;
  name: string;
  category: FieldCategory;
  icon: string; // emoji e.g. 🧠, 🌍, 💭, 🗣️, ❤️, 🫁, ♟️
  color: string;
  description: string;
  coreTopics: string[];
  recommendedResources?: string[]; // Books, podcasts, channels
  targetWeeklyMinutes?: number; // default e.g. 90
  createdAt: string;
}

export interface FieldLog {
  id: string;
  fieldId: string;
  date: string; // YYYY-MM-DD
  minutes: number; // e.g. 15, 30, 45, 60, 90, 120
  notes?: string;
  resourceUsed?: string;
  timestamp: number;
}
