import { invoke as tauriInvoke } from "@tauri-apps/api/core";

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
  scanMods: () => invoke<any[]>("scan_mods"),
  installMod: (modId: string) => invoke<void>("install_mod", { modId }),
  uninstallMod: (modId: string) => invoke<void>("uninstall_mod", { modId }),
  enableMod: (modId: string) => invoke<void>("enable_mod", { modId }),
  disableMod: (modId: string) => invoke<void>("disable_mod", { modId }),

  // Profile operations
  createProfile: (profile: any) => invoke<any>("create_profile", { profile }),
  updateProfile: (id: string, updates: any) =>
    invoke<void>("update_profile", { id, updates }),
  deleteProfile: (id: string) => invoke<void>("delete_profile", { id }),
  switchProfile: (id: string) => invoke<void>("switch_profile", { id }),
  listProfiles: () => invoke<any[]>("list_profiles"),
  exportProfileToCode: (profileId: string) => invoke<string>("export_profile_to_code", { profileId }),
  importProfileFromCode: (code: string, newName: string) => invoke<any>("import_profile_from_code", { code, newName }),

  // System operations
  detectValheimPath: () => invoke<string>("detect_valheim_path"),
  checkBepinex: () => invoke<boolean>("check_bepinex"),
  installBepinex: () => invoke<void>("install_bepinex"),
  launchValheim: (profileId?: string) =>
    invoke<void>("launch_valheim", { profileId }),

  // Update operations
  checkUpdates: () => invoke<any[]>("check_updates"),
  updateMod: (repositoryPath: string, modId: string) => invoke<void>("update_mod", { repositoryPath, modId }),
  updateAllMods: (repositoryPath: string) => invoke<void>("update_all_mods", { repositoryPath }),

  // Backup operations
  createBackup: (description?: string) =>
    invoke<void>("create_backup", { description }),
  restoreBackup: (backupId: string) =>
    invoke<void>("restore_backup", { backupId }),
  listBackups: () => invoke<any[]>("list_backups"),

  // Settings operations
  saveSettings: (settings: any) => invoke<void>("save_settings", { settings }),
  loadSettings: () => invoke<any>("load_settings"),

  // Config operations
  listConfigFiles: (bepinexPath: string) => invoke<string[]>("list_config_files", { bepinexPath }),
  readConfigFile: (bepinexPath: string, filename: string) => invoke<string>("read_config_file", { bepinexPath, filename }),
  saveConfigFile: (bepinexPath: string, filename: string, content: string) => invoke<void>("save_config_file", { bepinexPath, filename, content })
};