import { createStore, reconcile } from "solid-js/store";
import { tauriCommands } from "@lib/api/tauri";

// ============================================================================
// TYPES
// ============================================================================

export interface ModInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  size: number;
  installed: boolean;
  enabled: boolean;
  dependencies: string[];
  categories: string[];
  downloadUrl?: string;
  websiteUrl?: string;
  rating?: number;
  downloads?: number;
  lastUpdated: string;
}

// ============================================================================
// MOD STORE
// ============================================================================

interface ModState {
  mods: Record<string, ModInfo>;
  loading: boolean;
  error: string | null;
}

const [modState, setModState] = createStore<ModState>({
  mods: {},
  loading: false,
  error: null
});

export const modStore = {
  get state() {
    return modState;
  },

  get mods() {
    return Object.values(modState.mods);
  },

  get installedMods() {
    return Object.values(modState.mods).filter((mod) => mod.installed);
  },

  get enabledMods() {
    return Object.values(modState.mods).filter((mod) => mod.enabled);
  },

  getMod(id: string) {
    return modState.mods[id];
  },

  setMods(mods: ModInfo[]) {
    const modsMap: Record<string, ModInfo> = {};
    mods.forEach((mod) => {
      modsMap[mod.id] = mod;
    });
    setModState("mods", reconcile(modsMap));
  },

  addMod(mod: ModInfo) {
    setModState("mods", mod.id, mod);
  },

  updateMod(id: string, updates: Partial<ModInfo>) {
    setModState("mods", id, (mod) => ({ ...mod, ...updates }));
  },

  removeMod(id: string) {
    setModState("mods", (mods) => {
      const { [id]: _, ...rest } = mods;
      return rest;
    });
  },

  setLoading(loading: boolean) {
    setModState("loading", loading);
  },

  setError(error: string | null) {
    setModState("error", error);
  },

  async loadMods() {
    setModState("loading", true);
    setModState("error", null);
    try {
      const mods = await tauriCommands.scanMods();
      this.setMods(mods);
    } catch (err) {
      console.error("Failed to load mods:", err);
      // Fallback to empty for now if backend not ready
      this.setMods([]);
    } finally {
      setModState("loading", false);
    }
  }
};
