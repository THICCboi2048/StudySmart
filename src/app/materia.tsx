
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  BottomBar,
  StudyButton,
  colors,
} from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';
import { useAuthSession } from '../hooks/use-auth-session';
import { getUserFlashcards, recordUserActivity } from '../services/study-data';

type DeckSummary = { id: string; title: string };

export default function MateriaScreen() {
  const router = useRouter();
  const session = useAuthSession();
  const { getNotebook } = useNotebooks();

  const params = useLocalSearchParams<{
    notebookId?: string | string[];
    subject?: string | string[];
  }>();

  const notebookId = Array.isArray(params.notebookId)
    ? params.notebookId[0]
    : params.notebookId;
  const subject = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject || 'Teatro';
  const notebook = getNotebook(notebookId);
  const notes = notebook?.notes ?? [];

  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loadedKey, setLoadedKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    if (session.status !== 'signedIn' || !notebookId) {
      return;
    }

    let active = true;
    const uid = session.user.uid;
    const requestKey = `${uid}:${notebookId}`;

    getUserFlashcards(uid, notebookId)
      .then((flashcards) => {
        if (active) {
          const decksById = new Map<string, DeckSummary>();
          flashcards.forEach((flashcard) => {
            decksById.set(flashcard.deckId, {
              id: flashcard.deckId,
              title: flashcard.deckTitle,
            });
          });
          setDecks([...decksById.values()]);
          setErrorMessage('');
          setActivityError('');
          if (!session.user.isAnonymous) {
            void recordUserActivity(uid).catch(() => {
              if (active) {
                setActivityError('No se pudo actualizar tu racha diaria.');
              }
            });
          }
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage('No se pudieron cargar las flashcards de este cuaderno.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadedKey(requestKey);
        }
      });

    return () => {
      active = false;
    };
  }, [notebookId, session.status, session.user?.isAnonymous, session.user?.uid]);

  const isLoading =
    session.status === 'loading' ||
    (session.status === 'signedIn' &&
      loadedKey !== `${session.user.uid}:${notebookId ?? ''}`);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.subjectTitle}>
          {subject}
        </Text>

        <Text style={styles.sectionTitle}>
          FLASHCARDS
        </Text>

        {session.status === 'signedOut' ? (
          <View>
            <Text style={styles.message}>
              Inicia sesión para ver y crear tus flashcards.
            </Text>
            <StudyButton
              title="Iniciar sesión"
              icon="person-outline"
              onPress={() =>
                router.push({
                  pathname: '/auth',
                  params: {
                    returnTo: 'materia',
                    notebookId: notebookId || '',
                    subject,
                  },
                })
              }
            />
          </View>
        ) : session.status === 'error' ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {session.error}
          </Text>
        ) : isLoading ? (
          <ActivityIndicator
            color={colors.purple}
            accessibilityLabel="Cargando flashcards"
          />
        ) : !notebookId ? (
          <Text style={styles.message}>
            Vuelve a Cuadernos y selecciona uno para ver sus flashcards.
          </Text>
        ) : errorMessage ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage}
          </Text>
        ) : (
          <>
            <StudyButton
              title="Crear flashcard"
              icon="add-circle-outline"
              onPress={() =>
                router.push({
                  pathname: '/crear-flashcard',
                  params: { id: notebookId },
                })
              }
            />
            {decks.length === 0 ? (
              <Text style={styles.message}>
                Aún no hay flashcards en este cuaderno.
              </Text>
            ) : (
              decks.map((deck) => (
                <StudyButton
                  key={deck.id}
                  title={deck.title}
                  icon="albums-outline"
                  onPress={() =>
                    router.push({
                      pathname: '/flashcards',
                      params: {
                        id: notebookId,
                        flashcardId: deck.id,
                        subject,
                      },
                    })
                  }
                />
              ))
            )}
          </>
        )}
        {activityError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {activityError}
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>
          NOTAS
        </Text>

        {session.status === 'signedIn' && notes.length > 0 ? (
          notes.map((note) => (
            <StudyButton
              key={note.id}
              title={note.name}
              icon="document-text-outline"
              onPress={() =>
                router.push({
                  pathname: '/detalle-cuaderno',
                  params: { id: notebookId },
                })
              }
            />
          ))
        ) : (
          <Text style={styles.message}>Aún no hay notas en este cuaderno.</Text>
        )}

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
  subjectTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.purple,
    marginBottom: 16,
    marginTop: 10,
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
