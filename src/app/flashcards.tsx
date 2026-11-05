
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { BottomBar, colors } from '../components/StudyUI';

const tarjetas: string[] = [
  'Escenario en H',
  'Escenario a la italiana',
  'Escenario circular',
];

export default function FlashcardsScreen() {
  const params = useLocalSearchParams<{
    title?: string | string[];
  }>();

  const title = Array.isArray(params.title)
    ? params.title[0]
    : params.title || 'Tipos de escenarios';

  const [indice, setIndice] = useState<number>(0);

  function anterior(): void {
    setIndice((actual: number) =>
      actual === 0 ? tarjetas.length - 1 : actual - 1
    );
  }

  function siguiente(): void {
    setIndice((actual: number) =>
      (actual + 1) % tarjetas.length
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.counter}>
          Tarjeta {indice + 1} de {tarjetas.length}
        </Text>

        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={tarjetas[indice]}
        >
          <Ionicons
            name="albums-outline"
            size={38}
            color={colors.purple}
          />

          <Text style={styles.cardTitle}>
            {tarjetas[indice]}
          </Text>

          <Text style={styles.cardHint}>
            Pulsa para estudiar este concepto
          </Text>
        </Pressable>

        <View style={styles.arrows}>
          <Pressable
            onPress={anterior}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta anterior"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={colors.purple}
            />
          </Pressable>

          <Pressable
            onPress={siguiente}
            style={styles.arrowButton}
            accessibilityLabel="Tarjeta siguiente"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-forward"
              size={28}
              color={colors.purple}
            />
          </Pressable>
        </View>

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
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.dark,
  },
  counter: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 12,
  },
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
  cardTitle: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  cardHint: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  arrowButton: {
    width: 58,
    height: 52,
    backgroundColor: colors.lavender,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
