import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors, HapticPressable } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';
import { MAX_TITLE_LENGTH } from '../constants/textLimits';

export default function CreacionScreen() {
  const [nombreCuaderno, setNombreCuaderno] = useState('');
  const router = useRouter();
  const { addNotebook, error, clearError } = useNotebooks();
  const [saving, setSaving] = useState(false);

  async function crearCuaderno() {
    const nombre = nombreCuaderno.trim();
    if (!nombre || saving) return;

    clearError();
    setSaving(true);
    try {
      await addNotebook(nombre);
      router.replace('/cuadernos');
    } catch {
      // The context exposes the error to the screen.
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScreenHeader title="Creación" onBack={() => router.back()} />

        <View style={styles.form}>
          <Text style={styles.label}>Nombre del cuaderno</Text>
          <TextInput
            value={nombreCuaderno}
            onChangeText={(value) => {
              clearError();
              setNombreCuaderno(value);
            }}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="Escribe el nombre"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Nombre del cuaderno"
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.errorMessage}>
              {error}
            </Text>
          ) : null}
          <HapticPressable
            onPress={crearCuaderno}
            disabled={!nombreCuaderno.trim() || saving}
            accessibilityRole="button"
            accessibilityLabel="Crear cuaderno"
            style={({ pressed }) => [
              styles.createButton,
              (!nombreCuaderno.trim() || saving) && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
          >
            <Text style={styles.createButtonText}>Crear cuaderno</Text>
          </HapticPressable>
        </View>

        <View style={styles.bottom}>
          <BottomBar active="add" />
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
  errorMessage: {
    marginTop: 12,
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
