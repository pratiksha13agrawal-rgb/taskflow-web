import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { HabitRing, RecentTask, StatCard } from '../../core/models/dashboard.models';
import { Chart, registerables } from 'chart.js';
import { TaskService } from '../../core/services/task-service';
import { HabitService } from '../../core/services/habit-service';
Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  auth = inject(AuthService);
  taskService = inject(TaskService);
  habitService = inject(HabitService);

  @ViewChild('progressChart') progressChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weekChart')     weekChartRef!:     ElementRef<HTMLCanvasElement>;

  private progressChart?: Chart<'doughnut'>;
  private weekChart?:     Chart<'bar'>;

  todayTaskCount = computed(() => {
    const today = new Date().toDateString();
    return this.taskService.tasks().filter(
      t => new Date(t.dueDate).toDateString() === today
    ).length;
  });

  overdueCount = computed(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.taskService.tasks().filter(
      t => !t.done && new Date(t.dueDate) < now
    ).length;
  });

  // ── Stat cards ──────────────────────────────────────────
  statCards = computed<StatCard[]>(() => [
    {
      label:      'Total Tasks',
      value:      this.taskService.totalCount(),
      icon:       'pi pi-list',
      color:      'var(--pastel-lavender-500)',
      bgColor:    'var(--pastel-lavender-50)',
      change:     `${this.taskService.pendingCount()} remaining`,
      changeType: 'neutral'
    },
    {
      label:      "Today's Tasks",
      value:      this.todayTaskCount(),
      icon:       'pi pi-check-square',
      color:      'var(--pastel-sky-400)',
      bgColor:    'var(--pastel-sky-50)',
      change:     `${this.taskService.pendingCount()} remaining`,
      changeType: 'neutral'
    },
    {
      label:      'Completed',
      value:      this.taskService.completedCount(),
      icon:       'pi pi-check-circle',
      color:      'var(--pastel-mint-400)',
      bgColor:    'var(--pastel-mint-50)',
      change:     `+${this.taskService.completedCount()} total`,
      changeType: 'up'
    },
    {
      label:      'Overdue',
      value:      this.overdueCount(),
      icon:       'pi pi-exclamation-circle',
      color:      'var(--priority-high)',
      bgColor:    '#fff5f5',
      change:     'Need attention',
      changeType: 'down'
    }
  ]);

  // ── Recent tasks ────────────────────────────────────────
  recentTasks = computed(() =>
    this.taskService.tasks().slice(0, 6)
  );

  // ── Habit rings ─────────────────────────────────────────
  habitRings = computed<HabitRing[]>(() =>
    this.habitService.habits().map(h => ({
      name:     h.name,
      progress: this.habitService.getCompletionRate(h),
      color:    h.color,
      streak:   this.habitService.getStreak(h)
    }))
  );

  // ── Computed ────────────────────────────────────────────
  completionRate = computed(() => {
    const total = this.taskService.totalCount();
    const done  = this.taskService.completedCount();
    return total ? Math.round((done / total) * 100) : 0;
  });

  pendingTasks = computed(() =>
    this.taskService.tasks().filter(t => !t.done)
  );

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    this.taskService.loadTasks().subscribe({
      next: () => {
        setTimeout(() => {
          this.progressChart?.destroy();
          this.weekChart?.destroy();
          this.buildProgressChart();
          this.buildWeekChart();
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildProgressChart();
      this.buildWeekChart();
    }, 0);
  }

  ngOnDestroy(): void {
    this.progressChart?.destroy();
    this.weekChart?.destroy();
  }

  // ── Charts ──────────────────────────────────────────────
  private buildProgressChart(): void {
    const ctx = this.progressChartRef.nativeElement.getContext('2d')!;
    if (!ctx) return;

    const completed = this.taskService.completedCount();
    const pending   = this.taskService.pendingCount();

    this.progressChart = new Chart<'doughnut'>(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data:            [completed, pending],
          backgroundColor: ['#9d8ef0', '#ede8ff'],
          borderWidth:     0,
          hoverOffset:     4
        }]
      },
      options: {
        cutout:     '78%',
        responsive:  true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} tasks`
            }
          }
        }
      }
    });
  }

  private buildWeekChart(): void {
    const ctx = this.weekChartRef.nativeElement.getContext('2d')!;
    if (!ctx) return;

    const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const tasks = this.taskService.tasks();
    
    const completedData = days.map((_, i) => {
      const dayIndex = (i + 1) % 7;
      const date     = new Date();
      date.setDate(date.getDate() - ((today - dayIndex + 7) % 7));
      const dateStr  = date.toDateString();
      return tasks.filter(t =>
        t.done &&
        new Date(t.dueDate).toDateString() === dateStr
      ).length;
    });

    const addedData = days.map((_, i) => {
      const dayIndex = (i + 1) % 7;
      const date     = new Date();
      date.setDate(date.getDate() - ((today - dayIndex + 7) % 7));
      const dateStr  = date.toDateString();
      return tasks.filter(t =>
        new Date(t.createdAt).toDateString() === dateStr
      ).length;
    });

    this.weekChart = new Chart<'bar'>(ctx, {
      type: 'bar',
      data: {
        labels:   days,
        datasets: [
          {
            label:           'Completed',
            data:            completedData,
            backgroundColor: 'rgba(157, 142, 240, 0.75)',
            borderRadius:    6,
            borderSkipped:   false,
          },
          {
            label:           'Added',
            data:            addedData,
            backgroundColor: 'rgba(255, 138, 184, 0.45)',
            borderRadius:    6,
            borderSkipped:   false,
          }
        ]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels:   {
              usePointStyle: true,
              pointStyle:    'circle',
              font:          { size: 12 },
              color:         'var(--text-secondary)'
            }
          }
        },
        scales: {
          x: {
            grid:  { display: false },
            ticks: { color: 'var(--text-muted)', font: { size: 12 } }
          },
          y: {
            grid:  {
              color: 'rgba(124, 109, 232, 0.08)'
            },
            ticks: {
              color:     'var(--text-muted)',
              font:      { size: 12 },
              stepSize:  2
            },
            border: { display: false }
          }
        }
      }
    });
  }

  // ── Actions ─────────────────────────────────────────────
  toggleTask(id: number): void {
    this.taskService.toggleDone(id);
  }

  getPriorityColor(p: 'high' | 'medium' | 'low'): string {
    return {
      high:   'var(--priority-high)',
      medium: 'var(--priority-medium)',
      low:    'var(--priority-low)'
    }[p];
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      Design:   'var(--pastel-lavender-100)',
      Backend:  'var(--pastel-mint-100)',
      Frontend: 'var(--pastel-sky-100)',
      Database: 'var(--pastel-amber-100)',
      Security: 'var(--pastel-rose-100)',
    };
    return map[cat] ?? 'var(--bg-surface-2)';
  }

  getCategoryTextColor(cat: string): string {
    const map: Record<string, string> = {
      Design:   'var(--pastel-lavender-600)',
      Backend:  'var(--pastel-mint-500)',
      Frontend: 'var(--pastel-sky-500)',
      Database: 'var(--pastel-amber-500)',
      Security: 'var(--pastel-rose-400)',
    };
    return map[cat] ?? 'var(--text-secondary)';
  }
}
