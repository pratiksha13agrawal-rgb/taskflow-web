import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
export class CompletedTasks {
  taskService = inject(TaskService);
  private msg = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  searchQuery     = signal('');
  selectedCategory = signal('all');
  selectedPriority = signal('all');

  priorityConfig = PRIORITY_CONFIG;

  categoryOptions = [
    { label: 'All Categories', value: 'all'      },
    { label: 'Design',         value: 'Design'   },
    { label: 'Frontend',       value: 'Frontend' },
    { label: 'Backend',        value: 'Backend'  },
    { label: 'Database',       value: 'Database' },
    { label: 'Security',       value: 'Security' },
    { label: 'Testing',        value: 'Testing'  },
    { label: 'DevOps',         value: 'DevOps'   },
    { label: 'Personal',       value: 'Personal' },
    { label: 'Other',          value: 'Other'    },
  ];

  priorityOptions = [
    { label: 'All Priorities', value: 'all'    },
    { label: 'High',           value: 'high'   },
    { label: 'Medium',         value: 'medium' },
    { label: 'Low',            value: 'low'    },
  ];

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

  // ── Actions ──────────────────────────────────────────────
  onRestore(task: Task): void {
    this.taskService.updateTask(task.id, {
      done:   false,
      status: 'pending'
    });
    this.msg.add({
      severity: 'success',
      summary:  'Task restored',
      detail:   `"${task.title}" moved back to pending`,
      life:     2500
    });
  }

  onDelete(task: Task): void {
    this.confirmSvc.confirm({
      message: `Permanently delete "${task.title}"?`,
      header:  'Confirm delete',
      icon:    'pi pi-trash',
      accept:  () => {
        this.taskService.deleteTask(task.id);
        this.msg.add({
          severity: 'warn',
          summary:  'Task deleted',
          life:     2500
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
        completed.forEach(t => this.taskService.deleteTask(t.id));
        this.msg.add({
          severity: 'warn',
          summary:  'All completed tasks cleared',
          life:     2500
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
