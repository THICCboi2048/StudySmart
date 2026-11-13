
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { BottomBar, colors } from '../components/StudyUI';
import { useAuthSession } from '../hooks/use-auth-session';
import {
  getUserFlashcards,
  recordUserActivity,
  type Flashcard,
} from '../services/study-data';

export default function FlashcardsScreen() {
  const router = useRouter();
  const session = useAuthSession();
  const params = useLocalSearchParams<{
    notebookId?: string | string[];
    subject?: string | string[];
    title?: string | string[];
  }>();

  const notebookId = Array.isArray(params.notebookId)
    ? params.notebookId[0]
    : params.notebookId;
  const subject = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject || '';
  const title = Array.isArray(params.title)
    ? params.title[0]
    : params.title || '';

  const [indice, setIndice] = useState<number>(0);
  const [mostrarReverso, setMostrarReverso] = useState(false);
  const [tarjetas, setTarjetas] = useState<Flashcard[]>([]);
  const [loadedKey, setLoadedKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activityError, setActivityError] = useState('');
  const activityRecordedFor = useRef<string | null>(null);
  const activityPendingFor = useRef<string | null>(null);
  const requestKey =
    session.status === 'signedIn' && notebookId && title
      ? `${session.user.uid}:${notebookId}:${title}`
      : '';

  useEffect(() => {
    if (session.status !== 'signedIn' || !notebookId || !title) {
      return;
    }

    let active = true;
    const uid = session.user.uid;

    getUserFlashcards(uid, notebookId)
      .then((flashcards) => {
        if (active) {
          setTarjetas(flashcards.filter((flashcard) => flashcard.deckTitle === title));
          setIndice(0);
          setMostrarReverso(false);
          setErrorMessage('');
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage('No se pudieron cargar las flashcards. Inténtalo de nuevo.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadedKey(`${uid}:${notebookId}:${title}`);
        }
      });

    return () => {
      active = false;
    };
  }, [notebookId, session.status, session.user?.uid, title]);

  function trackActivity(): void {
    if (session.status !== 'signedIn' || session.user.isAnonymous) {
      return;
    }

    const uid = session.user.uid;
    if (
      activityRecordedFor.current === uid ||
      activityPendingFor.current === uid
    ) {
      return;
    }

    activityPendingFor.current = uid;
    setActivityError('');
    void recordUserActivity(uid)
      .then(() => {
        activityRecordedFor.current = uid;
      })
      .catch(() => {
        setActivityError('No se pudo actualizar tu racha diaria.');
      })
      .finally(() => {
        if (activityPendingFor.current === uid) {
          activityPendingFor.current = null;
        }
      });
  }

  function anterior(): void {
    trackActivity();
    setIndice((actual: number) => actual === 0 ? tarjetas.length - 1 : actual - 1);
    setMostrarReverso(false);
  }

  function siguiente(): void {
    trackActivity();
    setIndice((actual: number) => (actual + 1) % tarjetas.length);
    setMostrarReverso(false);
  }

  const isLoading =
    session.status === 'loading' ||
    (session.status === 'signedIn' && requestKey !== '' && loadedKey !== requestKey);
  const currentCard = tarjetas[indice];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{title || 'Flashcards'}</Text>
        {subject ? <Text style={styles.subject}>{subject}</Text> : null}

        {!notebookId || !title ? (
          <Text style={styles.message}>
            Selecciona un grupo de flashcards desde uno de tus cuadernos.
          </Text>
        ) : session.status === 'signedOut' ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Inicia sesión para ver las flashcards de tu cuenta.
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/auth',
                  params: {
                    returnTo: 'flashcards',
                    notebookId: notebookId || '',
                    subject,
                    title,
                  },
                })
              }
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            </Pressable>
          </View>
        ) : session.status === 'error' ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {session.error}
          </Text>
        ) : isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.purple}
            accessibilityLabel="Cargando flashcards"
          />
        ) : errorMessage ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage}
          </Text>
        ) : !currentCard ? (
          <Text style={styles.message}>Este grupo todavía no tiene flashcards.</Text>
        ) : (
          <>
            <Text style={styles.counter}>
              Tarjeta {indice + 1} de {tarjetas.length}
            </Text>

            <Pressable
              onPress={() => {
                trackActivity();
                setMostrarReverso((visible) => !visible);
              }}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={mostrarReverso ? 'Mostrar frente' : 'Mostrar reverso'}
            >
              <Ionicons
                name="albums-outline"
                size={38}
                color={colors.purple}
              />

              <Text style={styles.cardTitle}>
                {mostrarReverso ? currentCard.back : currentCard.front}
              </Text>

              <Text style={styles.cardHint}>
                Pulsa para ver {mostrarReverso ? 'el frente' : 'el reverso'}
              </Text>
            </Pressable>

            <View style={styles.arrows}>
              <Pressable
                onPress={anterior}
                style={styles.arrowButton}
                accessibilityLabel="Tarjeta anterior"
                accessibilityRole="button"
              >
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={colors.purple}
                />
              </Pressable>

              <Pressable
                onPress={siguiente}
                style={styles.arrowButton}
                accessibilityLabel="Tarjeta siguiente"
                accessibilityRole="button"
              >
                <Ionicons
                  name="arrow-forward"
                  size={28}
                  color={colors.purple}
                />
              </Pressable>
            </View>
          </>
        )}
        {activityError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {activityError}
          </Text>
        ) : null}

        <View style={styles.bottom}>
          <BottomBar active="notebooks" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.dark,
  },
  subject: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
  },
  counter: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 12,
  },
  card: {
    marginTop: 34,
    minHeight: 250,
    backgroundColor: colors.white,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    elevation: 3,
    shadowColor: '#35264D',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  cardHint: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  messageContainer: {
    marginTop: 28,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    borderRadius: 15,
    marginTop: 18,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  arrowButton: {
    width: 58,
    height: 52,
    backgroundColor: colors.lavender,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
