import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

export default function CreacionScreen() {
  const [nombreCuaderno, setNombreCuaderno] = useState('');
  const router = useRouter();
  const { addNotebook } = useNotebooks();

  function crearCuaderno() {
    const nombre = nombreCuaderno.trim();
    if (!nombre) return;

    addNotebook(nombre);
    router.replace('/cuadernos');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScreenHeader title="Creación" onBack={() => router.back()} />

        <View style={styles.form}>
          <Text style={styles.label}>Nombre del cuaderno</Text>
          <TextInput
            value={nombreCuaderno}
            onChangeText={setNombreCuaderno}
            placeholder="Escribe el nombre"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Nombre del cuaderno"
          />
          <Pressable
            onPress={crearCuaderno}
            disabled={!nombreCuaderno.trim()}
            accessibilityRole="button"
            accessibilityLabel="Crear cuaderno"
            style={({ pressed }) => [
              styles.createButton,
              !nombreCuaderno.trim() && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
          >
            <Text style={styles.createButtonText}>Crear cuaderno</Text>
          </Pressable>
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
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
