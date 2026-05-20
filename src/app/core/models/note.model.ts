export type NoteColor =
  'lavender' | 'rose' | 'mint' | 'amber' | 'sky' | 'peach';

export interface Note {
  id:        number;
  title:     string;
  content:   string;
  color:     NoteColor;
  pinned:    boolean;
  createdAt: string;
  updatedAt: string;
  tags:      string[];
}

export const NOTE_COLORS: Record<NoteColor, {
  bg: string; border: string; text: string; light: string;
}> = {
  lavender: {
    bg:     '#f5f0ff',
    border: '#d8cfff',
    text:   '#5c4dc9',
    light:  '#ede8ff'
  },
  rose: {
    bg:     '#fff0f5',
    border: '#ffb3d1',
    text:   '#993556',
    light:  '#ffd6e8'
  },
  mint: {
    bg:     '#edfff7',
    border: '#96eecb',
    text:   '#0f6e56',
    light:  '#c8f7e4'
  },
  amber: {
    bg:     '#fffbf0',
    border: '#ffe08a',
    text:   '#854f0b',
    light:  '#fff0c2'
  },
  sky: {
    bg:     '#f0f8ff',
    border: '#a8d8ff',
    text:   '#185fa5',
    light:  '#d6edff'
  },
  peach: {
    bg:     '#fff5f0',
    border: '#ffbfa0',
    text:   '#d45420',
    light:  '#ffe0d0'
  }
};