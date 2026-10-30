import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
      <Stack.Screen name="materia" />
      <Stack.Screen name="flashcards" />
    </Stack>
  );
}