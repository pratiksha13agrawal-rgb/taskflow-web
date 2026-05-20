import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth-service';
import { ThemeService } from '../../core/services/theme-service';
import { TaskService } from '../../core/services/task-service';
import { HabitService } from '../../core/services/habit-service';
import { NoteService } from '../../core/services/note-service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    TooltipModule,
  ],
  providers:   [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  standalone: true
})
export class Profile {
   auth         = inject(AuthService);
  theme        = inject(ThemeService);
  taskService  = inject(TaskService);
  habitService = inject(HabitService);
  noteService  = inject(NoteService);
  private fb   = inject(FormBuilder);
  private msg  = inject(MessageService);

  // ── UI state ─────────────────────────────────────────────
  activeTab      = signal<'profile' | 'security' | 'preferences'>('profile');
  editingProfile = signal(false);
  savingProfile  = signal(false);
  savingPassword = signal(false);

  // ── Avatar colors ─────────────────────────────────────────
  avatarColors = [
    { bg: 'linear-gradient(135deg,#9d8ef0,#f564a0)', label: 'Purple Rose' },
    { bg: 'linear-gradient(135deg,#5dcaa5,#70bfff)',  label: 'Mint Sky'   },
    { bg: 'linear-gradient(135deg,#ffc84a,#ff9870)',  label: 'Amber Peach'},
    { bg: 'linear-gradient(135deg,#ff8ab8,#ffc84a)',  label: 'Rose Amber' },
    { bg: 'linear-gradient(135deg,#70bfff,#9d8ef0)',  label: 'Sky Lavender'},
    { bg: 'linear-gradient(135deg,#5dcaa5,#9d8ef0)',  label: 'Mint Lavender'},
  ];

  selectedAvatar = signal(0);

  // ── Timezone options ──────────────────────────────────────
  timezoneOptions = [
    { label: 'UTC+0  London',       value: 'UTC' },
    { label: 'UTC+1  Paris',        value: 'Europe/Paris' },
    { label: 'UTC+3  Moscow',       value: 'Europe/Moscow' },
    { label: 'UTC+5:30 India',      value: 'Asia/Kolkata' },
    { label: 'UTC+8  Singapore',    value: 'Asia/Singapore' },
    { label: 'UTC+9  Tokyo',        value: 'Asia/Tokyo' },
    { label: 'UTC-5  New York',     value: 'America/New_York' },
    { label: 'UTC-8  Los Angeles',  value: 'America/Los_Angeles' },
  ];

  languageOptions = [
    { label: 'English',  value: 'en' },
    { label: 'Hindi',    value: 'hi' },
    { label: 'Spanish',  value: 'es' },
    { label: 'French',   value: 'fr' },
    { label: 'German',   value: 'de' },
    { label: 'Japanese', value: 'ja' },
  ];

  dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'dd/mm/yyyy' },
    { label: 'MM/DD/YYYY', value: 'mm/dd/yyyy' },
    { label: 'YYYY-MM-DD', value: 'yyyy-mm-dd' },
  ];

  // ── Profile form ──────────────────────────────────────────
  profileForm = this.fb.group({
    name:     [
      this.auth.currentUser()?.name ?? '',
      [Validators.required, Validators.minLength(2)]
    ],
    email:    [
      this.auth.currentUser()?.email ?? '',
      [Validators.required, Validators.email]
    ],
    bio:      ['Angular developer building TaskFlow 🚀'],
    phone:    [''],
    location: [''],
    website:  [''],
  });

  // ── Password form ─────────────────────────────────────────
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  // ── Preferences form ──────────────────────────────────────
  prefsForm = this.fb.group({
    timezone:   ['Asia/Kolkata'],
    language:   ['en'],
    dateFormat: ['dd/mm/yyyy'],
  });

  // ── Notification toggles ──────────────────────────────────
  notifications = signal({
    taskReminders:  true,
    habitReminders: true,
    teamUpdates:    true,
    weeklyReport:   false,
    emailDigest:    false,
  });

  // ── Stats ─────────────────────────────────────────────────
  get stats() {
    return [
      {
        label: 'Tasks created',
        value: this.taskService.totalCount(),
        icon:  'pi pi-list',
        color: '#5c4dc9',
        bg:    '#f5f0ff'
      },
      {
        label: 'Tasks done',
        value: this.taskService.completedCount(),
        icon:  'pi pi-check-circle',
        color: '#0f6e56',
        bg:    '#edfff7'
      },
      {
        label: 'Habits tracked',
        value: this.habitService.totalHabits(),
        icon:  'pi pi-bolt',
        color: '#854f0b',
        bg:    '#fffbf0'
      },
      {
        label: 'Notes written',
        value: this.noteService.total(),
        icon:  'pi pi-file-edit',
        color: '#185fa5',
        bg:    '#f0f8ff'
      },
    ];
  }

  // ── Actions ───────────────────────────────────────────────
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);

    setTimeout(() => {
      const v = this.profileForm.value;
      this.auth.currentUser.update(u =>
        u ? { ...u, name: v.name!, email: v.email! } : u
      );
      localStorage.setItem('user', JSON.stringify(this.auth.currentUser()));
      this.savingProfile.set(false);
      this.editingProfile.set(false);
      this.msg.add({
        severity: 'success',
        summary:  'Profile updated',
        life:     2500
      });
    }, 800);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const v = this.passwordForm.value;
    if (v.newPassword !== v.confirmPassword) {
      this.msg.add({
        severity: 'error',
        summary:  'Passwords do not match',
        life:     2500
      });
      return;
    }

    this.savingPassword.set(true);
    setTimeout(() => {
      this.savingPassword.set(false);
      this.passwordForm.reset();
      this.msg.add({
        severity: 'success',
        summary:  'Password changed',
        life:     2500
      });
    }, 800);
  }

  savePreferences(): void {
    this.msg.add({
      severity: 'success',
      summary:  'Preferences saved',
      life:     2500
    });
  }

  toggleNotification(key: keyof ReturnType<typeof this.notifications>): void {
    this.notifications.update(n => ({ ...n, [key]: !n[key] }));
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onLogout(): void {
    this.auth.logout();
  }
}
