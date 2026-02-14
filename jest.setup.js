// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  modelName: 'Jest Simulator',
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

// Mock supabaseClient
jest.mock('./services/supabaseClient', () => ({
  supabaseClient: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock.url/photo.jpg' } }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  },
  hasSupabaseConfig: false,
}));

// Mock supabaseQueries
jest.mock('./services/supabaseQueries', () => ({
  getCurrentUserId: jest.fn().mockReturnValue('test-user-123'),
  insertMeal: jest.fn().mockResolvedValue(null),
  upsertCheckIn: jest.fn().mockResolvedValue(null),
  completeSession: jest.fn().mockResolvedValue(null),
  insertExerciseLogs: jest.fn().mockResolvedValue(null),
  upsertWaterLog: jest.fn().mockResolvedValue(null),
  insertBiomarker: jest.fn().mockResolvedValue(null),
  fetchMealsForDate: jest.fn().mockResolvedValue(null),
  fetchWaterLog: jest.fn().mockResolvedValue(null),
  fetchCheckIns: jest.fn().mockResolvedValue(null),
  fetchActiveSeason: jest.fn().mockResolvedValue(null),
  fetchPreviousSessions: jest.fn().mockResolvedValue(null),
  fetchTodaySession: jest.fn().mockResolvedValue(null),
  fetchBiomarkers: jest.fn().mockResolvedValue(null),
  fetchProgressPhotos: jest.fn().mockResolvedValue(null),
  fetchPersonalRecords: jest.fn().mockResolvedValue(null),
  fetchConversation: jest.fn().mockResolvedValue(null),
  upsertConversation: jest.fn().mockResolvedValue(null),
  uploadProgressPhoto: jest.fn().mockResolvedValue(null),
  insertProgressPhoto: jest.fn().mockResolvedValue(null),
  deleteProgressPhoto: jest.fn().mockResolvedValue(null),
  fetchExistingPRMap: jest.fn().mockResolvedValue({}),
  insertPersonalRecord: jest.fn().mockResolvedValue(null),
}));

// Mock genesisAgentApi
jest.mock('./services/genesisAgentApi', () => ({
  genesisAgentApi: {
    sendMessage: jest.fn().mockResolvedValue({
      id: 'mock-resp-1',
      response: 'Mock AI response',
      widgets: [],
    }),
    getTodayPlan: jest.fn().mockResolvedValue({ plan: null }),
    getExercises: jest.fn().mockResolvedValue({ exercises: [] }),
    getTrackStats: jest.fn().mockResolvedValue({ completed_workouts: 0, total_prs: 0, total_planned: 0 }),
    getStrengthProgress: jest.fn().mockResolvedValue({ exercise_name: 'N/A', data_points: [], change_percent: 0 }),
  },
}));

// Mock services index re-export
jest.mock('./services', () => ({
  genesisAgentApi: {
    sendMessage: jest.fn().mockResolvedValue({
      id: 'mock-resp-1',
      response: 'Mock AI response',
      widgets: [],
    }),
    getTodayPlan: jest.fn().mockResolvedValue({ plan: null }),
    getExercises: jest.fn().mockResolvedValue({ exercises: [] }),
    getTrackStats: jest.fn().mockResolvedValue({ completed_workouts: 0, total_prs: 0, total_planned: 0 }),
    getStrengthProgress: jest.fn().mockResolvedValue({ exercise_name: 'N/A', data_points: [], change_percent: 0 }),
  },
}));

// Mock offlineQueue
jest.mock('./services/offlineQueue', () => ({
  addToQueue: jest.fn().mockResolvedValue(undefined),
  getQueueSize: jest.fn().mockResolvedValue(0),
  processQueue: jest.fn().mockResolvedValue({ processed: 0, failed: 0 }),
  clearQueue: jest.fn().mockResolvedValue(undefined),
}));
