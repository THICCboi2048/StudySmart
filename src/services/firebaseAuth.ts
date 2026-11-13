import { FirebaseError } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, type Auth } from 'firebase/auth';

import { getFirebaseApp } from './firebase';

let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();

  try {
    authInstance = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      authInstance = getAuth(app);
    } else {
      throw error;
    }
  }

  return authInstance;
}
