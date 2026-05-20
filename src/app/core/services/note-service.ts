import { computed, Injectable, signal } from '@angular/core';
import { Note } from '../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
    private _notes = signal<Note[]>([
    {
      id: 1,
      title:   'Project ideas',
      content: 'TaskFlow feature ideas:\n- AI task suggestions\n- Team chat integration\n- Voice input for quick tasks\n- Weekly report export',
      color:   'lavender',
      pinned:  true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['ideas', 'project']
    },
    {
      id: 2,
      title:   'Spring Boot setup steps',
      content: '1. Initialize project with Spring Initializr\n2. Add Security, JPA, MySQL dependencies\n3. Configure application.properties\n4. Create User entity\n5. Implement JWT filter',
      color:   'mint',
      pinned:  true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['backend', 'setup']
    },
    {
      id: 3,
      title:   'Angular 21 notes',
      content: 'Key concepts to practice:\n- Signals and computed()\n- Standalone components\n- New control flow @if @for\n- Deferred loading @defer',
      color:   'sky',
      pinned:  false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['angular', 'learning']
    },
    {
      id: 4,
      title:   'Meeting notes',
      content: 'Discussion points:\n- API design review\n- Database schema finalize\n- Frontend component library\n- Deploy strategy',
      color:   'amber',
      pinned:  false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['meeting']
    },
    {
      id: 5,
      title:   'Pastel UI references',
      content: 'Color palette:\n- Lavender: #f5f0ff\n- Rose: #fff0f5\n- Mint: #edfff7\n- Amber: #fffbf0\n- Sky: #f0f8ff',
      color:   'rose',
      pinned:  false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['design', 'ui']
    },
    {
      id: 6,
      title:   'Grocery list',
      content: '- Milk\n- Bread\n- Eggs\n- Coffee\n- Fruits',
      color:   'peach',
      pinned:  false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['personal']
    }
  ]);

  notes   = this._notes.asReadonly();
  pinned  = computed(() => this._notes().filter(n => n.pinned));
  regular = computed(() => this._notes().filter(n => !n.pinned));
  total   = computed(() => this._notes().length);

  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): void {
    this._notes.update(notes => [{
      ...note,
      id:        Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, ...notes]);
  }

  updateNote(id: number, changes: Partial<Note>): void {
    this._notes.update(notes =>
      notes.map(n =>
        n.id === id
          ? { ...n, ...changes, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }

  deleteNote(id: number): void {
    this._notes.update(notes => notes.filter(n => n.id !== id));
  }

  togglePin(id: number): void {
    this._notes.update(notes =>
      notes.map(n =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      )
    );
  }
}
