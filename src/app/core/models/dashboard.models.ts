export interface StatCard {
  label:      string;
  value:      number | string;
  icon:       string;
  color:      string;
  bgColor:    string;
  change:     string;
  changeType: 'up' | 'down' | 'neutral';
}

export interface RecentTask {
  id:       number;
  title:    string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  due:      string;
  done:     boolean;
}

export interface HabitRing {
  name:     string;
  progress: number;  // 0–100
  color:    string;
  streak:   number;
}