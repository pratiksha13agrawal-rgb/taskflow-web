export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id:          number;
  title:       string;
  description: string;
  priority:    Priority;
  status:      TaskStatus;
  category:    string;
  dueDate:     string;
  createdAt:   string;
  done:        boolean;
  tags:        string[];
}

export interface TaskGroup {
  label:  string;
  key:    Priority | 'all';
  tasks:  Task[];
  color:  string;
  bgColor:string;
}

export const CATEGORIES: string[] = [
  'Design', 'Frontend', 'Backend',
  'Database', 'Security', 'Testing',
  'DevOps', 'Personal', 'Other'
];

export const PRIORITY_CONFIG: Record<Priority, {
  label: string; color: string; bgColor: string; icon: string;
}> = {
  high: {
    label:   'High',
    color:   'var(--priority-high)',
    bgColor: '#fff5f5',
    icon:    'pi pi-arrow-up'
  },
  medium: {
    label:   'Medium',
    color:   'var(--priority-medium)',
    bgColor: '#fffaf0',
    icon:    'pi pi-minus'
  },
  low: {
    label:   'Low',
    color:   'var(--priority-low)',
    bgColor: '#f0fff4',
    icon:    'pi pi-arrow-down'
  }
};