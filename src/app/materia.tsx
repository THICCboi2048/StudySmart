
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  BottomBar,
  StudyButton,
  colors,
} from '../components/StudyUI';

export default function MateriaScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    subject?: string | string[];
  }>();

  const subject = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject || 'Teatro';

  const flashcards: string[] = [
    'Tipos de escenarios',
    'Personas importantes del teatro',
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.subjectTitle}>
          {subject}
        </Text>

        <Text style={styles.sectionTitle}>
          FLASHCARDS
        </Text>

        {flashcards.map((title: string) => (
          <StudyButton
            key={title}
            title={title}
            icon="albums-outline"
            onPress={() =>
              router.push({
                pathname: '/flashcards',
                params: {
                  subject,
                  title,
                },
              })
            }
          />
        ))}

        <Text style={styles.sectionTitle}>
          NOTAS
        </Text>

        <StudyButton
          title="Vestuario para el 27"
          icon="document-text-outline"
          onPress={() => {}}
        />

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
  subjectTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.purple,
    marginBottom: 16,
    marginTop: 10,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: 10,
  },
});
