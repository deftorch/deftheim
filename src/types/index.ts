// Shared Types

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
