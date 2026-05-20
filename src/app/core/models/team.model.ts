export type MemberRole   = 'owner' | 'admin' | 'member' | 'viewer';
export type MemberStatus = 'active' | 'invited' | 'inactive';

export interface TeamMember {
  id:       number;
  name:     string;
  email:    string;
  role:     MemberRole;
  status:   MemberStatus;
  avatar:   string;
  joinedAt: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

export interface TeamTask {
  id:          number;
  title:       string;
  assigneeId:  number;
  priority:    'high' | 'medium' | 'low';
  status:      'pending' | 'in_progress' | 'completed';
  dueDate:     string;
  category:    string;
}

export interface Workspace {
  id:          number;
  name:        string;
  description: string;
  members:     TeamMember[];
  tasks:       TeamTask[];
  createdAt:   string;
}

export const ROLE_CONFIG: Record<MemberRole, {
  label: string; color: string; bg: string;
}> = {
  owner:  { label: 'Owner',  color: '#5c4dc9', bg: '#f5f0ff' },
  admin:  { label: 'Admin',  color: '#185fa5', bg: '#f0f8ff' },
  member: { label: 'Member', color: '#0f6e56', bg: '#edfff7' },
  viewer: { label: 'Viewer', color: '#854f0b', bg: '#fffbf0' },
};

export const AVATAR_GRADIENTS: string[] = [
  'linear-gradient(135deg,#9d8ef0,#f564a0)',
  'linear-gradient(135deg,#5dcaa5,#70bfff)',
  'linear-gradient(135deg,#ffc84a,#ff9870)',
  'linear-gradient(135deg,#ff8ab8,#ffc84a)',
  'linear-gradient(135deg,#70bfff,#9d8ef0)',
  'linear-gradient(135deg,#5dcaa5,#9d8ef0)',
];