import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from '@react-native-firebase/auth';
import Storage from 'expo-sqlite/kv-store';

import { config } from '@/lib/config';
import { firebaseAuth } from '@/lib/firebase';

/**
 * Phone number + password accounts (design mockups 3 and 4).
 *
 * Firebase Auth has no phone+password provider, so the phone number is mapped to an internal
 * email address ("237670123456@phone.skylineacademy.app") for Email/Password sign-in. The number
 * is not verified by SMS; add phone verification later if needed.
 *
 * Demo mode keeps accounts on the device only.
 */

const DEMO_ACCOUNTS_KEY = 'skyline-demo-accounts';
const MIN_PASSWORD = 6;

export interface AuthUser {
  uid: string;
  phone: string;
  displayName: string | null;
}

/** Normalises Cameroon numbers to E.164: "6XX XX XX XX" → "+2376XXXXXXXX". */
export function normaliseCameroonPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;
  return /^6\d{8}$/.test(local) ? `+237${local}` : null;
}

function phoneEmail(phoneE164: string): string {
  return `${phoneE164.replace(/\D/g, '')}@phone.skylineacademy.app`;
}

function emailToPhone(email: string | null): string {
  const digits = email?.split('@')[0] ?? '';
  return digits ? `+${digits}` : '';
}

export class AuthError extends Error {}

/** Friendly messages for Firebase Auth error codes. */
function explain(error: unknown): AuthError {
  const code = String((error as { code?: string })?.code ?? '');
  if (code.includes('email-already-in-use')) return new AuthError('An account already uses this number. Sign in instead.');
  if (code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('user-not-found'))
    return new AuthError('Phone number or password is not right.');
  if (code.includes('weak-password')) return new AuthError(`Use a password of at least ${MIN_PASSWORD} characters.`);
  if (code.includes('network')) return new AuthError('No connection. Check your data and try again.');
  if (code.includes('too-many-requests')) return new AuthError('Too many tries. Wait a few minutes and try again.');
  return new AuthError('Something went wrong. Try again.');
}

type DemoAccounts = Record<string, { password: string; displayName: string }>;

async function demoAccounts(): Promise<DemoAccounts> {
  const raw = await Storage.getItem(DEMO_ACCOUNTS_KEY);
  return raw ? (JSON.parse(raw) as DemoAccounts) : {};
}

export const authService = {
  minPassword: MIN_PASSWORD,

  async signUp(args: { phone: string; password: string; displayName: string }): Promise<AuthUser> {
    if (args.password.length < MIN_PASSWORD) {
      throw new AuthError(`Use a password of at least ${MIN_PASSWORD} characters.`);
    }
    if (config.useMocks) {
      const accounts = await demoAccounts();
      if (accounts[args.phone]) throw new AuthError('An account already uses this number. Sign in instead.');
      accounts[args.phone] = { password: args.password, displayName: args.displayName };
      await Storage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
      return { uid: `demo-${args.phone.replace(/\D/g, '')}`, phone: args.phone, displayName: args.displayName };
    }
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), phoneEmail(args.phone), args.password);
      await updateProfile(cred.user, { displayName: args.displayName });
      return { uid: cred.user.uid, phone: args.phone, displayName: args.displayName };
    } catch (e) {
      throw explain(e);
    }
  },

  async signIn(args: { phone: string; password: string }): Promise<AuthUser> {
    if (config.useMocks) {
      const account = (await demoAccounts())[args.phone];
      if (!account || account.password !== args.password) {
        throw new AuthError('Phone number or password is not right.');
      }
      return { uid: `demo-${args.phone.replace(/\D/g, '')}`, phone: args.phone, displayName: account.displayName };
    }
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth(), phoneEmail(args.phone), args.password);
      return { uid: cred.user.uid, phone: args.phone, displayName: cred.user.displayName };
    } catch (e) {
      throw explain(e);
    }
  },

  async signOut(): Promise<void> {
    if (!config.useMocks) await firebaseSignOut(firebaseAuth());
  },

  /** Subscribes to Firebase auth changes. No-op in demo mode. */
  listen(callback: (user: { uid: string; phone: string | null } | null) => void): () => void {
    if (config.useMocks) return () => {};
    return onAuthStateChanged(firebaseAuth(), (user) =>
      callback(user ? { uid: user.uid, phone: emailToPhone(user.email) || null } : null),
    );
  },
};
