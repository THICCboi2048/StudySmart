import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomBar, colors } from '../components/StudyUI';

export default function HomeScreen() {
  const diasRacha = 7;

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
          <Text style={styles.streakTitle}>
            Tu racha de estudio
          </Text>

          <Ionicons
            name="flame"
            size={100}
            color="#D97736"
          />

          <Text style={styles.streakNumber}>
            {diasRacha} días
          </Text>

          <Text style={styles.streakDescription}>
            ¡Sigue así! Estás creando un gran hábito.
          </Text>
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
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});