export const DEEP_LINK_SCHEMA = {
  tabs: {
    home: 'genesis://home',
    train: 'genesis://train',
    fuel: 'genesis://fuel',
    mind: 'genesis://mind',
    track: 'genesis://track',
  },
  modals: {
    chat: 'genesis://chat',
    camera: 'genesis://camera?mode=food|equipment',
    voice: 'genesis://voice?coachId=:coachId',
    video: 'genesis://video/:videoId',
    'check-in': 'genesis://check-in',
  },
  auth: {
    login: 'genesis://login',
    onboarding: 'genesis://onboarding',
  },
} as const;

export const LINKING_CONFIG = {
  prefixes: ['genesis://', 'https://genesis.app'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          home: 'home',
          train: 'train',
          fuel: 'fuel',
          mind: 'mind',
          track: 'track',
        },
      },
      '(modals)': {
        screens: {
          'genesis-chat': 'chat',
          'camera-scanner': 'camera/:mode',
          'voice-call': 'voice/:coachId',
          'exercise-video': 'video/:videoId',
        },
      },
    },
  },
} as const;
