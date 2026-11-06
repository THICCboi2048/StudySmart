import { Stack } from 'expo-router';
import { NotebookProvider } from '../context/NotebookContext';

export default function RootLayout() {
  return (
    <NotebookProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#F7F5FF',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="cuadernos" />
        <Stack.Screen name="detalle-cuaderno" />
        <Stack.Screen name="creacion" />
        <Stack.Screen name="materia" />
        <Stack.Screen name="flashcards" />
        <Stack.Screen name="crear-flashcard" />

      </Stack>
    </NotebookProvider>
  );
}