import { createStore, reconcile } from "solid-js/store";

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

export interface Profile {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  mods: string[]; // mod IDs
  active: boolean;
  created: string;
  lastUsed: string;
  playTime: number;
}

export interface AppSettings {
  valheimPath: string;
  bepinexPath: string;
  repositoryPath: string;
  backupPath: string;
  theme: "dark" | "light";
  autoUpdate: boolean;
  autoBackup: boolean;
  language: string;
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
      const { tauriCommands } = await import("@lib/api/tauri");
      const mods = await tauriCommands.scanMods();
      this.setMods(mods);
    } catch (err) {
      console.error("Failed to load mods:", err);
      setModState("error", (err as Error).message);
      this.setMods([]);
    } finally {
      setModState("loading", false);
    }
  }
};

// ============================================================================
// PROFILE STORE
// ============================================================================

interface ProfileState {
  profiles: Record<string, Profile>;
  activeProfileId: string | null;
  loading: boolean;
  error: string | null;
}

const [profileState, setProfileState] = createStore<ProfileState>({
  profiles: {},
  activeProfileId: null,
  loading: false,
  error: null
});

export const profileStore = {
  get state() {
    return profileState;
  },

  get profiles() {
    return Object.values(profileState.profiles);
  },

  get activeProfile() {
    return profileState.activeProfileId
      ? profileState.profiles[profileState.activeProfileId]
      : null;
  },

  getProfile(id: string) {
    return profileState.profiles[id];
  },

  setProfiles(profiles: Profile[]) {
    const profilesMap: Record<string, Profile> = {};
    profiles.forEach((profile) => {
      profilesMap[profile.id] = profile;
    });
    setProfileState("profiles", profilesMap);
  },

  addProfile(profile: Profile) {
    setProfileState("profiles", profile.id, profile);
  },

  updateProfile(id: string, updates: Partial<Profile>) {
    setProfileState("profiles", id, (profile) => ({ ...profile, ...updates }));
  },

  removeProfile(id: string) {
    setProfileState("profiles", (profiles) => {
      const { [id]: _, ...rest } = profiles;
      return rest;
    });
  },

  setActiveProfile(id: string | null) {
    // Deactivate all profiles
    Object.keys(profileState.profiles).forEach((profileId) => {
      setProfileState("profiles", profileId, "active", false);
    });

    // Activate selected profile
    if (id) {
      setProfileState("profiles", id, "active", true);
      setProfileState("activeProfileId", id);
    } else {
      setProfileState("activeProfileId", null);
    }
  },

  setLoading(loading: boolean) {
    setProfileState("loading", loading);
  },

  setError(error: string | null) {
    setProfileState("error", error);
  },

  async loadProfiles() {
    setProfileState("loading", true);
    setProfileState("error", null);
    try {
      const { tauriCommands } = await import("@lib/api/tauri");
      const profiles = await tauriCommands.listProfiles();
      this.setProfiles(profiles);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      setProfileState("error", (err as Error).message);
      this.setProfiles([]);
    } finally {
      setProfileState("loading", false);
    }
  },

  async switchProfile(id: string) {
    setProfileState("loading", true);
    try {
      const { tauriCommands } = await import("@lib/api/tauri");
      await tauriCommands.switchProfile(id);
      this.setActiveProfile(id);
    } catch (err) {
      setProfileState("error", (err as Error).message);
      throw err;
    } finally {
      setProfileState("loading", false);
    }
  }
};

// ============================================================================
// SETTINGS STORE
// ============================================================================

interface SettingsState extends AppSettings {
  loading: boolean;
  error: string | null;
}

const [settingsState, setSettingsState] = createStore<SettingsState>({
  valheimPath: "",
  bepinexPath: "",
  repositoryPath: "",
  backupPath: "",
  theme: "dark",
  autoUpdate: true,
  autoBackup: true,
  language: "en",
  loading: false,
  error: null
});

export const settingsStore = {
  get state() {
    return settingsState;
  },

  get settings(): AppSettings {
    const { loading, error, ...settings } = settingsState;
    return settings;
  },

  updateSettings(updates: Partial<AppSettings>) {
    setSettingsState((state) => ({ ...state, ...updates }));
  },

  setLoading(loading: boolean) {
    setSettingsState("loading", loading);
  },

  setError(error: string | null) {
    setSettingsState("error", error);
  },

  async loadSettings() {
    setSettingsState("loading", true);
    setSettingsState("error", null);
    try {
      const { tauriCommands } = await import("@lib/api/tauri");
      const settings = await tauriCommands.loadSettings();
      this.updateSettings(settings);
    } catch (err) {
      setSettingsState("error", (err as Error).message);
    } finally {
      setSettingsState("loading", false);
    }
  },

  async saveSettings() {
    setSettingsState("loading", true);
    try {
      const { tauriCommands } = await import("@lib/api/tauri");
      // Use get settings logic to avoid passing loading/error states
      const { loading, error, ...settings } = settingsState;
      await tauriCommands.saveSettings(settings);
    } catch (err) {
      setSettingsState("error", (err as Error).message);
      throw err;
    } finally {
      setSettingsState("loading", false);
    }
  }
};

// ============================================================================
// UI STORE
// ============================================================================

interface UIState {
  sidebarCollapsed: boolean;
  currentPage: string;
}

const [uiState, setUIState] = createStore<UIState>({
  sidebarCollapsed: false,
  currentPage: "/"
});

export const uiStore = {
  get state() {
    return uiState;
  },

  toggleSidebar() {
    setUIState("sidebarCollapsed", (collapsed) => !collapsed);
  },

  setSidebarCollapsed(collapsed: boolean) {
    setUIState("sidebarCollapsed", collapsed);
  },

  setCurrentPage(page: string) {
    setUIState("currentPage", page);
  }
};