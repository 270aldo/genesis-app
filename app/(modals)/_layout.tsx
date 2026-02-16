import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="genesis-chat" />
      <Stack.Screen name="camera-scanner" />
      <Stack.Screen name="voice-call" />
      <Stack.Screen name="exercise-video" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="coach-notes-history" />
      <Stack.Screen name="phase-briefing" />
    </Stack>
  );
}
