
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
import { useAuthSession } from '../hooks/use-auth-session';
import { getUserNotebooks, type Notebook } from '../services/study-data';

const iconos: React.ComponentProps<typeof Ionicons>['name'][] = [
  'color-palette-outline',
  'calculator-outline',
  'book-outline',
  'restaurant-outline',
];

export default function CuadernosScreen() {
  const router = useRouter();
  const session = useAuthSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (session.status !== 'signedIn') {
      return;
    }

    let isActive = true;
    const uid = session.user.uid;

    getUserNotebooks(uid)
      .then((notebooks) => {
        if (isActive) {
          setNotebooks(notebooks);
          setErrorMessage('');
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('No se pudieron cargar los cuadernos. Inténtalo de nuevo.');
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadedUid(uid);
        }
      });

    return () => {
      isActive = false;
    };
  }, [session.status, session.user?.uid]);

  const isLoading =
    session.status === 'loading' ||
    (session.status === 'signedIn' && loadedUid !== session.user.uid);

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
          {session.status === 'signedOut' ? (
            <>
              <Text style={styles.emptyText}>
                Inicia sesión para ver y crear tus cuadernos.
              </Text>
              <StudyButton
                title="Iniciar sesión"
                icon="person-outline"
                onPress={() =>
                  router.push({
                    pathname: '/auth',
                    params: { returnTo: 'cuadernos' },
                  })
                }
              />
            </>
          ) : session.status === 'error' ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {session.error}
            </Text>
          ) : isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.purple}
              accessibilityLabel="Cargando cuadernos"
            />
          ) : errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : notebooks.length === 0 ? (
            <Text style={styles.emptyText}>
              Aún no tienes cuadernos. Pulsa Añadir para crear el primero.
            </Text>
          ) : notebooks.map((notebook, index) => (
            <StudyButton
              key={notebook.id}
              title={notebook.name}
              icon={iconos[index % iconos.length]}
              onPress={() =>
                router.push({
                  pathname: '/materia',
                  params: {
                    notebookId: notebook.id,
                    subject: notebook.name,
                  },
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
});
