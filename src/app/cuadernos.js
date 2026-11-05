import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomBar,
  colors,
} from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

export default function CuadernosScreen() {
  const { notebooks, deleteNotebook } = useNotebooks();
  const [notebookToDelete, setNotebookToDelete] = useState(null);

  function confirmarEliminacion() {
    if (!notebookToDelete) return;

    deleteNotebook(notebookToDelete.id);
    setNotebookToDelete(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuadernos</Text>

          <Pressable
            onPress={() => {}}
            accessibilityLabel="Configuración"
            accessibilityRole="button"
            style={styles.settings}
          >
            <Ionicons
              name="settings-outline"
              size={25}
              color={colors.dark}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.notebooksList}
          contentContainerStyle={styles.notebooksContent}
          keyboardShouldPersistTaps="handled"
        >
          {notebooks.length === 0 ? (
            <Text style={styles.emptyState}>No hay cuadernos creados</Text>
          ) : (
            notebooks.map((notebook) => (
              <View
                key={notebook.id}
                style={styles.notebookCard}
                accessibilityRole="text"
                accessibilityLabel={`Cuaderno ${notebook.name}`}
              >
                <Ionicons
                  name="book-outline"
                  size={23}
                  color={colors.purple}
                />
                <Text style={styles.notebookName}>{notebook.name}</Text>
                <Pressable
                  onPress={() => setNotebookToDelete(notebook)}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar cuaderno ${notebook.name}`}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color={colors.muted}
                  />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.bottom}>
          <BottomBar active="notebooks" />
        </View>
      </View>

      <Modal
        visible={notebookToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setNotebookToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Eliminar cuaderno</Text>
            <Text style={styles.confirmationMessage}>
              ¿Quieres eliminar "{notebookToDelete?.name}"?
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                onPress={() => setNotebookToDelete(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancelar eliminación"
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmarEliminacion}
                accessibilityRole="button"
                accessibilityLabel="Confirmar eliminación"
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonText}>Eliminar</Text>
              </Pressable>
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
  emptyState: {
    marginTop: 14,
    fontSize: 15,
    color: colors.muted,
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
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#4E342E',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
});