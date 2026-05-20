import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { HabitService } from '../../core/services/habit-service';
import { Chart } from 'chart.js';
import { Habit, HABIT_CATEGORIES, HABIT_COLORS, HABIT_ICONS, HabitCategory } from '../../core/models/habit.model';

@Component({
  selector: 'app-habits',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers:   [MessageService, ConfirmationService],
  templateUrl: './habits.html',
  styleUrl: './habits.scss',
  standalone: true
})
export class Habits implements AfterViewInit, OnDestroy {
  habitService = inject(HabitService);
  private fb   = inject(FormBuilder);
  private msg  = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  @ViewChild('weekChart') weekChartRef!: ElementRef<HTMLCanvasElement>;
  private weekChart?: Chart;

  // ── UI state ─────────────────────────────────────────────
  showModal      = signal(false);
  editingHabit   = signal<Habit | null>(null);
  selectedIcon   = signal('pi pi-heart');
  selectedColor  = signal(0);
  activeCategory = signal<HabitCategory | 'all'>('all');

  habitIcons    = HABIT_ICONS;
  habitColors   = HABIT_COLORS;
  habitCategories = HABIT_CATEGORIES;
  categoryKeys  = Object.keys(HABIT_CATEGORIES) as HabitCategory[];

  categoryOptions = [
    { label: 'All',          value: 'all'         },
    { label: 'Health',       value: 'health'      },
    { label: 'Fitness',      value: 'fitness'     },
    { label: 'Learning',     value: 'learning'    },
    { label: 'Mindfulness',  value: 'mindfulness' },
    { label: 'Productivity', value: 'productivity'},
    { label: 'Personal',     value: 'personal'    },
  ];

  frequencyOptions = [
    { label: 'Daily',  value: 'daily'  },
    { label: 'Weekly', value: 'weekly' },
  ];

  // ── Form ─────────────────────────────────────────────────
  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    category:    ['health', Validators.required],
    frequency:   ['daily',  Validators.required],
    targetDays:  [21, [Validators.required, Validators.min(1)]],
  });

  // ── Computed ─────────────────────────────────────────────
  filteredHabits = computed(() => {
    const cat = this.activeCategory();
    return this.habitService.habits()
      .filter(h => cat === 'all' || h.category === cat);
  });

  todayProgress = computed(() => {
    const total = this.habitService.totalHabits();
    const done  = this.habitService.todayCompleted();
    return total ? Math.round((done / total) * 100) : 0;
  });

  // ── Lifecycle ─────────────────────────────────────────────
  ngAfterViewInit(): void {
    setTimeout(() => this.buildWeekChart(), 0);
  }

  ngOnDestroy(): void {
    this.weekChart?.destroy();
  }

  // ── Chart ────────────────────────────────────────────────
  private buildWeekChart(): void {
    if (!this.weekChartRef) return;
    const ctx = this.weekChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const days    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today   = new Date().getDay();
    const habits  = this.habitService.habits();

    const weekData = days.map((_, i) => {
      const dayIndex = (i + 1) % 7;
      const date     = new Date();
      date.setDate(date.getDate() - ((today - dayIndex + 7) % 7));
      const dateStr  = date.toISOString().split('T')[0];
      return habits.filter(h =>
        h.entries.some(e => e.date === dateStr && e.completed)
      ).length;
    });

    this.weekChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels:   days,
        datasets: [{
          label:           'Habits completed',
          data:            weekData,
          backgroundColor: 'rgba(157, 142, 240, 0.75)',
          borderRadius:    8,
          borderSkipped:   false,
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid:  { display: false },
            ticks: { color: '#6b6880', font: { size: 12 } }
          },
          y: {
            grid:  { color: 'rgba(124,109,232,0.08)' },
            ticks: {
              color:    '#6b6880',
              font:     { size: 12 },
              stepSize: 1
            },
            border: { display: false },
            min:    0,
            max:    this.habitService.totalHabits()
          }
        }
      }
    });
  }

  // ── Modal ────────────────────────────────────────────────
  openAddModal(): void {
    this.editingHabit.set(null);
    this.selectedIcon.set('pi pi-heart');
    this.selectedColor.set(0);
    this.form.reset({
      category:   'health',
      frequency:  'daily',
      targetDays: 21
    });
    this.showModal.set(true);
  }

  openEditModal(habit: Habit, event: Event): void {
    event.stopPropagation();
    this.editingHabit.set(habit);
    this.selectedIcon.set(habit.icon);
    const colorIdx = this.habitColors.findIndex(
      c => c.color === habit.color
    );
    this.selectedColor.set(colorIdx >= 0 ? colorIdx : 0);
    this.form.patchValue({
      name:        habit.name,
      description: habit.description,
      category:    habit.category,
      frequency:   habit.frequency,
      targetDays:  habit.targetDays,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHabit.set(null);
  }

  // ── Save ─────────────────────────────────────────────────
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v       = this.form.value;
    const editing = this.editingHabit();
    const color   = this.habitColors[this.selectedColor()];

    if (editing) {
      this.habitService.updateHabit(editing.id, {
        name:        v.name!,
        description: v.description ?? '',
        icon:        this.selectedIcon(),
        color:       color.color,
        bgColor:     color.bg,
        category:    v.category as HabitCategory,
        frequency:   v.frequency as 'daily' | 'weekly',
        targetDays:  Number(v.targetDays),
      });
      this.msg.add({ severity: 'success', summary: 'Habit updated', life: 2000 });
    } else {
      this.habitService.addHabit({
        name:        v.name!,
        description: v.description ?? '',
        icon:        this.selectedIcon(),
        color:       color.color,
        bgColor:     color.bg,
        category:    v.category as HabitCategory,
        frequency:   v.frequency as 'daily' | 'weekly',
        targetDays:  Number(v.targetDays),
      });
      this.msg.add({ severity: 'success', summary: 'Habit created', life: 2000 });
    }

    this.closeModal();
  }

  // ── Delete ───────────────────────────────────────────────
  onDelete(habit: Habit, event: Event): void {
    event.stopPropagation();
    this.confirmSvc.confirm({
      message: `Delete habit "${habit.name}"?`,
      header:  'Confirm delete',
      icon:    'pi pi-trash',
      accept:  () => {
        this.habitService.deleteHabit(habit.id);
        this.msg.add({ severity: 'warn', summary: 'Habit deleted', life: 2000 });
      }
    });
  }

  // ── Toggle today ─────────────────────────────────────────
  onToggleToday(habit: Habit, event: Event): void {
    event.stopPropagation();
    this.habitService.toggleToday(habit.id);
  }

  // ── Helpers ──────────────────────────────────────────────
  getStreak(habit: Habit):         number { return this.habitService.getStreak(habit); }
  getRate(habit: Habit):           number { return this.habitService.getCompletionRate(habit); }
  isCompletedToday(habit: Habit): boolean { return this.habitService.isCompletedToday(habit); }
  getLast7(habit: Habit)                  { return this.habitService.getLast7Days(habit); }

  getDayLabel(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
  }
}
