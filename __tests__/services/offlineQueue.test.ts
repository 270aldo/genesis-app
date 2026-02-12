jest.unmock('../../services/offlineQueue');

import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a mock storage that actually stores data
const store: Record<string, string> = {};
(AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => store[key] ?? null);
(AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => { store[key] = value; });
(AsyncStorage.removeItem as jest.Mock).mockImplementation(async (key: string) => { delete store[key]; });

import { addToQueue, getQueueSize, processQueue, clearQueue } from '../../services/offlineQueue';

const QUEUE_KEY = '@genesis_offline_queue';

beforeEach(() => {
  // Clear the in-memory store between tests
  for (const key of Object.keys(store)) {
    delete store[key];
  }
  jest.clearAllMocks();
  // Re-apply our in-memory storage mocks (clearAllMocks resets them)
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => store[key] ?? null);
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => { store[key] = value; });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation(async (key: string) => { delete store[key]; });
});

describe('offlineQueue', () => {
  it('addToQueue() persists an operation and getQueueSize() returns 1', async () => {
    await addToQueue('meal_log', { date: '2026-02-11', meal_type: 'lunch' });
    const size = await getQueueSize();
    expect(size).toBe(1);
  });

  it('multiple addToQueue() calls accumulate correctly', async () => {
    await addToQueue('meal_log', { date: '2026-02-11' });
    await addToQueue('check_in', { date: '2026-02-11' });
    await addToQueue('water_log', { date: '2026-02-11', glasses: 4 });
    const size = await getQueueSize();
    expect(size).toBe(3);
  });

  it('clearQueue() removes all items', async () => {
    await addToQueue('meal_log', { date: '2026-02-11' });
    await addToQueue('check_in', { date: '2026-02-11' });
    expect(await getQueueSize()).toBe(2);

    await clearQueue();
    expect(await getQueueSize()).toBe(0);
  });

  it('processQueue() on empty queue returns {processed:0, failed:0}', async () => {
    const result = await processQueue();
    expect(result).toEqual({ processed: 0, failed: 0 });
  });

  it('processQueue() retries failed items and tracks them', async () => {
    // executeOperation uses dynamic import() which throws in Jest,
    // so all items go through the catch path. Items with retryCount < 3 are retried.
    await addToQueue('meal_log', { date: '2026-02-11', meal_type: 'lunch' });
    await addToQueue('water_log', { date: '2026-02-11', glasses: 5 });

    const result = await processQueue();
    // Both items fail (dynamic import issue) but retryCount was 0 < 3, so they're retried
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(2);

    // Items should still be in queue with incremented retryCount
    const size = await getQueueSize();
    expect(size).toBe(2);

    // Verify retryCount was incremented
    const raw = store[QUEUE_KEY];
    const queue = JSON.parse(raw);
    expect(queue[0].retryCount).toBe(1);
    expect(queue[1].retryCount).toBe(1);
  });

  it('items exceeding MAX_RETRIES=3 are dropped', async () => {
    // Manually insert an item with retryCount at the limit
    const failingItem = {
      id: 'fail_1',
      type: 'meal_log',
      payload: { date: '2026-02-11' },
      timestamp: Date.now(),
      retryCount: 3,
    };
    store[QUEUE_KEY] = JSON.stringify([failingItem]);

    // executeOperation throws -> catch path checks retryCount (3) < MAX_RETRIES (3) -> false -> dropped
    const result = await processQueue();
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(0); // Dropped, not in remaining

    // Queue should be empty now (item was dropped)
    expect(await getQueueSize()).toBe(0);
  });
});
