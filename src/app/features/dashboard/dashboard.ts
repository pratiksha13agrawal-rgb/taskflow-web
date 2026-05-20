import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { HabitRing, RecentTask, StatCard } from '../../core/models/dashboard.models';
import { Chart, registerables } from 'chart.js';
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

  @ViewChild('progressChart') progressChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weekChart')     weekChartRef!:     ElementRef<HTMLCanvasElement>;

  private progressChart?: Chart<'doughnut'>;
  private weekChart?:     Chart<'bar'>;


  // ── Stat cards ──────────────────────────────────────────
  statCards = signal<StatCard[]>([
    {
      label:      'Total Tasks',
      value:      24,
      icon:       'pi pi-list',
      color:      'var(--pastel-lavender-500)',
      bgColor:    'var(--pastel-lavender-50)',
      change:     '+3 this week',
      changeType: 'up'
    },
    {
      label:      "Today's Tasks",
      value:      8,
      icon:       'pi pi-check-square',
      color:      'var(--pastel-sky-400)',
      bgColor:    'var(--pastel-sky-50)',
      change:     '5 remaining',
      changeType: 'neutral'
    },
    {
      label:      'Completed',
      value:      16,
      icon:       'pi pi-check-circle',
      color:      'var(--pastel-mint-400)',
      bgColor:    'var(--pastel-mint-50)',
      change:     '+5 today',
      changeType: 'up'
    },
    {
      label:      'Overdue',
      value:      2,
      icon:       'pi pi-exclamation-circle',
      color:      'var(--priority-high)',
      bgColor:    '#fff5f5',
      change:     '-1 from yesterday',
      changeType: 'down'
    }
  ]);

  // ── Recent tasks ────────────────────────────────────────
  recentTasks = signal<RecentTask[]>([
    { id:1, title:'Design login page mockup',    category:'Design',    priority:'high',   due:'Today',     done:false },
    { id:2, title:'Set up Spring Boot project',  category:'Backend',   priority:'high',   due:'Today',     done:false },
    { id:3, title:'Write API documentation',     category:'Backend',   priority:'medium', due:'Tomorrow',  done:false },
    { id:4, title:'Create reusable components',  category:'Frontend',  priority:'medium', due:'Jun 18',    done:false },
    { id:5, title:'Set up MySQL database',       category:'Database',  priority:'low',    due:'Jun 19',    done:true  },
    { id:6, title:'Configure JWT auth',          category:'Security',  priority:'high',   due:'Today',     done:true  },
  ]);

  // ── Habit rings ─────────────────────────────────────────
  habitRings = signal<HabitRing[]>([
    { name:'Morning run',   progress:85, color:'var(--pastel-mint-400)',     streak:12 },
    { name:'Read 30 mins',  progress:60, color:'var(--pastel-lavender-400)', streak:7  },
    { name:'Drink water',   progress:100,color:'var(--pastel-sky-400)',      streak:21 },
    { name:'Meditate',      progress:40, color:'var(--pastel-rose-400)',     streak:4  },
  ]);

  // ── Computed ────────────────────────────────────────────
  completionRate = computed(() => {
    const tasks = this.recentTasks();
    const done  = tasks.filter(t => t.done).length;
    return Math.round((done / tasks.length) * 100);
  });

  pendingTasks = computed(() =>
    this.recentTasks().filter(t => !t.done)
  );

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {}

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
    this.progressChart = new Chart<'doughnut'>(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data:            [16, 8],
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
              label: ctx =>
                ` ${ctx.label}: ${ctx.raw} tasks`
            }
          }
        }
      }
    });
  }

  private buildWeekChart(): void {
    const ctx = this.weekChartRef.nativeElement.getContext('2d')!;
    this.weekChart = new Chart<'bar'>(ctx, {
      type: 'bar',
      data: {
        labels:   ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label:           'Completed',
            data:            [4, 6, 3, 7, 5, 2, 4],
            backgroundColor: 'rgba(157, 142, 240, 0.75)',
            borderRadius:    6,
            borderSkipped:   false,
          },
          {
            label:           'Added',
            data:            [5, 7, 4, 8, 6, 3, 5],
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
    this.recentTasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
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
