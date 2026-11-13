import { View, Text, StyleSheet, SafeAreaView,  Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { BottomBar, ScreenHeader, colors, HapticHapticPressable } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

const webTextWrapStyle = { flexShrink: 1, wordBreak: 'break-word' as const };

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getNotebook } = useNotebooks();

  const notebookId = Array.isArray(params.id) ? params.id[0] : params.id;
  const flashcardId = Array.isArray(params.flashcardId)
    ? params.flashcardId[0]
    : params.flashcardId;

  const notebook = getNotebook(notebookId);
  const set = notebook?.flashcardSets.find((s) => s.id === flashcardId);

  const title = set?.name ?? 'Flashcards';
  const tarjetas = set?.cards ?? [];

  const [indice, setIndice] = useState(0);
  const [verContenido, setVerContenido] = useState(false);

  function anterior() {
    setVerContenido(false);
    setIndice((actual) => (actual === 0 ? tarjetas.length - 1 : actual - 1));
  }

  function siguiente() {
    setVerContenido(false);
    setIndice((actual) => (actual + 1) % tarjetas.length);
  }

  const encabezado = (
    <ScreenHeader
      title={title}
      titleSize={27}
      onBack={() =>
        router.navigate({
          pathname: '/detalle-cuaderno',
          params: { id: notebookId },
        })
      }
    />
  );

  const barra = (
    <View style={styles.bottom}>
      <BottomBar
        active="notebooks"
        addLabel="Flashcard"
        onAdd={() =>
          router.push({ pathname: '/crear-flashcard', params: { id: notebookId } })
        }
      />
    </View>
  );

  if (tarjetas.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {encabezado}
          <Text style={styles.counter}>Este set no tiene tarjetas todavía</Text>
          {barra}
        </View>
      </SafeAreaView>
    );
  }

  const tarjeta = tarjetas[indice];
  const textoVisible = verContenido ? tarjeta.content : tarjeta.title;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {encabezado}

        <Text style={styles.counter}>
          Tarjeta {indice + 1} de {tarjetas.length}
        </Text>

        <View style={styles.card}>
          <Ionicons name="albums-outline" size={38} color={colors.purple} />
          <Text style={styles.side}>{verContenido ? 'Contenido' : 'Título'}</Text>
          <Text
            style={[
              styles.cardTitle,
              verContenido && styles.cardContent,
              Platform.OS === 'web' && webTextWrapStyle,
            ]}
          >
            {textoVisible || '—'}
          </Text>
        </View>

        <HapticPressable
          onPress={() => setVerContenido((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={verContenido ? 'Mostrar título' : 'Mostrar contenido'}
          style={({ pressed }) => [styles.flipButton, pressed && styles.pressed]}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.white} />
          <Text style={styles.flipText}>
            {verContenido ? 'Ver título' : 'Ver contenido'}
          </Text>
        </HapticPressable>

        <View style={styles.arrows}>
          <HapticPressable
            onPress={anterior}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta anterior"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={28} color={colors.purple} />
          </HapticPressable>

          <HapticPressable
            onPress={siguiente}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta siguiente"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-forward" size={28} color={colors.purple} />
          </HapticPressable>
        </View>

        {barra}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  counter: { fontSize: 14, color: colors.muted, marginTop: 12 },
  card: {
    marginTop: 34,
    minHeight: 250,
    backgroundColor: colors.white,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    elevation: 3,
    shadowColor: '#35264D',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  side: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    width: '100%',
    flexShrink: 1,
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  cardContent: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  flipButton: {
    minHeight: 50,
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.purple,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  arrowButton: {
    width: 58,
    height: 52,
    backgroundColor: colors.lavender,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { marginTop: 'auto', paddingBottom: 10 },
});
