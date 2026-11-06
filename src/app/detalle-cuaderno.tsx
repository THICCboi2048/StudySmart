import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors } from '../components/StudyUI';

// TODO: reemplazar por los datos reales (contexto / storage)


import { useNotebooks, FlashcardSet } from '../context/NotebookContext';

export default function DetalleCuadernoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getNotebook } = useNotebooks();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const notebook = getNotebook(id);

  const title = notebook?.name ?? '';
  const flashcards = notebook?.flashcardSets ?? [];
  const notas = notebook?.notes ?? [];

function abrirFlashcard(flashcard: FlashcardSet) {
  router.push({
    pathname: '/flashcards',
    params: { id, flashcardId: flashcard.id },
  });
}


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScreenHeader title={title} onBack={() => router.navigate('/cuadernos')} />

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {/* FLASHCARDS */}
          <Text style={styles.sectionTitle}>Flashcards</Text>
          {flashcards.length === 0 ? (
            <Text style={styles.emptyState}>No hay flashcards</Text>
          ) : (
            flashcards.map((flashcard) => (
              <Pressable
                key={flashcard.id}
                onPress={() => abrirFlashcard(flashcard)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir flashcard ${flashcard.name}`}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <Ionicons name="albums-outline" size={23} color={colors.purple} />
                <Text style={styles.cardName}>{flashcard.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            ))
          )}

          {/* NOTAS */}
          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Notas</Text>
          {notas.length === 0 ? (
            <Text style={styles.emptyState}>Próximamente</Text>
          ) : (
            notas.map((nota) => (
              <Pressable
                key={nota.id}
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel={`Abrir nota ${nota.name}`}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <Ionicons name="document-text-outline" size={23} color={colors.purple} />
                <Text style={styles.cardName}>{nota.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            ))
          )}
        </ScrollView>

        <View style={styles.bottom}>
          <BottomBar
            active="notebooks"
            addLabel="Flashcard"
            onAdd={() =>
                router.push({ pathname: '/crear-flashcard', params: { id } })
            }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 29,
    fontWeight: '800',
    color: colors.dark,
  },
  list: {
    flex: 1,
    marginTop: 14,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  sectionSpacing: {
    marginTop: 12,
  },
  emptyState: {
    fontSize: 15,
    color: colors.muted,
  },
  card: {
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
  cardPressed: {
    opacity: 0.7,
  },
  cardName: {
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