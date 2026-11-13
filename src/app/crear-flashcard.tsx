import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar, colors } from '../components/StudyUI';
import { useAuthSession } from '../hooks/use-auth-session';
import {
  createUserFlashcard,
  getUserNotebook,
  type Notebook,
} from '../services/study-data';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function CreateFlashcardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ notebookId?: string | string[] }>();
  const notebookId = firstParam(params.notebookId);
  const session = useAuthSession();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loadedNotebookId, setLoadedNotebookId] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (session.status === 'signedOut') {
      router.replace({
        pathname: '/auth',
        params: {
          returnTo: 'crear-flashcard',
          notebookId: notebookId || '',
        },
      });
    }
  }, [notebookId, router, session.status]);

  useEffect(() => {
    if (session.status !== 'signedIn' || !notebookId) {
      return;
    }

    let active = true;
    const uid = session.user.uid;

    getUserNotebook(uid, notebookId)
      .then((result) => {
        if (active) {
          setNotebook(result);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage('No se pudo cargar el cuaderno seleccionado.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadedNotebookId(notebookId);
        }
      });

    return () => {
      active = false;
    };
  }, [notebookId, session.status, session.user?.uid]);

  async function saveFlashcard(): Promise<void> {
    if (
      session.status !== 'signedIn' ||
      !notebookId ||
      !deckTitle.trim() ||
      !front.trim() ||
      !back.trim()
    ) {
      setErrorMessage('Completa el título, el frente y el reverso.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await createUserFlashcard(
        session.user.uid,
        notebookId,
        deckTitle,
        front,
        back
      );
      router.replace({
        pathname: '/materia',
        params: { notebookId, subject: notebook?.name || '' },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error &&
          (error.message.startsWith('El título') ||
            error.message.startsWith('El frente') ||
            error.message.startsWith('El reverso'))
          ? error.message
          : 'No se pudo guardar la flashcard. Inténtalo de nuevo.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (session.status !== 'signedIn') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} />
          {session.status === 'error' ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {session.error}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  if (!notebookId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Crear flashcard</Text>
          <Text style={styles.description}>
            Abre primero un cuaderno para asociar tu flashcard.
          </Text>
          <Pressable
            onPress={() => router.replace('/cuadernos')}
            accessibilityRole="button"
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Ver cuadernos</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loadedNotebookId !== notebookId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  if (!notebook) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text accessibilityRole="alert" style={styles.error}>
            {errorMessage || 'No se encontró el cuaderno seleccionado.'}
          </Text>
          <Pressable
            onPress={() => router.replace('/cuadernos')}
            accessibilityRole="button"
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Ver cuadernos</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Crear flashcard</Text>
            <Text style={styles.description}>Cuaderno: {notebook.name}</Text>

            <Text style={styles.label}>Título del grupo</Text>
            <TextInput
              value={deckTitle}
              onChangeText={setDeckTitle}
              editable={!isSaving}
              placeholder="Ej. Tipos de escenarios"
              placeholderTextColor={colors.muted}
              maxLength={100}
              style={styles.input}
              accessibilityLabel="Título del grupo"
            />

            <Text style={styles.label}>Frente</Text>
            <TextInput
              value={front}
              onChangeText={setFront}
              editable={!isSaving}
              placeholder="Pregunta o concepto"
              placeholderTextColor={colors.muted}
              maxLength={2000}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.multilineInput]}
              accessibilityLabel="Frente de la flashcard"
            />

            <Text style={styles.label}>Reverso</Text>
            <TextInput
              value={back}
              onChangeText={setBack}
              editable={!isSaving}
              placeholder="Respuesta o explicación"
              placeholderTextColor={colors.muted}
              maxLength={2000}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.multilineInput]}
              accessibilityLabel="Reverso de la flashcard"
            />

            {errorMessage ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              onPress={saveFlashcard}
              disabled={isSaving}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                isSaving && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Guardar flashcard</Text>
              )}
            </Pressable>

            <View style={styles.bottom}>
              <BottomBar
                active="notebooks"
                onAdd={() => router.back()}
                addLabel="Volver"
                addIcon="arrow-back"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.dark,
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lavender,
    borderRadius: 14,
    paddingHorizontal: 15,
    color: colors.dark,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 110,
    paddingTop: 14,
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    borderRadius: 15,
    marginTop: 22,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  bottom: {
    marginTop: 24,
    paddingBottom: 10,
  },
});
