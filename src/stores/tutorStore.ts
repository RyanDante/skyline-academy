import { create } from 'zustand';

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUri?: string;
  /** Past questions the Tutor matched, shown as tappable chips. */
  relatedQuestionIds?: string[];
  /** True when the Tutor said it isn't sure and offered a teacher. */
  suggestTeacher?: boolean;
  pending?: boolean;
  error?: boolean;
}

interface TutorState {
  messages: TutorMessage[];
  mode: 'explain' | 'solve-with-me';
  add: (message: TutorMessage) => void;
  update: (id: string, patch: Partial<TutorMessage>) => void;
  setMode: (mode: TutorState['mode']) => void;
  clear: () => void;
}

export const useTutorStore = create<TutorState>()((set) => ({
  messages: [],
  mode: 'explain',
  add: (message) => set((s) => ({ messages: [...s.messages, message] })),
  update: (id, patch) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
  setMode: (mode) => set({ mode }),
  clear: () => set({ messages: [] }),
}));
