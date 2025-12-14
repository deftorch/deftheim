import { createStore } from "solid-js/store";

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
      // TODO: Call Tauri command to load settings
      console.log("Loading settings...");
    } catch (err) {
      setSettingsState("error", (err as Error).message);
    } finally {
      setSettingsState("loading", false);
    }
  },

  async saveSettings() {
    setSettingsState("loading", true);
    try {
      // TODO: Call Tauri command to save settings
      console.log("Saving settings...");
    } catch (err) {
      setSettingsState("error", (err as Error).message);
      throw err;
    } finally {
      setSettingsState("loading", false);
    }
  }
};
