import { createStore } from "solid-js/store";
import { tauriCommands } from "@lib/api/tauri";

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
      const profiles = await tauriCommands.listProfiles();
      this.setProfiles(profiles);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      this.setProfiles([]);
    } finally {
      setProfileState("loading", false);
    }
  },

  async switchProfile(id: string) {
    setProfileState("loading", true);
    try {
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
