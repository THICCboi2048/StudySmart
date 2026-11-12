import AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase's React Native runtime exports this helper, though its public type barrel omits it.
// @ts-expect-error React Native-only Firebase Auth export.
import { getReactNativePersistence } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';

import { getFirebaseApp } from './firebase';

let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();

  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      authInstance = getAuth(app);
    } else {
      throw error;
    }
  }

  return authInstance;
}
