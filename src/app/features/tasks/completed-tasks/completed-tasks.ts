import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TaskService } from '../../../core/services/task-service';
import { Task, Priority, PRIORITY_CONFIG } from '../../../core/models/task.model';

@Component({
  selector: 'app-completed-tasks',
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    SelectModule,
  ],
  templateUrl: './completed-tasks.html',
  styleUrl: './completed-tasks.scss',
  providers: [MessageService, ConfirmationService],

  standalone: true
})
export class CompletedTasks implements OnInit {
  taskService = inject(TaskService);
  private msg = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  searchQuery     = signal('');
  selectedCategory = signal('all');
  selectedPriority = signal('all');

  priorityConfig = PRIORITY_CONFIG;

  categoryOptions = computed(() => {
    const cats = [...new Set(
      this.taskService.completed().map(t => t.category)
    )];
    return [
      { label: 'All Categories', value: 'all' },
      ...cats.map(c => ({ label: c, value: c }))
    ];
  });
  
  priorityOptions = computed(() => {
    const priorities = [...new Set(
      this.taskService.completed().map(t => t.priority)
    )];
    return [
      { label: 'All Priorities', value: 'all' },
      ...priorities.map(p => ({
        label: p.charAt(0).toUpperCase() + p.slice(1),
        value: p
      }))
    ];
  });

  // ── Computed ─────────────────────────────────────────────
  filteredCompleted = computed(() => {
    const query    = this.searchQuery().toLowerCase();
    const cat      = this.selectedCategory();
    const priority = this.selectedPriority();

    return this.taskService.completed()
      .filter(t =>
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      )
      .filter(t => cat === 'all'      || t.category === cat)
      .filter(t => priority === 'all' || t.priority === priority);
  });

  totalCompleted = computed(() => this.taskService.completedCount());

  completionRate = computed(() => {
    const total = this.taskService.totalCount();
    const done  = this.taskService.completedCount();
    return total ? Math.round((done / total) * 100) : 0;
  });

  // ── life cycles ──────────────────────────────────────────────
  ngOnInit(): void {
    this.taskService.loadTasks().subscribe();
  }

  // ── Actions ──────────────────────────────────────────────
  onRestore(task: Task): void {
    this.taskService.updateTask(task.id, {
    done:   false,
    status: 'pending',
    title:       task.title,
    description: task.description,
    priority:    task.priority,
    category:    task.category,
    dueDate:     task.dueDate,
    tags:        task.tags
    }).subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary:  'Task restored',
          detail:   `"${task.title}" moved back to pending`,
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

  onDelete(task: Task): void {
    this.confirmSvc.confirm({
      message: `Permanently delete "${task.title}"?`,
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

  clearAll(): void {
    this.confirmSvc.confirm({
      message: 'Delete all completed tasks? This cannot be undone.',
      header:  'Clear all completed',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => {
        const completed = this.taskService.completed();
        const deleteRequests = completed.map(t =>
          this.taskService.deleteTask(t.id)
        );

        // Delete all one by one
        let deleted = 0;
        deleteRequests.forEach(req => {
          req.subscribe({
            next: () => {
              deleted++;
              if(deleted == completed.length) {
                this.msg.add({
                  severity: 'warn',
                  summary: 'All completed tasks cleared',
                  life:     2500
                });
              }
            }
          });
        });
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getPriorityColor(p: Priority): string {
    return PRIORITY_CONFIG[p].color;
  }

  getPriorityBg(p: Priority): string {
    return PRIORITY_CONFIG[p].bgColor;
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric'
    });
  }
}
