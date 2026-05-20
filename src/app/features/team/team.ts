import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CATEGORIES, Priority, PRIORITY_CONFIG } from '../../core/models/task.model';
import { TeamService } from '../../core/services/team-service';
import { AuthService } from '../../core/services/auth-service';
import { AVATAR_GRADIENTS, MemberRole, ROLE_CONFIG, TeamMember, TeamTask } from '../../core/models/team.model';

@Component({
  selector: 'app-team',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    DatePickerModule,
  ],
  providers:   [MessageService, ConfirmationService],
  templateUrl: './team.html',
  styleUrl: './team.scss',
  standalone: true
})
export class Team {

  Math = Math; 
  teamService = inject(TeamService);
  auth        = inject(AuthService);
  private fb  = inject(FormBuilder);
  private msg = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  // ── UI state ─────────────────────────────────────────────
  activeTab       = signal<'board' | 'members'>('board');
  showInviteModal = signal(false);
  showTaskModal   = signal(false);
  editingTask     = signal<TeamTask | null>(null);

  roleConfig     = ROLE_CONFIG;
  avatarGradients = AVATAR_GRADIENTS;
  priorityConfig = PRIORITY_CONFIG;

  // ── Options ──────────────────────────────────────────────
  roleOptions = [
    { label: 'Admin',  value: 'admin'  },
    { label: 'Member', value: 'member' },
    { label: 'Viewer', value: 'viewer' },
  ];

  statusOptions = [
    { label: 'Pending',     value: 'pending'     },
    { label: 'In progress', value: 'in_progress' },
    { label: 'Completed',   value: 'completed'   },
  ];

  priorityOptions = [
    { label: 'High',   value: 'high'   },
    { label: 'Medium', value: 'medium' },
    { label: 'Low',    value: 'low'    },
  ];

  categoryOptions = CATEGORIES.map(c => ({ label: c, value: c }));

  // ── Computed member options ───────────────────────────────
  memberOptions = computed(() =>
    this.teamService.members()
      .filter(m => m.status === 'active')
      .map(m => ({ label: m.name, value: m.id }))
  );

  // ── Board columns ─────────────────────────────────────────
  boardColumns = [
    { key: 'pending',     label: 'To Do',       color: '#f6ad55', bg: '#fffaf0' },
    { key: 'in_progress', label: 'In Progress',  color: '#5c4dc9', bg: '#f5f0ff' },
    { key: 'completed',   label: 'Completed',    color: '#0f6e56', bg: '#edfff7' },
  ];

  // ── Forms ─────────────────────────────────────────────────
  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role:  ['member', Validators.required],
  });

  taskForm = this.fb.group({
    title:      ['', [Validators.required, Validators.minLength(3)]],
    assigneeId: [null as number | null, Validators.required],
    priority:   ['medium', Validators.required],
    status:     ['pending', Validators.required],
    category:   ['Frontend', Validators.required],
    dueDate:    [new Date() as Date | null],
  });

  // ── Computed ─────────────────────────────────────────────
  getColumnTasks = computed(() =>
    (status: string) =>
      this.teamService.tasks().filter(t => t.status === status)
  );

  completionRate = computed(() => {
    const total = this.teamService.totalTasks();
    const done  = this.teamService.completedTasks();
    return total ? Math.round((done / total) * 100) : 0;
  });

  // ── Invite ────────────────────────────────────────────────
  onInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const v = this.inviteForm.value;
    this.teamService.inviteMember(v.email!, v.role as MemberRole);
    this.msg.add({
      severity: 'success',
      summary:  'Invitation sent',
      detail:   `Invite sent to ${v.email}`,
      life:     2500
    });
    this.inviteForm.reset({ role: 'member' });
    this.showInviteModal.set(false);
  }

  // ── Remove member ─────────────────────────────────────────
  onRemoveMember(member: TeamMember): void {
    this.confirmSvc.confirm({
      message: `Remove ${member.name} from workspace?`,
      header:  'Confirm remove',
      icon:    'pi pi-user-minus',
      accept:  () => {
        this.teamService.removeMember(member.id);
        this.msg.add({
          severity: 'warn',
          summary:  'Member removed',
          life:     2500
        });
      }
    });
  }

  // ── Role change ───────────────────────────────────────────
  onRoleChange(member: TeamMember, role: MemberRole): void {
    this.teamService.updateMemberRole(member.id, role);
    this.msg.add({
      severity: 'info',
      summary:  'Role updated',
      life:     2000
    });
  }

  // ── Task modal ────────────────────────────────────────────
  openAddTaskModal(): void {
    this.editingTask.set(null);
    this.taskForm.reset({
      priority:   'medium',
      status:     'pending',
      category:   'Frontend',
      dueDate:    new Date(),
      assigneeId: this.memberOptions()[0]?.value ?? null
    });
    this.showTaskModal.set(true);
  }

  openEditTaskModal(task: TeamTask): void {
    this.editingTask.set(task);
    this.taskForm.patchValue({
      title:      task.title,
      assigneeId: task.assigneeId,
      priority:   task.priority,
      status:     task.status,
      category:   task.category,
      dueDate:    new Date(task.dueDate)
    });
    this.showTaskModal.set(true);
  }

  onSaveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const v       = this.taskForm.value;
    const editing = this.editingTask();

    if (editing) {
      this.teamService.updateTaskStatus(
        editing.id,
        v.status as TeamTask['status']
      );
      this.msg.add({
        severity: 'success',
        summary:  'Task updated',
        life:     2500
      });
    } else {
      this.teamService.addTask({
        title:      v.title!,
        assigneeId: v.assigneeId!,
        priority:   v.priority as Priority,
        status:     v.status as TeamTask['status'],
        category:   v.category!,
        dueDate:    (v.dueDate as Date)?.toISOString()
                    ?? new Date().toISOString()
      });
      this.msg.add({
        severity: 'success',
        summary:  'Task added',
        life:     2500
      });
    }

    this.showTaskModal.set(false);
    this.editingTask.set(null);
  }

  onDeleteTask(task: TeamTask): void {
    this.confirmSvc.confirm({
      message: `Delete "${task.title}"?`,
      header:  'Confirm delete',
      icon:    'pi pi-trash',
      accept:  () => {
        this.teamService.deleteTask(task.id);
        this.msg.add({
          severity: 'warn',
          summary:  'Task deleted',
          life:     2500
        });
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getMember(id: number): TeamMember | undefined {
    return this.teamService.getMemberById(id);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getPriorityColor(p: string): string {
    return PRIORITY_CONFIG[p as Priority]?.color ?? '#888';
  }

  getPriorityBg(p: string): string {
    return PRIORITY_CONFIG[p as Priority]?.bgColor ?? '#f5f5f5';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric'
    });
  }
}
