import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, colors } from '../components/StudyUI';
import { addNotebook, DuplicateNotebookError } from '../services/notebooks';

export default function CreacionScreen() {
  const [nombreCuaderno, setNombreCuaderno] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  async function crearCuaderno() {
    const nombre = nombreCuaderno.trim();
    if (!nombre) return;

    setIsSaving(true);
    setErrorMessage('');
    try {
      await addNotebook(nombre);
      router.replace('/cuadernos');
    } catch (error) {
      setErrorMessage(
        error instanceof DuplicateNotebookError
          ? error.message
          : 'No se pudo guardar el cuaderno. Inténtalo de nuevo.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  function cancelarCreacion() {
    router.replace('/cuadernos');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Creación</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre del cuaderno</Text>
          <TextInput
            value={nombreCuaderno}
            onChangeText={setNombreCuaderno}
            editable={!isSaving}
            placeholder="Escribe el nombre"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Nombre del cuaderno"
          />
          <Pressable
            onPress={crearCuaderno}
            disabled={!nombreCuaderno.trim() || isSaving}
            accessibilityRole="button"
            accessibilityLabel="Crear cuaderno"
            style={({ pressed }) => [
              styles.createButton,
              (!nombreCuaderno.trim() || isSaving) && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Crear cuaderno</Text>
            )}
          </Pressable>
          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}
        </View>

        <View style={styles.bottom}>
          <BottomBar
            active="add"
            onAdd={cancelarCreacion}
            addLabel="Cancelar"
            addIcon="close"
          />
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
    fontSize: 29,
    fontWeight: '800',
    color: colors.dark,
  },
  form: {
    marginTop: 32,
  },
  label: {
    marginBottom: 10,
    color: colors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
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
  createButton: {
    minHeight: 54,
    marginTop: 18,
    paddingHorizontal: 20,
    backgroundColor: colors.purple,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonPressed: {
    opacity: 0.8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
