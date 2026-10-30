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
  StudyButton,
  colors,
} from '../components/StudyUI';

const materias = [
  'Teatro',
  'Matemáticas',
  'Estudios filosofales',
  'Cocina',
];

export default function CuadernosScreen() {
  const router = useRouter();

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
          {materias.map((materia, index) => (
            <StudyButton
              key={materia}
              title={materia}
              icon={[
                'theater',
                'calculator-outline',
                'book-outline',
                'restaurant-outline',
              ][index]}
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
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});