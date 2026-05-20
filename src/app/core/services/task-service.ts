import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Task, Priority, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = new (class { constructor(public h: HttpClient) {} })(
    // will inject properly below
    null as any
  );

  // ── Local signal state (used until backend ready) ───────
  private _tasks = signal<Task[]>([
    {
      id: 1, title: 'Design login page mockup',
      description: 'Create high-fidelity mockup for desktop and mobile login pages',
      priority: 'high', status: 'in_progress', category: 'Design',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['ui', 'design']
    },
    {
      id: 2, title: 'Set up Spring Boot project',
      description: 'Initialize Spring Boot with Security, JPA, and MySQL dependencies',
      priority: 'high', status: 'pending', category: 'Backend',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['backend', 'setup']
    },
    {
      id: 3, title: 'Configure JWT authentication',
      description: 'Implement JWT login and register endpoints with Spring Security',
      priority: 'high', status: 'pending', category: 'Security',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['security', 'jwt']
    },
    {
      id: 4, title: 'Build reusable Angular components',
      description: 'Card, button, input, badge components with SCSS',
      priority: 'medium', status: 'pending', category: 'Frontend',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['angular', 'components']
    },
    {
      id: 5, title: 'Create MySQL database schema',
      description: 'Define tables for users, tasks, habits, notes',
      priority: 'medium', status: 'pending', category: 'Database',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['database', 'mysql']
    },
    {
      id: 6, title: 'Write unit tests for auth service',
      description: 'Cover login, register and token refresh flows',
      priority: 'low', status: 'pending', category: 'Testing',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: false, tags: ['testing']
    },
    {
      id: 7, title: 'Set up CI/CD pipeline',
      description: 'GitHub Actions for build and deploy',
      priority: 'low', status: 'completed', category: 'DevOps',
      dueDate: new Date().toISOString(), createdAt: new Date().toISOString(),
      done: true, tags: ['devops']
    },
  ]);

  // ── Public computed ──────────────────────────────────────
  tasks       = this._tasks.asReadonly();
  todayTasks  = computed(() => this._tasks());
  completed   = computed(() => this._tasks().filter(t => t.done));
  pending     = computed(() => this._tasks().filter(t => !t.done));

  totalCount    = computed(() => this._tasks().length);
  completedCount= computed(() => this._tasks().filter(t => t.done).length);
  pendingCount  = computed(() => this._tasks().filter(t => !t.done).length);

  // ── CRUD (signal-based, swap for HTTP later) ─────────────
  addTask(task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...task,
      id:        Date.now(),
      createdAt: new Date().toISOString()
    };
    this._tasks.update(tasks => [newTask, ...tasks]);
  }

  updateTask(id: number, changes: Partial<Task>): void {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, ...changes } : t)
    );
  }

  deleteTask(id: number): void {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }

  toggleDone(id: number): void {
    this._tasks.update(tasks =>
      tasks.map(t =>
        t.id === id
          ? { ...t, done: !t.done, status: !t.done ? 'completed' : 'pending' }
          : t
      )
    );
  }

  reorderTasks(tasks: Task[]): void {
    this._tasks.set(tasks);
  }

  getByPriority(p: Priority): Task[] {
    return this._tasks().filter(t => t.priority === p && !t.done);
  }
}
