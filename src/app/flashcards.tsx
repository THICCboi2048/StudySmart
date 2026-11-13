import { View, Text, StyleSheet, SafeAreaView,  Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { BottomBar, colors, HapticPressable } from '../components/StudyUI';
import { useAuthSession } from '../hooks/use-auth-session';
import {
  getActivityDateKey,
  getUserFlashcards,
  recordUserActivity,
  type Flashcard,
} from '../services/study-data';

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getNotebook } = useNotebooks();

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
    const activityKey = `${uid}:${getActivityDateKey(new Date())}`;
    if (
      activityRecordedFor.current === activityKey ||
      activityPendingFor.current === activityKey
    ) {
      return;
    }

    activityPendingFor.current = activityKey;
    setActivityError('');
    void recordUserActivity(uid)
      .then(() => {
        activityRecordedFor.current = activityKey;
      })
      .catch(() => {
        setActivityError('No se pudo actualizar tu racha diaria.');
      })
      .finally(() => {
        if (activityPendingFor.current === activityKey) {
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

  const tarjeta = tarjetas[indice];
  const textoVisible = verContenido ? tarjeta.content : tarjeta.title;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {encabezado}

        <Text style={styles.counter}>
          Tarjeta {indice + 1} de {tarjetas.length}
        </Text>

        <View style={styles.card}>
          <Ionicons name="albums-outline" size={38} color={colors.purple} />
          <Text style={styles.side}>{verContenido ? 'Contenido' : 'Título'}</Text>
          <Text
            style={[
              styles.cardTitle,
              verContenido && styles.cardContent,
              Platform.OS === 'web' && webTextWrapStyle,
            ]}
          >
            {textoVisible || '—'}
          </Text>
        </View>

        <HapticPressable
          onPress={() => setVerContenido((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={verContenido ? 'Mostrar título' : 'Mostrar contenido'}
          style={({ pressed }) => [styles.flipButton, pressed && styles.pressed]}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.white} />
          <Text style={styles.flipText}>
            {verContenido ? 'Ver título' : 'Ver contenido'}
          </Text>
        </HapticPressable>

        <View style={styles.arrows}>
          <HapticPressable
            onPress={anterior}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta anterior"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={28} color={colors.purple} />
          </HapticPressable>

          <HapticPressable
            onPress={siguiente}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta siguiente"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-forward" size={28} color={colors.purple} />
          </HapticPressable>
        </View>

        {barra}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  counter: { fontSize: 14, color: colors.muted, marginTop: 12 },
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
  side: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    width: '100%',
    flexShrink: 1,
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  cardContent: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  flipButton: {
    minHeight: 50,
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.purple,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  arrowButton: {
    width: 58,
    height: 52,
    backgroundColor: colors.lavender,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { marginTop: 'auto', paddingBottom: 10 },
});
