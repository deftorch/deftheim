// ============================================================================
// src/components/common/index.ts
// ============================================================================
export { Button, IconButton } from "./Button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "./Card";
export { Input, SearchInput, Textarea } from "./Input";
export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter
} from "./Modal";
export { Toaster, toast } from "./Toast";
export type { Toast, ToastType } from "./Toast";

// ============================================================================
// src/components/layout/index.ts
// ============================================================================
export { Sidebar } from "./Sidebar";

// ============================================================================
// src/stores/index.ts
// ============================================================================
export { modStore, profileStore, settingsStore, uiStore } from "./stores";
export type { ModInfo, Profile, AppSettings } from "./stores";

// ============================================================================
// src/lib/types/index.ts
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DownloadProgress {
  modId: string;
  progress: number;
  downloaded: number;
  total: number;
  speed: number;
}

export interface ConflictInfo {
  type: "file" | "dependency" | "version";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedMods: string[];
  solutions: ConflictSolution[];
}

export interface ConflictSolution {
  id: string;
  description: string;
  automatic: boolean;
  recommended: boolean;
}

// ============================================================================
// src/lib/utils/index.ts
// ============================================================================
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// src/lib/api/tauri.ts
// ============================================================================
// Helper functions for Tauri API calls
// Note: These are stubs that will be implemented with actual Tauri invoke calls

export async function invoke<T>(command: string, args?: any): Promise<T> {
  // TODO: Replace with actual Tauri invoke
  console.log(`[Tauri] ${command}`, args);
  
  // Mock implementation for development
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {} as T;
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

  // System operations
  detectValheimPath: () => invoke<string>("detect_valheim_path"),
  checkBepinex: () => invoke<boolean>("check_bepinex"),
  installBepinex: () => invoke<void>("install_bepinex"),
  launchValheim: (profileId?: string) =>
    invoke<void>("launch_valheim", { profileId }),

  // Update operations
  checkUpdates: () => invoke<any[]>("check_updates"),
  updateMod: (modId: string) => invoke<void>("update_mod", { modId }),
  updateAllMods: () => invoke<void>("update_all_mods"),

  // Backup operations
  createBackup: (description?: string) =>
    invoke<void>("create_backup", { description }),
  restoreBackup: (backupId: string) =>
    invoke<void>("restore_backup", { backupId }),
  listBackups: () => invoke<any[]>("list_backups")
};