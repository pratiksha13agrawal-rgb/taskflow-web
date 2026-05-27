import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// PrimeNG
import { DialogModule }       from 'primeng/dialog';
import { InputTextModule }    from 'primeng/inputtext';
import { TextareaModule }     from 'primeng/textarea';
import { TooltipModule }      from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule }        from 'primeng/toast';
import { SelectModule }        from 'primeng/select';
import { ProgressBarModule }  from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Task, Priority, CATEGORIES, PRIORITY_CONFIG } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task-service';
import {  CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePickerModule }    from 'primeng/datepicker';

@Component({
  selector: 'app-today-tasks',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressBarModule,
  ],
  providers:   [MessageService, ConfirmationService],
  templateUrl: './today-tasks.html',
  styleUrl: './today-tasks.scss',
  standalone: true
})
export class TodayTasks implements OnInit{
  taskService = inject(TaskService);
  private fb  = inject(FormBuilder);
  private msg = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  // ── UI state ─────────────────────────────────────────────
  showModal    = signal(false);
  editingTask  = signal<Task | null>(null);
  activeFilter = signal<Priority | 'all'>('all');
  searchQuery  = signal('');
  tagInput     = signal('');
  tags         = signal<string[]>([]);

  // ── Options ──────────────────────────────────────────────
  filterOptions = [
    { label: 'All',    value: 'all'    },
    { label: 'High',   value: 'high'   },
    { label: 'Medium', value: 'medium' },
    { label: 'Low',    value: 'low'    },
  ];

  categoryOptions = CATEGORIES.map(c => ({ label: c, value: c }));

  priorityOptions = [
    { label: 'High',   value: 'high'   },
    { label: 'Medium', value: 'medium' },
    { label: 'Low',    value: 'low'    },
  ];

  priorities: Priority[] = ['high', 'medium', 'low'];
  priorityConfig = PRIORITY_CONFIG;

  ngOnInit(): void {
    this.taskService.loadTasks().subscribe();
  }

  // ── Form ─────────────────────────────────────────────────
  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority:    ['medium', Validators.required],
    category:    ['Personal', Validators.required],
    dueDate:     [new Date() as Date | null],
  });

  // ── Computed ─────────────────────────────────────────────
  filteredTasks = computed(() => {
    const filter = this.activeFilter();
    const query  = this.searchQuery().toLowerCase();
    return this.taskService.tasks()
      .filter(t => !t.done)
      .filter(t => filter === 'all' || t.priority === filter)
      .filter(t =>
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
  });

  columnTasks = computed(() => (p: Priority) =>
    this.filteredTasks().filter(t => t.priority === p)
  );

  progressValue = computed(() => {
    const total = this.taskService.totalCount();
    const done  = this.taskService.completedCount();
    return total ? Math.round((done / total) * 100) : 0;
  });

  // ── Modal ────────────────────────────────────────────────
  openAddModal(): void {
    this.editingTask.set(null);
    this.tags.set([]);
    this.form.reset({
      priority: 'medium',
      category: 'Personal',
      dueDate:  new Date()
    });
    this.showModal.set(true);
  }

  openEditModal(task: Task, event: Event): void {
    event.stopPropagation();
    this.editingTask.set(task);
    this.tags.set([...task.tags]);
    this.form.patchValue({
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      category:    task.category,
      dueDate:     task.dueDate ? new Date(task.dueDate) : new Date()
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTask.set(null);
  }

  // ── Tags ─────────────────────────────────────────────────
  onTagKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();
    const val = this.tagInput().trim().toLowerCase().replace(',', '');
    if (val && !this.tags().includes(val)) {
      this.tags.update(t => [...t, val]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(x => x !== tag));
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
        dueDate:     (v.dueDate as Date)?.toISOString() ?? '',
        tags:        this.tags()
      }).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Task updated', life: 2500 });
          this.closeModal();
        },
        error: (err) => {
          this.msg.add({ severity: 'error', summary: 'Error', detail: err.userMessage, life: 3000 });
        }
      });
    } else {
      this.taskService.addTask({
        title:       v.title!,
        description: v.description ?? '',
        priority:    v.priority as Priority,
        category:    v.category!,
        dueDate:     (v.dueDate as Date)?.toISOString() ?? '',
        status:      'pending',
        done:        false,
        tags:        this.tags()
      }).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'Task added', life: 2500 });
          this.closeModal();
        },
        error: (err) => {
          this.msg.add({ severity: 'error', summary: 'Error', detail: err.userMessage, life: 3000 });
        }
      });
    }
  }

  // ── Delete ───────────────────────────────────────────────
  onDelete(task: Task, event: Event): void {
    event.stopPropagation();
    this.confirmSvc.confirm({
       message: `Delete "${task.title}"?`,
       header:  'Confirm delete',
       icon:    'pi pi-trash',
       accept:  () => {
         this.taskService.deleteTask(task.id).subscribe({
           next: () => {
             this.msg.add({
               severity: 'warn',
               summary:  'Task deleted',
               life:     2500
             });
           },
           error: (err) => {
             this.msg.add({
               severity: 'error',
               summary:  'Error',
               detail:   err.userMessage,
               life:     3000
             });
           }
         });
       }
    });
  }

  // ── Toggle ───────────────────────────────────────────────
  onToggle(id: number, event: Event): void {
    event.stopPropagation();
    this.taskService.toggleDone(id).subscribe({
    error: (err) => {
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: err.userMessage,
        life: 3000
      });
    }
  });
  }

  // ── Drag drop ────────────────────────────────────────────
  onDrop(event: CdkDragDrop<Task[]>, priority: Priority): void {
    const all    = [...this.taskService.tasks()];
    const col    = all.filter(t => t.priority === priority && !t.done);
    const others = all.filter(t => !(t.priority === priority && !t.done));
    moveItemInArray(col, event.previousIndex, event.currentIndex);
    this.taskService.reorderTasks([...col, ...others]);
  }

  // ── Helpers ──────────────────────────────────────────────
  getPriorityColor(p: Priority): string {
    return PRIORITY_CONFIG[p].color;
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  formatDate(dateStr: string): string {
    const d     = new Date(dateStr);
    const today = new Date();
    const diff  = Math.floor(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0)  return 'Today';
    if (diff === 1)  return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      Design:   '#f5f0ff', Frontend: '#e8f8ff',
      Backend:  '#edfff7', Database: '#fffbf0',
      Security: '#fff0f5', Testing:  '#f0fff4',
      DevOps:   '#f0f8ff', Personal: '#faf0ff',
      Other:    '#f5f5f5'
    };
    return map[cat] ?? '#f5f5f5';
  }

  getCategoryText(cat: string): string {
    const map: Record<string, string> = {
      Design:   '#5c4dc9', Frontend: '#0369a1',
      Backend:  '#0f6e56', Database: '#854f0b',
      Security: '#993556', Testing:  '#3b6d11',
      DevOps:   '#185fa5', Personal: '#3c3489',
      Other:    '#6b7280'
    };
    return map[cat] ?? '#6b7280';
  }
}
