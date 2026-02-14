module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|expo(nent)?|@expo|expo-.*|@expo-google-fonts|nativewind|@supabase|lucide-react-native|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-svg|react-native-worklets)',
  ],
  collectCoverageFrom: [
    'stores/**/*.ts',
    'services/**/*.ts',
    'hooks/**/*.ts',
    '!**/*.d.ts',
  ],
};
