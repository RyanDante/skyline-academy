import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getStorage } from '@react-native-firebase/storage';

import { config } from './config';

/**
 * Thin accessors over React Native Firebase (modular API). Everything is resolved lazily so
 * mock mode (EXPO_PUBLIC_USE_MOCKS=true) never touches Firebase.
 */
export const firebaseAuth = () => getAuth(getApp());
export const db = () => getFirestore(getApp());
export const storage = () => getStorage(getApp());
export const functions = () => getFunctions(getApp(), config.functionsRegion);

export const COLLECTIONS = {
  subjects: 'subjects',
  topics: 'topics',
  papers: 'papers',
  questions: 'questions',
  solutions: 'solutions',
  families: 'pathwayFamilies',
  institutions: 'institutions',
  highlights: 'highlights',
  users: 'users',
  attempts: 'attempts',
  groups: 'groups',
  members: 'members',
} as const;

/** Typed wrapper around a callable Cloud Function. */
export function callable<Req, Res>(name: string) {
  return async (data: Req): Promise<Res> => {
    const fn = httpsCallable<Req, Res>(functions(), name);
    const result = await fn(data);
    return result.data;
  };
}
