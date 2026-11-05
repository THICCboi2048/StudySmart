import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomBar,
  colors,
} from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

export default function CuadernosScreen() {
  const { notebooks } = useNotebooks();

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
                accessibilityLabel={`Cuaderno ${notebook.name}, próximamente disponible`}
              >
                <Ionicons
                  name="book-outline"
                  size={23}
                  color={colors.purple}
                />
                <Text style={styles.notebookName}>{notebook.name}</Text>
              </View>
            ))
          )}
        </ScrollView>

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
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});