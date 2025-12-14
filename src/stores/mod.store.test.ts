import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { modStore } from './mod.store';

// Mock the Tauri API
vi.mock('@lib/api/tauri', () => ({
  tauriCommands: {
    scanMods: vi.fn(),
  },
}));

import { tauriCommands } from '@lib/api/tauri';

describe('ModStore', () => {
  beforeEach(() => {
    // Reset store state if needed, or just rely on isolation
    // Since SolidJS stores are global singletons, we MUST clear it.
    modStore.setMods([]);
    modStore.setError(null);
    modStore.setLoading(false);
  });

  it('should initialize with empty mods', () => {
    expect(modStore.mods).toEqual([]);
    expect(modStore.state.loading).toBe(false);
  });

  it('should add a mod correctly', () => {
    const newMod = {
      id: 'test-mod',
      name: 'Test Mod',
      version: '1.0.0',
      author: 'Tester',
      description: 'A test mod',
      size: 100,
      installed: true,
      enabled: true,
      dependencies: [],
      categories: [],
      lastUpdated: '2024-01-01',
    };

    createRoot(() => {
        modStore.addMod(newMod);
    });

    expect(modStore.mods).toHaveLength(1);
    expect(modStore.getMod('test-mod')).toEqual(newMod);
  });

  it('should load mods from backend', async () => {
    const mockMods = [{
      id: 'backend-mod',
      name: 'Backend Mod',
      version: '1.0.0',
      author: 'Backend',
      description: 'From Backend',
      size: 200,
      installed: true,
      enabled: false,
      dependencies: [],
      categories: [],
      lastUpdated: '2024-01-01',
    }];

    (tauriCommands.scanMods as any).mockResolvedValue(mockMods);

    await modStore.loadMods();

    expect(modStore.mods).toHaveLength(1);
    expect(modStore.mods[0].id).toBe('backend-mod');
    expect(modStore.state.loading).toBe(false);
    expect(modStore.state.error).toBeNull();
  });
});
