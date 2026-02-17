import { useAuthStore } from '../../stores/useAuthStore';

const initialState = {
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

beforeEach(() => {
  useAuthStore.setState(initialState);
});

describe('useAuthStore', () => {
  it('has correct initial state shape', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isInitialized).toBe(false);
    expect(state.session).toBeNull();
    expect(state.error).toBeNull();
  });

  it('initialize() sets isInitialized true (no Supabase)', async () => {
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.isInitialized).toBe(true);
  });

  it('signIn() in demo mode sets demo user with the given email', async () => {
    await useAuthStore.getState().signIn('athlete@test.com', 'password123');
    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user!.email).toBe('athlete@test.com');
    expect(state.user!.name).toBe('Marco Reyes');
    expect(state.session).not.toBeNull();
    expect(state.error).toBeNull();
  });

  it('signOut() clears user and session', async () => {
    // First sign in
    await useAuthStore.getState().signIn('athlete@test.com', 'password123');
    expect(useAuthStore.getState().user).not.toBeNull();

    // Then sign out
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.error).toBeNull();
  });

  it('updateProfile() merges partial user data', async () => {
    // Set up a user first
    await useAuthStore.getState().signIn('athlete@test.com', 'password123');

    useAuthStore.getState().updateProfile({ name: 'Updated Name', avatar: 'https://img.url/avatar.jpg' });

    const state = useAuthStore.getState();
    expect(state.user!.name).toBe('Updated Name');
    expect(state.user!.avatar).toBe('https://img.url/avatar.jpg');
    // Original fields should remain
    expect(state.user!.email).toBe('athlete@test.com');
    expect(state.user!.plan).toBe('hybrid');
  });
});
