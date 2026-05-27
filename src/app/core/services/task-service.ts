import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Task, Priority, TaskStatus } from '../models/task.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);

  private _tasks = signal<Task[]>([]);

  tasks          = this._tasks.asReadonly();
  completed      = computed(() => this._tasks().filter(t => t.done));
  pending        = computed(() => this._tasks().filter(t => !t.done));
  totalCount     = computed(() => this._tasks().length);
  completedCount = computed(() => this._tasks().filter(t => t.done).length);
  pendingCount   = computed(() => this._tasks().filter(t => !t.done).length);

  // ── Load all tasks
  loadTasks(): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/tasks`)
      .pipe(
        tap(res => {
          if (res.success) {
             this._tasks.set(res.data.map((t: any) => this.mapTask(t)));
          }
        })
      );
  }

  // ── Add task
  addTask(task: Omit<Task, 'id' | 'createdAt'>): Observable<any> {
    const payload = {
      ...task,
      tags: Array.isArray(task.tags)
        ? task.tags.join(',')
        : task.tags
    };
    return this.http
      .post<any>(`${environment.apiUrl}/tasks`, payload)
      .pipe(
        tap(res => {
          if (res.success) {
            const t = res.data;
            this._tasks.update(tasks => [{
              ...this.mapTask(t)
            }, ...tasks]);
          }
        })
      );
  }

  // ── Update task
  updateTask(id: number, changes: Partial<Task>): Observable<any> {
    const payload = {
      ...changes,
      tags: Array.isArray(changes.tags)
        ? changes.tags.join(',')
        : changes.tags ?? ''
    };
    return this.http
      .put<any>(`${environment.apiUrl}/tasks/${id}`, payload)
      .pipe(
        tap(res => {
          if (res.success) {
            this._tasks.update(tasks =>
              tasks.map(t =>
                t.id === id ? this.mapTask(res.data) : t
              )
            );
          }
        })
      );
  }

  // ── Delete task 
  deleteTask(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(
        tap(res => {
          if (res.success) {
            this._tasks.update(tasks =>
              tasks.filter(t => t.id !== id)
            );
          }
        })
      );
  }

  // ── Toggle
  toggleDone(id: number): Observable<any> {
    return this.http
      .patch<any>(
        `${environment.apiUrl}/tasks/${id}/toggle`, {})
      .pipe(
        tap(res => {
          if (res.success) {
            this._tasks.update(tasks =>
              tasks.map(t =>
                t.id === id
                  ? { ...t,
                      done: res.data.done,
                      status: res.data.status }
                  : t
              )
            );
          }
        })
      );
  }

  reorderTasks(updated: Task[]): void {
    this._tasks.set(updated);
  }

  getByPriority(p: Priority): Task[] {
    return this._tasks().filter(
      t => t.priority === p && !t.done);
  }

  private mapTask(t: any): Task {
     return {
       id:          t.id,
       title:       t.title,
       description: t.description ?? '',
       priority:    t.priority as Priority,
       status:      t.status,
       category:    t.category ?? 'Personal',
       dueDate:     t.dueDate ?? new Date().toISOString(),
       createdAt:   t.createdAt,
       done:        t.done,
       tags:        t.tags
         ? t.tags.split(',').filter((x: string) => x.trim() !== '')
         : []
     };
  }
}
