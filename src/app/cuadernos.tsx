import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  BottomBar,
  colors,
  HapticPressable,
} from '../components/StudyUI';
import { useNotebooks, type Notebook } from '../context/NotebookContext';
import { useRouter } from 'expo-router';

export default function CuadernosScreen() {
  const router = useRouter();
  const {
    notebooks,
    deleteNotebook,
    loadStatus,
    isSignedIn,
    error,
    clearError,
  } = useNotebooks();
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const [mostrarOpcionesEliminacion, setMostrarOpcionesEliminacion] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function abrirCuaderno(notebook: Notebook) {
    router.push({
      pathname: '/detalle-cuaderno',
      params: { id: notebook.id },
    });
  }

  async function confirmarEliminacion() {
    if (!notebookToDelete || deleting) return;

    setDeleting(true);
    try {
      await deleteNotebook(notebookToDelete.id);
      setNotebookToDelete(null);
    } catch {
      // The context exposes the error to the screen.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuadernos</Text>

          <HapticPressable
            onPress={() => setMostrarOpcionesEliminacion((visible) => !visible)}
            accessibilityLabel={
              mostrarOpcionesEliminacion
                ? 'Ocultar opciones de eliminación'
                : 'Mostrar opciones de eliminación'
            }
            accessibilityRole="button"
            style={[
              styles.settings,
              mostrarOpcionesEliminacion && styles.settingsActive,
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={25}
              color={mostrarOpcionesEliminacion ? colors.dark : colors.muted}
            />
          </HapticPressable>
        </View>

        <ScrollView
          style={styles.notebooksList}
          contentContainerStyle={styles.notebooksContent}
          keyboardShouldPersistTaps="handled"
        >
          {loadStatus === 'loading' ? (
            <ActivityIndicator color={colors.purple} accessibilityLabel="Cargando cuadernos" />
          ) : loadStatus === 'error' ? (
            <Text accessibilityRole="alert" style={styles.errorMessage}>{error}</Text>
          ) : !isSignedIn ? (
            <View>
              <Text style={styles.emptyState}>Inicia sesión para ver tus cuadernos.</Text>
              <HapticPressable
                onPress={() => router.push('/auth')}
                accessibilityRole="button"
                style={styles.signInButton}
              >
                <Text style={styles.signInButtonText}>Iniciar sesión</Text>
              </HapticPressable>
            </View>
          ) : notebooks.length === 0 ? (
            <Text style={styles.emptyState}>No hay cuadernos creados</Text>
          ) : (notebooks.map((notebook) => (
            <View key={notebook.id} style={styles.notebookCard}>
              <HapticPressable
                onPress={() => abrirCuaderno(notebook)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir cuaderno ${notebook.name}`}
                style={({ pressed }) => [
                  styles.notebookOpen,
                  pressed && styles.notebookCardPressed,
                ]}
              >
                <Ionicons name="book-outline" size={23} color={colors.purple} />
                <Text style={styles.notebookName}>{notebook.name}</Text>
              </HapticPressable>

              {mostrarOpcionesEliminacion && (
                <HapticPressable
                  onPress={() => setNotebookToDelete(notebook)}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar cuaderno ${notebook.name}`}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                >
                  <Ionicons name="trash-outline" size={21} color={colors.muted} />
                </HapticPressable>
              )}
            </View>
          )))}
          {loadStatus === 'ready' && isSignedIn && error ? (
            <Text accessibilityRole="alert" style={styles.errorMessage}>{error}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.bottom}>
          <BottomBar active="notebooks" showAdd={isSignedIn} />
        </View>
      </View>

      <Modal
        visible={notebookToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setNotebookToDelete(null);
          clearError();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Eliminar cuaderno</Text>
            <Text style={styles.confirmationMessage}>
              ¿Quieres eliminar &quot;{notebookToDelete?.name}&quot;?
            </Text>
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorMessage}>{error}</Text>
            ) : null}
            <View style={styles.confirmationActions}>
              <HapticPressable
                onPress={() => {
                  setNotebookToDelete(null);
                  clearError();
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancelar eliminación"
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </HapticPressable>
              <HapticPressable
                onPress={confirmarEliminacion}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Confirmar eliminación"
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonText}>Eliminar</Text>
              </HapticPressable>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: colors.dark,
  },
  settings: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsActive: {
    backgroundColor: colors.lavender,
  },
  emptyState: {
    marginTop: 14,
    fontSize: 15,
    color: colors.muted,
  },
  errorMessage: {
    marginTop: 10,
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
  },
  signInButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.purple,
  },
  signInButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  notebooksList: {
    flex: 1,
    marginTop: 14,
  },
  notebooksContent: {
    gap: 12,
    paddingBottom: 16,
  },
  notebookCard: {
    minHeight: 66,
    paddingLeft: 18,
    paddingRight: 13,
    backgroundColor: colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#4E342E',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  notebookOpen: {
    flex: 1,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notebookName: {
    flex: 1,
    color: colors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  deleteButtonPressed: {
    backgroundColor: colors.lavender,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 22,
  },
  confirmationTitle: {
    color: colors.dark,
    fontSize: 20,
    fontWeight: '800',
  },
  confirmationMessage: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  confirmButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmationButtonPressed: {
    opacity: 0.75,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
  notebookCardPressed: {
    opacity: 0.7,
  },
});
