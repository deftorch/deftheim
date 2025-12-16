import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { modStore, profileStore, settingsStore, type ModInfo, type Profile, type AppSettings } from "./stores";
import { createRoot } from "solid-js";

// Mock Tauri API
const mockScanMods = vi.fn();
const mockListProfiles = vi.fn();
const mockSwitchProfile = vi.fn();
const mockLoadSettings = vi.fn();
const mockSaveSettings = vi.fn();

vi.mock("@lib/api/tauri", () => ({
  tauriCommands: {
    scanMods: () => mockScanMods(),
    listProfiles: () => mockListProfiles(),
    switchProfile: (id: string) => mockSwitchProfile(id),
    loadSettings: () => mockLoadSettings(),
    saveSettings: (settings: any) => mockSaveSettings(settings),
  },
}));

describe("Mod Store", () => {
  beforeEach(() => {
    // Reset store state
    createRoot(() => {
      modStore.setMods([]);
      modStore.setLoading(false);
      modStore.setError(null);
    });
    vi.clearAllMocks();
  });

  it("should load mods successfully", async () => {
    const mockMods: ModInfo[] = [
      {
        id: "mod1",
        name: "Test Mod",
        version: "1.0.0",
        author: "Test Author",
        description: "A test mod",
        size: 1000,
        installed: true,
        enabled: true,
        dependencies: [],
        categories: [],
        lastUpdated: "2023-01-01",
      },
    ];

    mockScanMods.mockResolvedValue(mockMods);

    await modStore.loadMods();

    expect(modStore.mods).toEqual(mockMods);
    expect(modStore.state.loading).toBe(false);
    expect(modStore.state.error).toBeNull();
  });

  it("should handle load mods error", async () => {
    mockScanMods.mockRejectedValue(new Error("Failed to scan"));

    await modStore.loadMods();

    expect(modStore.mods).toEqual([]);
    expect(modStore.state.loading).toBe(false);
    expect(modStore.state.error).toBe("Failed to scan");
  });
});

describe("Profile Store", () => {
  beforeEach(() => {
    // Reset store state
    createRoot(() => {
      profileStore.setProfiles([]);
      profileStore.setActiveProfile(null);
      profileStore.setLoading(false);
      profileStore.setError(null);
    });
    vi.clearAllMocks();
  });

  it("should load profiles successfully", async () => {
    const mockProfiles: Profile[] = [
      {
        id: "profile1",
        name: "Test Profile",
        description: "A test profile",
        icon: "icon.png",
        color: "blue",
        mods: ["mod1"],
        active: false,
        created: "2023-01-01",
        lastUsed: "2023-01-01",
        playTime: 0,
      },
    ];

    mockListProfiles.mockResolvedValue(mockProfiles);

    await profileStore.loadProfiles();

    expect(profileStore.profiles).toEqual(mockProfiles);
    expect(profileStore.state.loading).toBe(false);
  });

  it("should switch profile successfully", async () => {
    const profileId = "profile1";
    mockSwitchProfile.mockResolvedValue(undefined);

    // Setup initial state
    createRoot(() => {
      profileStore.addProfile({
        id: profileId,
        name: "Test Profile",
        description: "",
        icon: "",
        color: "",
        mods: [],
        active: false,
        created: "",
        lastUsed: "",
        playTime: 0,
      });
    });

    await profileStore.switchProfile(profileId);

    expect(mockSwitchProfile).toHaveBeenCalledWith(profileId);
    expect(profileStore.activeProfile?.id).toBe(profileId);
  });
});

describe("Settings Store", () => {
  beforeEach(() => {
    createRoot(() => {
      settingsStore.setLoading(false);
      settingsStore.setError(null);
    });
    vi.clearAllMocks();
  });

  it("should load settings successfully", async () => {
    const mockSettings: AppSettings = {
      valheimPath: "/path/to/valheim",
      bepinexPath: "/path/to/bepinex",
      repositoryPath: "/path/to/repo",
      backupPath: "/path/to/backups",
      theme: "dark",
      autoUpdate: true,
      autoBackup: true,
      language: "en",
    };

    mockLoadSettings.mockResolvedValue(mockSettings);

    await settingsStore.loadSettings();

    expect(settingsStore.settings).toEqual(mockSettings);
    expect(settingsStore.state.loading).toBe(false);
  });

  it("should save settings successfully", async () => {
    mockSaveSettings.mockResolvedValue(undefined);

    const newSettings: AppSettings = {
      valheimPath: "/new/path",
      bepinexPath: "/new/path",
      repositoryPath: "/new/path",
      backupPath: "/new/path",
      theme: "light",
      autoUpdate: false,
      autoBackup: false,
      language: "fr",
    };

    // Update store state first (simulating user input)
    createRoot(() => {
        settingsStore.updateSettings(newSettings);
    });

    await settingsStore.saveSettings();

    expect(mockSaveSettings).toHaveBeenCalledWith(expect.objectContaining(newSettings));
    expect(settingsStore.state.loading).toBe(false);
  });
});
