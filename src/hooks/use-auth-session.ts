import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { getFirebaseAuth } from '../services/firebaseAuth';
import { isFirebaseConfigured } from '../services/firebase';
import { ensureUserProfile } from '../services/study-data';

type AuthSession =
  | { status: 'loading'; user: User | null; error: null }
  | { status: 'signedOut'; user: null; error: null }
  | { status: 'signedIn'; user: User; error: null }
  | { status: 'error'; user: User | null; error: string };

function getSessionError(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'No se pudieron validar los permisos de tu cuenta.';
  }
  if (error instanceof FirebaseError && error.code === 'unavailable') {
    return 'No se pudo conectar con Firebase. Revisa tu conexión.';
  }
  return 'No se pudo cargar tu sesión. Inténtalo de nuevo.';
}

const initialSession: AuthSession = isFirebaseConfigured
  ? { status: 'loading', user: null, error: null }
  : {
      status: 'error',
      user: null,
      error: 'Falta configurar la conexión con Firebase.',
    };

export function useAuthSession(): AuthSession {
  const [session, setSession] = useState<AuthSession>(initialSession);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    let active = true;
    let callbackVersion = 0;
    let unsubscribe: (() => void) | undefined;

    void Promise.resolve().then(() => {
      if (!active) {
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(
          getFirebaseAuth(),
          (user) => {
            const version = ++callbackVersion;
            if (!user) {
              setSession({ status: 'signedOut', user: null, error: null });
              return;
            }

            setSession({ status: 'loading', user, error: null });
            void ensureUserProfile(user.uid)
              .then(() => {
                if (active && callbackVersion === version) {
                  setSession({ status: 'signedIn', user, error: null });
                }
              })
              .catch((error: unknown) => {
                if (active && callbackVersion === version) {
                  setSession({
                    status: 'error',
                    user,
                    error: getSessionError(error),
                  });
                }
              });
          },
          (error) => {
            if (active) {
              setSession({
                status: 'error',
                user: null,
                error: getSessionError(error),
              });
            }
          }
        );
      } catch (error) {
        if (active) {
          setSession({
            status: 'error',
            user: null,
            error: getSessionError(error),
          });
        }
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return session;
}
