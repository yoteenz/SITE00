import { describe, expect, it, beforeEach } from 'vitest';
import {
  experimentsHubScrollStorageKey,
  readExperimentsHubScrollY,
  writeExperimentsHubScrollY,
} from './experimentsHubScrollRestore';

function mockSessionStorage() {
  const store = new Map<string, string>();
  const sessionStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'window', {
    value: { sessionStorage: sessionStorageMock, scrollY: 0 },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
  });
  return store;
}

describe('experimentsHubScrollRestore', () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it('uses project-scoped sessionStorage keys', () => {
    expect(experimentsHubScrollStorageKey('ndxbook')).toBe('site00:experiments-hub-scroll:ndxbook');
  });

  it('round-trips scroll Y for a project', () => {
    writeExperimentsHubScrollY('ndxbook', 842);
    expect(readExperimentsHubScrollY('ndxbook')).toBe(842);
    expect(readExperimentsHubScrollY('other')).toBeNull();
  });

  it('ignores invalid stored values', () => {
    sessionStorage.setItem(experimentsHubScrollStorageKey('ndxbook'), 'not-a-number');
    expect(readExperimentsHubScrollY('ndxbook')).toBeNull();
  });
});
