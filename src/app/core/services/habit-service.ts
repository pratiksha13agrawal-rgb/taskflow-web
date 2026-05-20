import { computed, Injectable, signal } from '@angular/core';
import { Habit, HabitEntry } from '../models/habit.model';

@Injectable({
  providedIn: 'root',
})
export class HabitService {
   private _habits = signal<Habit[]>([
    {
      id: 1, name: 'Morning run',
      description: '30 minute jog every morning',
      icon: 'pi pi-bolt', color: '#0f6e56', bgColor: '#edfff7',
      frequency: 'daily', category: 'fitness', targetDays: 30,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(85)
    },
    {
      id: 2, name: 'Read 30 mins',
      description: 'Read books or articles daily',
      icon: 'pi pi-book', color: '#5c4dc9', bgColor: '#f5f0ff',
      frequency: 'daily', category: 'learning', targetDays: 21,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(60)
    },
    {
      id: 3, name: 'Drink 8 glasses',
      description: 'Stay hydrated throughout the day',
      icon: 'pi pi-heart', color: '#185fa5', bgColor: '#f0f8ff',
      frequency: 'daily', category: 'health', targetDays: 30,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(100)
    },
    {
      id: 4, name: 'Meditate',
      description: '10 minutes mindfulness meditation',
      icon: 'pi pi-sun', color: '#854f0b', bgColor: '#fffbf0',
      frequency: 'daily', category: 'mindfulness', targetDays: 21,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(40)
    },
    {
      id: 5, name: 'Code practice',
      description: 'Practice coding for at least 1 hour',
      icon: 'pi pi-chart-bar', color: '#993556', bgColor: '#fff0f5',
      frequency: 'daily', category: 'productivity', targetDays: 30,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(70)
    },
    {
      id: 6, name: 'Journaling',
      description: 'Write daily thoughts and reflections',
      icon: 'pi pi-file-edit', color: '#d45420', bgColor: '#fff5f0',
      frequency: 'daily', category: 'personal', targetDays: 14,
      createdAt: new Date().toISOString(),
      entries: this.generateEntries(50)
    },
  ]);

  habits      = this._habits.asReadonly();
  totalHabits = computed(() => this._habits().length);

  todayCompleted = computed(() =>
    this._habits().filter(h => this.isCompletedToday(h)).length
  );

  overallStreak = computed(() =>
    Math.max(...this._habits().map(h => this.getStreak(h)), 0)
  );

  // ── Helpers ──────────────────────────────────────────────
  private generateEntries(completionRate: number): HabitEntry[] {
    const entries: HabitEntry[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date:      date.toISOString().split('T')[0],
        completed: Math.random() * 100 < completionRate
      });
    }
    return entries;
  }

  isCompletedToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.entries.some(
      e => e.date === today && e.completed
    );
  }

  getStreak(habit: Habit): number {
    const sorted = [...habit.entries]
      .sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const entry of sorted) {
      if (entry.completed) streak++;
      else break;
    }
    return streak;
  }

  getCompletionRate(habit: Habit): number {
    if (!habit.entries.length) return 0;
    const done = habit.entries.filter(e => e.completed).length;
    return Math.round((done / habit.entries.length) * 100);
  }

  getLast7Days(habit: Habit): HabitEntry[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found   = habit.entries.find(e => e.date === dateStr);
      return found ?? { date: dateStr, completed: false };
    });
  }

  getLast30Days(habit: Habit): HabitEntry[] {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found   = habit.entries.find(e => e.date === dateStr);
      return found ?? { date: dateStr, completed: false };
    });
  }

  // ── CRUD ─────────────────────────────────────────────────
  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'entries'>): void {
    this._habits.update(h => [{
      ...habit,
      id:        Date.now(),
      createdAt: new Date().toISOString(),
      entries:   []
    }, ...h]);
  }

  updateHabit(id: number, changes: Partial<Habit>): void {
    this._habits.update(h =>
      h.map(x => x.id === id ? { ...x, ...changes } : x)
    );
  }

  deleteHabit(id: number): void {
    this._habits.update(h => h.filter(x => x.id !== id));
  }

  toggleToday(id: number): void {
    const today = new Date().toISOString().split('T')[0];
    this._habits.update(habits =>
      habits.map(h => {
        if (h.id !== id) return h;
        const exists = h.entries.find(e => e.date === today);
        if (exists) {
          return {
            ...h,
            entries: h.entries.map(e =>
              e.date === today
                ? { ...e, completed: !e.completed }
                : e
            )
          };
        }
        return {
          ...h,
          entries: [...h.entries, { date: today, completed: true }]
        };
      })
    );
  }
}
