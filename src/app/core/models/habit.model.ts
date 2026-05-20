export type HabitFrequency = 'daily' | 'weekly';
export type HabitCategory  =
  'health' | 'fitness' | 'learning' |
  'mindfulness' | 'productivity' | 'personal';

export interface HabitEntry {
  date:      string; // ISO date string
  completed: boolean;
}

export interface Habit {
  id:          number;
  name:        string;
  description: string;
  icon:        string;
  color:       string;
  bgColor:     string;
  frequency:   HabitFrequency;
  category:    HabitCategory;
  targetDays:  number;
  entries:     HabitEntry[];
  createdAt:   string;
}

export const HABIT_CATEGORIES: Record<HabitCategory, {
  label: string; icon: string; color: string; bg: string;
}> = {
  health:        { label: 'Health',        icon: 'pi pi-heart',       color: '#f56565', bg: '#fff5f5' },
  fitness:       { label: 'Fitness',       icon: 'pi pi-bolt',        color: '#0f6e56', bg: '#edfff7' },
  learning:      { label: 'Learning',      icon: 'pi pi-book',        color: '#5c4dc9', bg: '#f5f0ff' },
  mindfulness:   { label: 'Mindfulness',   icon: 'pi pi-sun',         color: '#854f0b', bg: '#fffbf0' },
  productivity:  { label: 'Productivity',  icon: 'pi pi-chart-bar',   color: '#185fa5', bg: '#f0f8ff' },
  personal:      { label: 'Personal',      icon: 'pi pi-user',        color: '#993556', bg: '#fff0f5' },
};

export const HABIT_ICONS: string[] = [
  'pi pi-heart', 'pi pi-bolt', 'pi pi-book',
  'pi pi-sun', 'pi pi-chart-bar', 'pi pi-user',
  'pi pi-star', 'pi pi-check-circle', 'pi pi-flag',
  'pi pi-clock', 'pi pi-apple', 'pi pi-globe',
];

export const HABIT_COLORS: { color: string; bg: string }[] = [
  { color: '#5c4dc9', bg: '#f5f0ff' },
  { color: '#993556', bg: '#fff0f5' },
  { color: '#0f6e56', bg: '#edfff7' },
  { color: '#854f0b', bg: '#fffbf0' },
  { color: '#185fa5', bg: '#f0f8ff' },
  { color: '#d45420', bg: '#fff5f0' },
];  