import { computed, Injectable, signal } from '@angular/core';
import { MemberRole, TeamMember, TeamTask, Workspace } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private _workspace = signal<Workspace>({
    id:          1,
    name:        'TaskFlow Team',
    description: 'Main workspace for the TaskFlow project',
    createdAt:   new Date().toISOString(),
    members: [
      {
        id: 1, name: 'Rahul Patel',
        email: 'rahul@taskflow.com',
        role: 'owner', status: 'active',
        avatar: 'linear-gradient(135deg,#9d8ef0,#f564a0)',
        joinedAt: new Date().toISOString(),
        tasksAssigned: 8, tasksCompleted: 5
      },
      {
        id: 2, name: 'Priya Sharma',
        email: 'priya@taskflow.com',
        role: 'admin', status: 'active',
        avatar: 'linear-gradient(135deg,#5dcaa5,#70bfff)',
        joinedAt: new Date().toISOString(),
        tasksAssigned: 6, tasksCompleted: 4
      },
      {
        id: 3, name: 'Arjun Mehta',
        email: 'arjun@taskflow.com',
        role: 'member', status: 'active',
        avatar: 'linear-gradient(135deg,#ffc84a,#ff9870)',
        joinedAt: new Date().toISOString(),
        tasksAssigned: 5, tasksCompleted: 3
      },
      {
        id: 4, name: 'Sneha Gupta',
        email: 'sneha@taskflow.com',
        role: 'member', status: 'invited',
        avatar: 'linear-gradient(135deg,#ff8ab8,#ffc84a)',
        joinedAt: new Date().toISOString(),
        tasksAssigned: 2, tasksCompleted: 0
      },
      {
        id: 5, name: 'Dev Kumar',
        email: 'dev@taskflow.com',
        role: 'viewer', status: 'active',
        avatar: 'linear-gradient(135deg,#70bfff,#9d8ef0)',
        joinedAt: new Date().toISOString(),
        tasksAssigned: 3, tasksCompleted: 2
      },
    ],
    tasks: [
      {
        id: 1, title: 'Design system setup',
        assigneeId: 1, priority: 'high',
        status: 'completed', category: 'Design',
        dueDate: new Date().toISOString()
      },
      {
        id: 2, title: 'API documentation',
        assigneeId: 2, priority: 'medium',
        status: 'in_progress', category: 'Backend',
        dueDate: new Date().toISOString()
      },
      {
        id: 3, title: 'Frontend components',
        assigneeId: 3, priority: 'high',
        status: 'in_progress', category: 'Frontend',
        dueDate: new Date().toISOString()
      },
      {
        id: 4, title: 'Database schema',
        assigneeId: 1, priority: 'high',
        status: 'pending', category: 'Database',
        dueDate: new Date().toISOString()
      },
      {
        id: 5, title: 'JWT auth implementation',
        assigneeId: 2, priority: 'high',
        status: 'pending', category: 'Security',
        dueDate: new Date().toISOString()
      },
      {
        id: 6, title: 'Unit tests',
        assigneeId: 3, priority: 'low',
        status: 'pending', category: 'Testing',
        dueDate: new Date().toISOString()
      },
      {
        id: 7, title: 'CI/CD pipeline',
        assigneeId: 5, priority: 'medium',
        status: 'completed', category: 'DevOps',
        dueDate: new Date().toISOString()
      },
      {
        id: 8, title: 'Mobile responsive UI',
        assigneeId: 3, priority: 'medium',
        status: 'pending', category: 'Frontend',
        dueDate: new Date().toISOString()
      },
    ]
  });

  workspace    = this._workspace.asReadonly();
  members      = computed(() => this._workspace().members);
  tasks        = computed(() => this._workspace().tasks);
  activeMembers = computed(() =>
    this._workspace().members.filter(m => m.status === 'active').length
  );

  totalTasks     = computed(() => this._workspace().tasks.length);
  completedTasks = computed(() =>
    this._workspace().tasks.filter(t => t.status === 'completed').length
  );
  inProgressTasks = computed(() =>
    this._workspace().tasks.filter(t => t.status === 'in_progress').length
  );

  // ── CRUD ─────────────────────────────────────────────────
  inviteMember(email: string, role: MemberRole): void {
    const newMember: TeamMember = {
      id:             Date.now(),
      name:           email.split('@')[0],
      email,
      role,
      status:         'invited',
      avatar:         'linear-gradient(135deg,#9d8ef0,#f564a0)',
      joinedAt:       new Date().toISOString(),
      tasksAssigned:  0,
      tasksCompleted: 0
    };
    this._workspace.update(w => ({
      ...w,
      members: [...w.members, newMember]
    }));
  }

  removeMember(id: number): void {
    this._workspace.update(w => ({
      ...w,
      members: w.members.filter(m => m.id !== id)
    }));
  }

  updateMemberRole(id: number, role: MemberRole): void {
    this._workspace.update(w => ({
      ...w,
      members: w.members.map(m =>
        m.id === id ? { ...m, role } : m
      )
    }));
  }

  addTask(task: Omit<TeamTask, 'id'>): void {
    this._workspace.update(w => ({
      ...w,
      tasks: [{
        ...task,
        id: Date.now()
      }, ...w.tasks]
    }));
  }

  updateTaskStatus(
    id: number,
    status: TeamTask['status']
  ): void {
    this._workspace.update(w => ({
      ...w,
      tasks: w.tasks.map(t =>
        t.id === id ? { ...t, status } : t
      )
    }));
  }

  deleteTask(id: number): void {
    this._workspace.update(w => ({
      ...w,
      tasks: w.tasks.filter(t => t.id !== id)
    }));
  }

  getMemberById(id: number): TeamMember | undefined {
    return this._workspace().members.find(m => m.id === id);
  }

  getTasksByMember(memberId: number): TeamTask[] {
    return this._workspace().tasks.filter(
      t => t.assigneeId === memberId
    );
  }
}
