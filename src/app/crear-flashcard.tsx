import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomBar, colors } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

export default function CrearFlashcardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getNotebook, addFlashcardSet } = useNotebooks();

  const notebookId = Array.isArray(params.id) ? params.id[0] : params.id;
  const notebook = getNotebook(notebookId);

  const [nombre, setNombre] = useState('');
  const [tarjetasTexto, setTarjetasTexto] = useState('');

  const puedeCrear = nombre.trim().length > 0 && !!notebookId;

  function crearFlashcard() {
    if (!puedeCrear || !notebookId) return;

    const cards = tarjetasTexto
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean);

    addFlashcardSet(notebookId, nombre.trim(), cards);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Nueva flashcard</Text>
        {notebook && <Text style={styles.subtitle}>en {notebook.name}</Text>}

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Tipos de escenarios"
            placeholderTextColor={colors.muted}
            autoCapitalize="sentences"
            style={styles.input}
            accessibilityLabel="Nombre de la flashcard"
          />

          <Text style={[styles.label, styles.labelSpacing]}>
            Tarjetas (una por línea)
          </Text>
          <TextInput
            value={tarjetasTexto}
            onChangeText={setTarjetasTexto}
            placeholder={'Escenario en H\nEscenario circular'}
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textarea]}
            accessibilityLabel="Tarjetas, una por línea"
          />

          <Pressable
            onPress={crearFlashcard}
            disabled={!puedeCrear}
            accessibilityRole="button"
            accessibilityLabel="Crear flashcard"
            style={({ pressed }) => [
              styles.createButton,
              !puedeCrear && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
          >
            <Text style={styles.createButtonText}>Crear flashcard</Text>
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <BottomBar active="add" onAdd={() => {}} addLabel="Flashcard" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 29, fontWeight: '800', color: colors.dark },
  subtitle: { marginTop: 4, fontSize: 15, color: colors.muted },
  form: { marginTop: 28 },
  label: {
    marginBottom: 10,
    color: colors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  labelSpacing: { marginTop: 18 },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lavender,
    color: colors.dark,
    fontSize: 16,
  },
  textarea: { minHeight: 130, paddingTop: 14 },
  createButton: {
    minHeight: 54,
    marginTop: 18,
    paddingHorizontal: 20,
    backgroundColor: colors.purple,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonPressed: { opacity: 0.8 },
  createButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  bottom: { marginTop: 'auto', paddingBottom: 10 },
});