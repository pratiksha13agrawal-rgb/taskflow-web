import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Note, NOTE_COLORS, NoteColor } from '../../core/models/note.model';
import { NoteService } from '../../core/services/note-service';

@Component({
  selector: 'app-notes',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers:   [MessageService, ConfirmationService],
  templateUrl: './notes.html',
  styleUrl: './notes.scss',
  standalone: true
})
export class Notes {
  noteService = inject(NoteService);
  private fb  = inject(FormBuilder);
  private msg = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  // ── UI state ─────────────────────────────────────────────
  showModal    = signal(false);
  editingNote  = signal<Note | null>(null);
  searchQuery  = signal('');
  activeColor  = signal<NoteColor | 'all'>('all');
  viewMode     = signal<'grid' | 'list'>('grid');
  tagInput     = signal('');
  tags         = signal<string[]>([]);

  noteColors   = NOTE_COLORS;
  colorKeys    = Object.keys(NOTE_COLORS) as NoteColor[];

  // ── Form ─────────────────────────────────────────────────
  form = this.fb.group({
    title:   ['', [Validators.required, Validators.minLength(1)]],
    content: ['', Validators.required],
    color:   ['lavender' as NoteColor],
  });

  selectedColor = signal<NoteColor>('lavender');

  // ── Computed ─────────────────────────────────────────────
  filteredNotes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const color = this.activeColor();

    return this.noteService.notes()
      .filter(n =>
        !query ||
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        n.tags.some(t => t.includes(query))
      )
      .filter(n => color === 'all' || n.color === color);
  });

  pinnedNotes = computed(() =>
    this.filteredNotes().filter(n => n.pinned)
  );

  regularNotes = computed(() =>
    this.filteredNotes().filter(n => !n.pinned)
  );

  // ── Modal ────────────────────────────────────────────────
  openAddModal(): void {
    this.editingNote.set(null);
    this.tags.set([]);
    this.selectedColor.set('lavender');
    this.form.reset({ title: '', content: '', color: 'lavender' });
    this.showModal.set(true);
  }

  openEditModal(note: Note, event: Event): void {
    event.stopPropagation();
    this.editingNote.set(note);
    this.tags.set([...note.tags]);
    this.selectedColor.set(note.color);
    this.form.patchValue({
      title:   note.title,
      content: note.content,
      color:   note.color
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingNote.set(null);
  }

  selectColor(color: NoteColor): void {
    this.selectedColor.set(color);
    this.form.patchValue({ color });
  }

  // ── Tags ─────────────────────────────────────────────────
  onTagKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const val = this.tagInput().trim().toLowerCase();
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
    const editing = this.editingNote();

    if (editing) {
      this.noteService.updateNote(editing.id, {
        title:   v.title!,
        content: v.content!,
        color:   this.selectedColor(),
        tags:    this.tags()
      });
      this.msg.add({ severity: 'success', summary: 'Note updated', life: 2000 });
    } else {
      this.noteService.addNote({
        title:   v.title!,
        content: v.content!,
        color:   this.selectedColor(),
        pinned:  false,
        tags:    this.tags()
      });
      this.msg.add({ severity: 'success', summary: 'Note added', life: 2000 });
    }

    this.closeModal();
  }

  // ── Actions ──────────────────────────────────────────────
  onPin(note: Note, event: Event): void {
    event.stopPropagation();
    this.noteService.togglePin(note.id);
    this.msg.add({
      severity: 'info',
      summary:  note.pinned ? 'Note unpinned' : 'Note pinned',
      life:     2000
    });
  }

  onDelete(note: Note, event: Event): void {
    event.stopPropagation();
    this.confirmSvc.confirm({
      message: `Delete "${note.title}"?`,
      header:  'Confirm delete',
      icon:    'pi pi-trash',
      accept:  () => {
        this.noteService.deleteNote(note.id);
        this.msg.add({ severity: 'warn', summary: 'Note deleted', life: 2000 });
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getColorStyle(color: NoteColor): Record<string, string> {
    const c = NOTE_COLORS[color];
    return {
      background:   c.bg,
      borderColor:  c.border,
      '--note-text': c.text
    };
  }

  getNoteTextColor(color: NoteColor): string {
    return NOTE_COLORS[color].text;
  }

  getColorBg(color: NoteColor): string {
    return NOTE_COLORS[color].bg;
  }

  getColorBorder(color: NoteColor): string {
    return NOTE_COLORS[color].border;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric'
    });
  }

  truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }
}
