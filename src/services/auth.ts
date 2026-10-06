import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';

import { config } from '@/lib/config';
import { firebaseAuth } from '@/lib/firebase';

type ConfirmationResult = Awaited<ReturnType<typeof signInWithPhoneNumber>>;

/** The pending phone confirmation lives in memory between the phone and code screens. */
let pendingConfirmation: ConfirmationResult | null = null;
let pendingPhone: string | null = null;

const MOCK_CODE = '123456';

/** Normalises Cameroon numbers to E.164: "6XX XX XX XX" → "+2376XXXXXXXX". */
export function normaliseCameroonPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;
  return /^6\d{8}$/.test(local) ? `+237${local}` : null;
}

export const authService = {
  async sendCode(phoneE164: string): Promise<void> {
    pendingPhone = phoneE164;
    if (config.useMocks) return;
    pendingConfirmation = await signInWithPhoneNumber(firebaseAuth(), phoneE164);
  },

  /** Returns the signed-in uid. */
  async confirmCode(code: string): Promise<{ uid: string; phone: string | null }> {
    if (config.useMocks) {
      if (code !== MOCK_CODE) throw new Error('That code is not right. In demo mode use 123456.');
      return { uid: `demo-${pendingPhone ?? 'user'}`, phone: pendingPhone };
    }
    if (!pendingConfirmation) throw new Error('Your code expired. Send a new one.');
    const credential = await pendingConfirmation.confirm(code);
    pendingConfirmation = null;
    const user = credential?.user;
    if (!user) throw new Error('Sign-in did not complete. Try again.');
    return { uid: user.uid, phone: user.phoneNumber };
  },

  pendingPhone: () => pendingPhone,

  async signOut(): Promise<void> {
    if (!config.useMocks) await firebaseSignOut(firebaseAuth());
  },

  /** Subscribes to Firebase auth changes. No-op in mock mode. */
  listen(callback: (user: { uid: string; phone: string | null } | null) => void): () => void {
    if (config.useMocks) return () => {};
    return onAuthStateChanged(firebaseAuth(), (user) =>
      callback(user ? { uid: user.uid, phone: user.phoneNumber } : null),
    );
  },
};
