import { Component, computed, inject, signal } from '@angular/core';
import { Task, CATEGORIES, Priority, PRIORITY_CONFIG } from '../../core/models/task.model';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TaskService } from '../../core/services/task-service';

interface CalendarDay {
  date:         Date;
  isCurrentMonth: boolean;
  isToday:      boolean;
  isSelected:   boolean;
  tasks:        Task[];
}

interface WeekDay {
  date:   Date;
  label:  string;
  tasks:  Task[];
  isToday: boolean;
}


@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    TooltipModule   
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  providers: [MessageService],
  standalone: true
})
export class Calendar{
  taskService = inject(TaskService);
  private fb          = inject(FormBuilder);
  private msg         = inject(MessageService);

  // ── State ─────────────────────────────────────────────────
  viewMode      = signal<'month' | 'week'>('month');
  currentDate   = signal(new Date());
  selectedDate  = signal<Date | null>(null);
  showModal     = signal(false);
  editingTask   = signal<Task | null>(null);
  selectedTask  = signal<Task | null>(null);
  showTaskDetail = signal(false);

  priorityConfig  = PRIORITY_CONFIG;
  priorityOptions = [
    { label: 'High',   value: 'high'   },
    { label: 'Medium', value: 'medium' },
    { label: 'Low',    value: 'low'    },
  ];
  categoryOptions = CATEGORIES.map(c => ({ label: c, value: c }));

  // ── Form ─────────────────────────────────────────────────
  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority:    ['medium', Validators.required],
    category:    ['Personal', Validators.required],
    dueDate:     [new Date() as Date | null],
  });

  // ── Month view computed ───────────────────────────────────
  calendarDays = computed<CalendarDay[]>(() => {
    const current  = this.currentDate();
    const today    = new Date();
    const selected = this.selectedDate();
    const year     = current.getFullYear();
    const month    = current.getMonth();

    const firstDay  = new Date(year, month, 1);
    const lastDay   = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Start from Monday
    const dayOfWeek = firstDay.getDay();
    const offset    = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - offset);

    const days: CalendarDay[] = [];
    const cursor = new Date(startDate);

    // 6 weeks = 42 days
    for (let i = 0; i < 42; i++) {
      const date         = new Date(cursor);
      const isCurrentMonth = date.getMonth() === month;
      const isToday      = this.isSameDay(date, today);
      const isSelected   = selected
        ? this.isSameDay(date, selected)
        : false;
      const tasks        = this.getTasksForDate(date);

      days.push({ date, isCurrentMonth, isToday, isSelected, tasks });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  });

  // ── Week view computed ────────────────────────────────────
  weekDays = computed<WeekDay[]>(() => {
    const current = this.currentDate();
    const today   = new Date();
    const day     = current.getDay();
    const offset  = day === 0 ? 6 : day - 1;
    const monday  = new Date(current);
    monday.setDate(current.getDate() - offset);

    return Array.from({ length: 7 }, (_, i) => {
      const date  = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        date,
        label:   date.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks:   this.getTasksForDate(date),
        isToday: this.isSameDay(date, today)
      };
    });
  });

  // ── Month/year label ──────────────────────────────────────
  monthLabel = computed(() =>
    this.currentDate().toLocaleDateString('en-US', {
      month: 'long', year: 'numeric'
    })
  );

  weekLabel = computed(() => {
    const days = this.weekDays();
    if (!days.length) return '';
    const first = days[0].date;
    const last  = days[6].date;
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString('en-US', opts)} — ${last.toLocaleDateString('en-US', opts)}, ${last.getFullYear()}`;
  });

  // ── Stats ─────────────────────────────────────────────────
  get todayTaskCount(): number {
    return this.getTasksForDate(new Date()).length;
  }

  get overdueCount(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.taskService.tasks().filter(
      t => !t.done && new Date(t.dueDate) < now
    ).length;
  }

  get thisWeekCount(): number {
    const now  = new Date();
    const week = new Date();
    week.setDate(week.getDate() + 7);
    return this.taskService.tasks().filter(t => {
      const d = new Date(t.dueDate);
      return !t.done && d >= now && d <= week;
    }).length;
  }

  // ── Navigation ────────────────────────────────────────────
  prevPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    this.currentDate.set(d);
  }

  nextPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    this.currentDate.set(d);
  }

  goToday(): void {
    this.currentDate.set(new Date());
  }

  // ── Date click ────────────────────────────────────────────
  onDayClick(day: CalendarDay): void {
    this.selectedDate.set(day.date);
    this.openAddModal(day.date);
  }

  onWeekDayClick(day: WeekDay): void {
    this.selectedDate.set(day.date);
    this.openAddModal(day.date);
  }

  // ── Task click ────────────────────────────────────────────
  onTaskClick(task: Task, event: Event): void {
    event.stopPropagation();
    this.selectedTask.set(task);
    this.showTaskDetail.set(true);
  }

  // ── Modal ────────────────────────────────────────────────
  openAddModal(date?: Date): void {
    this.editingTask.set(null);
    this.form.reset({
      priority:  'medium',
      category:  'Personal',
      dueDate:   date ?? new Date()
    });
    this.showModal.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.showTaskDetail.set(false);
    this.form.patchValue({
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      category:    task.category,
      dueDate:     new Date(task.dueDate)
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTask.set(null);
  }

  // ── Save ─────────────────────────────────────────────────
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v       = this.form.value;
    const editing = this.editingTask();

    if (editing) {
      this.taskService.updateTask(editing.id, {
        title:       v.title!,
        description: v.description ?? '',
        priority:    v.priority as Priority,
        category:    v.category!,
        dueDate:     (v.dueDate as Date)?.toISOString()
                     ?? editing.dueDate
      });
      this.msg.add({
        severity: 'success',
        summary:  'Task updated',
        life:     2500
      });
    } else {
      this.taskService.addTask({
        title:       v.title!,
        description: v.description ?? '',
        priority:    v.priority as Priority,
        category:    v.category!,
        dueDate:     (v.dueDate as Date)?.toISOString()
                     ?? new Date().toISOString(),
        status:      'pending',
        done:        false,
        tags:        []
      });
      this.msg.add({
        severity: 'success',
        summary:  'Task added',
        life:     2500
      });
    }

    this.closeModal();
  }

  // ── Toggle done ───────────────────────────────────────────
  onToggleDone(task: Task): void {
    this.taskService.toggleDone(task.id);
    this.showTaskDetail.set(false);
    this.msg.add({
      severity: 'success',
      summary:  task.done ? 'Task reopened' : 'Task completed',
      life:     2000
    });
  }

  // ── Delete ────────────────────────────────────────────────
  onDelete(task: Task): void {
    this.taskService.deleteTask(task.id);
    this.showTaskDetail.set(false);
    this.msg.add({
      severity: 'warn',
      summary:  'Task deleted',
      life:     2000
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  private getTasksForDate(date: Date): Task[] {
    return this.taskService.tasks().filter(t => {
      const d = new Date(t.dueDate);
      return this.isSameDay(d, date);
    });
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth()    === b.getMonth()    &&
      a.getDate()     === b.getDate()
    );
  }

  getPriorityColor(p: Priority): string {
    return PRIORITY_CONFIG[p].color;
  }

  getPriorityBg(p: Priority): string {
    return PRIORITY_CONFIG[p].bgColor;
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}