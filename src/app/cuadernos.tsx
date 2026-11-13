import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  BottomBar,
  colors,
} from '../components/StudyUI';

const materias: string[] = [
  'Teatro',
  'Matemáticas',
  'Estudios filosofales',
  'Cocina',
];

const iconos: React.ComponentProps<typeof Ionicons>['name'][] = [
  'color-palette-outline',
  'calculator-outline',
  'book-outline',
  'restaurant-outline',
];

export default function CuadernosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuadernos</Text>

          <Pressable
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
          </Pressable>
        </View>

        <Text style={styles.description}>
          ¿Qué quieres estudiar hoy?
        </Text>

        <View style={styles.list}>
          {materias.map((materia, index) => (
            <StudyButton
              key={materia}
              title={materia}
              icon={iconos[index]}
              onPress={() =>
                router.push({
                  pathname: '/materia',
                  params: { subject: materia },
                })
              }
            />
          ))}
        </View>

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
  settingsActive: {
    backgroundColor: colors.lavender,
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
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
  notebookCardPressed: {
    opacity: 0.7,
  },
});
