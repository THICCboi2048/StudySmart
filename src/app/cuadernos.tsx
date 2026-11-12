
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  BottomBar,
  StudyButton,
  colors,
} from '../components/StudyUI';
import { DEFAULT_NOTEBOOKS, getNotebooks } from '../services/notebooks';

const iconos: React.ComponentProps<typeof Ionicons>['name'][] = [
  'color-palette-outline',
  'calculator-outline',
  'book-outline',
  'restaurant-outline',
];

export default function CuadernosScreen() {
  const router = useRouter();
  const [materias, setMaterias] = useState<string[]>(DEFAULT_NOTEBOOKS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    getNotebooks()
      .then((notebooks) => {
        if (isActive) {
          setMaterias(notebooks);
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('No se pudieron cargar los cuadernos. Inténtalo de nuevo.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

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

        <Text style={styles.description}>
          ¿Qué quieres estudiar hoy?
        </Text>

        <View style={styles.list}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.purple}
              accessibilityLabel="Cargando cuadernos"
            />
          ) : errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : materias.map((materia, index) => (
            <StudyButton
              key={materia}
              title={materia}
              icon={iconos[index % iconos.length]}
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
  description: {
    marginTop: 14,
    marginBottom: 28,
    fontSize: 15,
    color: colors.muted,
  },
  list: {
    marginTop: 4,
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
