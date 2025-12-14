import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import type { ModInfo } from "@stores/mod.store";
import type { Profile } from "@stores/profile.store";

// Helper function for Tauri API calls
export async function invoke<T>(command: string, args?: any): Promise<T> {
  try {
    return await tauriInvoke<T>(command, args);
  } catch (error) {
    console.error(`[Tauri] Error invoking command "${command}":`, error);
    throw error;
  }
}

export const tauriCommands = {
  // Mod operations
  scanMods: () => invoke<ModInfo[]>("scan_mods"),
  installMod: (modId: string) => invoke<void>("install_mod", { modId }),
  uninstallMod: (modId: string) => invoke<void>("uninstall_mod", { modId }),
  enableMod: (modId: string) => invoke<void>("enable_mod", { modId }),
  disableMod: (modId: string) => invoke<void>("disable_mod", { modId }),

  // Profile operations
  createProfile: (profile: Profile) => invoke<Profile>("create_profile", { profile }),
  updateProfile: (id: string, updates: Partial<Profile>) =>
    invoke<void>("update_profile", { id, updates }),
  deleteProfile: (id: string) => invoke<void>("delete_profile", { id }),
  switchProfile: (id: string) => invoke<void>("switch_profile", { id }),
  listProfiles: () => invoke<Profile[]>("list_profiles"),

  // System operations
  detectValheimPath: () => invoke<string>("detect_valheim_path"),
  checkBepinex: () => invoke<boolean>("check_bepinex"),
  installBepinex: () => invoke<void>("install_bepinex"),
  launchValheim: (profileId?: string) =>
    invoke<void>("launch_valheim", { profileId }),

  // Update operations
  checkUpdates: () => invoke<any[]>("check_updates"), // Update return type when model exists
  updateMod: (modId: string) => invoke<void>("update_mod", { modId }),

  // Backup operations
  createBackup: (description?: string) =>
    invoke<void>("create_backup", { description }),
  restoreBackup: (backupId: string) =>
    invoke<void>("restore_backup", { backupId }),
  listBackups: () => invoke<any[]>("list_backups") // Update return type when model exists
};
