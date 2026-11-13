
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { BottomBar, colors } from '../components/StudyUI';
import { useAuthSession } from '../hooks/use-auth-session';
import { getUserStreak, type UserStreak } from '../services/study-data';

export default function HomeScreen() {
  const router = useRouter();
  const session = useAuthSession();
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 0,
    lastActivityDate: null,
  });
  const [loadedUid, setLoadedUid] = useState('');
  const [streakError, setStreakError] = useState('');
  const registeredUser =
    session.status === 'signedIn' && !session.user.isAnonymous;

  useFocusEffect(
    useCallback(() => {
      if (session.status !== 'signedIn' || session.user.isAnonymous) {
        return;
      }

      let active = true;
      const uid = session.user.uid;

      getUserStreak(uid)
        .then((value) => {
          if (active) {
            setStreak(value);
            setStreakError('');
          }
        })
        .catch(() => {
          if (active) {
            setStreakError('No se pudo cargar tu racha. Inténtalo de nuevo.');
          }
        })
        .finally(() => {
          if (active) {
            setLoadedUid(uid);
          }
        });

      return () => {
        active = false;
      };
    }, [session.status, session.user])
  );

  const isLoading =
    session.status === 'loading' ||
    (registeredUser && session.status === 'signedIn' && loadedUid !== session.user.uid);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="school-outline"
            size={30}
            color={colors.purple}
          />

          <Text style={styles.logo}>StudySmart</Text>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.subtitle}>
            ¡Cada día cuenta!
          </Text>

          <Text style={styles.description}>
            Sigue aprendiendo a tu ritmo.
          </Text>
        </View>

        <View style={styles.streakCard}>
          {registeredUser ? (
            <>
              <Text style={styles.streakTitle}>Tu racha de estudio</Text>
              <Ionicons name="flame" size={100} color="#D97736" />
              {isLoading ? (
                <ActivityIndicator
                  color={colors.purple}
                  accessibilityLabel="Cargando tu racha"
                />
              ) : streakError ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {streakError}
                </Text>
              ) : (
                <>
                  <Text style={styles.streakNumber}>
                    {streak.currentStreak}{' '}
                    {streak.currentStreak === 1 ? 'día' : 'días'}
                  </Text>
                  <Text style={styles.streakDescription}>
                    {streak.currentStreak > 0
                      ? '¡Sigue así! Estás creando un gran hábito.'
                      : 'Interactúa con un cuaderno o una flashcard para empezar.'}
                  </Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.streakTitle}>Tu racha de estudio</Text>
              <Text style={styles.streakDescription}>
                {session.status === 'error'
                  ? session.error
                  : 'Inicia sesión con una cuenta registrada para llevar tu racha diaria.'}
              </Text>
              {session.status === 'signedOut' ||
              (session.status === 'signedIn' && session.user.isAnonymous) ? (
                <Pressable
                  onPress={() => router.push('/auth')}
                  accessibilityRole="button"
                  style={styles.signInButton}
                >
                  <Text style={styles.signInButtonText}>Iniciar sesión</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.bottom}>
          <BottomBar active="home" showAdd={false} />
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
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 29,
    fontWeight: '800',
    color: colors.dark,
  },
  welcome: {
    marginTop: 48,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.dark,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  streakCard: {
    marginTop: 38,
    padding: 26,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 28,
    elevation: 3,
    shadowColor: '#35264D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  streakTitle: {
    fontSize: 17,
    color: colors.dark,
    fontWeight: '600',
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 32,
    color: colors.purple,
    fontWeight: '800',
    marginTop: 8,
  },
  streakDescription: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: '#B3261E',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  signInButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.purple,
    borderRadius: 15,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
