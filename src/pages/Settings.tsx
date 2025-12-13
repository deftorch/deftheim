import { Component, createSignal, Show, For } from "solid-js";
import { FolderOpen, Save, RotateCcw } from "lucide-solid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@components/common/Card";
import { Button } from "@components/common/Button";
import { Input } from "@components/common/Input";
import { toast } from "@components/common/Toast";
import { settingsStore } from "@stores/stores";

const Settings: Component = () => {
  const [activeTab, setActiveTab] = createSignal("general");
  const [hasChanges, setHasChanges] = createSignal(false);

  const tabs = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "paths", name: "Paths", icon: "📁" },
    { id: "updates", name: "Updates", icon: "🔄" },
    { id: "performance", name: "Performance", icon: "⚡" },
    { id: "advanced", name: "Advanced", icon: "🔧" }
  ];

  const handleSave = async () => {
    try {
      await settingsStore.saveSettings();
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (err) {
      toast.error("Failed to save settings", (err as Error).message);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      toast.info("Settings reset to defaults");
      setHasChanges(false);
    }
  };

  return (
    <div class="p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
            Settings
          </h1>
          <p class="text-[var(--color-text-secondary)] mt-1">
            Configure your mod manager preferences
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="secondary"
            icon={<RotateCcw size={20} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            icon={<Save size={20} />}
            onClick={handleSave}
            disabled={!hasChanges()}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div class="col-span-1">
          <Card>
            <CardContent class="p-2">
              <nav class="space-y-1">
                <For each={tabs}>
                  {(tab) => (
                    <button
                      class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab() === tab.id
                          ? "bg-[var(--color-accent-primary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span class="text-xl">{tab.icon}</span>
                      <span class="font-medium">{tab.name}</span>
                    </button>
                  )}
                </For>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div class="col-span-3 space-y-6">
          {/* General Settings */}
          <Show when={activeTab() === "general"}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Theme
                  </label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" value="dark" checked />
                      <span class="text-sm text-[var(--color-text-primary)]">
                        Dark
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" value="light" />
                      <span class="text-sm text-[var(--color-text-primary)]">
                        Light
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" value="auto" />
                      <span class="text-sm text-[var(--color-text-primary)]">
                        Auto
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Font Size
                  </label>
                  <select class="w-full px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]">
                    <option value="small">Small</option>
                    <option value="normal" selected>Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div class="flex items-center justify-between py-3 border-t border-[var(--color-border-subtle)]">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Enable Animations
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Smooth transitions and effects
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Startup</CardTitle>
                <CardDescription>Application launch behavior</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between py-3">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Launch at Windows startup
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Start mod manager when computer boots
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between py-3 border-t border-[var(--color-border-subtle)]">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Minimize to system tray
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Keep running in background
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Default Page
                  </label>
                  <select class="w-full px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]">
                    <option value="dashboard">Dashboard</option>
                    <option value="profiles">Profiles</option>
                    <option value="repository">Repository</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </Show>

          {/* Paths Settings */}
          <Show when={activeTab() === "paths"}>
            <Card>
              <CardHeader>
                <CardTitle>Valheim Installation</CardTitle>
                <CardDescription>Game and mod directory paths</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <Input
                    label="Game Path"
                    placeholder="C:\Program Files (x86)\Steam\steamapps\common\Valheim"
                    value="C:\Program Files (x86)\Steam\steamapps\common\Valheim"
                    fullWidth
                  />
                  <div class="flex gap-2 mt-2">
                    <Button size="small" variant="secondary" icon={<FolderOpen size={16} />}>
                      Browse
                    </Button>
                    <Button size="small" variant="secondary">
                      Auto-Detect
                    </Button>
                  </div>
                </div>

                <div>
                  <Input
                    label="BepInEx Path"
                    placeholder="C:\Program Files (x86)\Steam\steamapps\common\Valheim\BepInEx"
                    value="C:\Program Files (x86)\Steam\steamapps\common\Valheim\BepInEx"
                    fullWidth
                  />
                  <p class="text-xs text-[var(--color-accent-success)] mt-2">
                    ✓ BepInEx v5.4.22 detected
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mod Manager Data</CardTitle>
                <CardDescription>Storage locations for mods and profiles</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <Input
                    label="Repository Path"
                    placeholder="C:\Users\YourName\ValheimModManager\repository"
                    fullWidth
                  />
                  <p class="text-xs text-[var(--color-text-secondary)] mt-2">
                    Current size: 2.4 GB (247 mods)
                  </p>
                </div>

                <div>
                  <Input
                    label="Backup Path"
                    placeholder="C:\Users\YourName\ValheimModManager\backups"
                    fullWidth
                  />
                  <p class="text-xs text-[var(--color-text-secondary)] mt-2">
                    Current size: 1.2 GB (5 backups)
                  </p>
                </div>
              </CardContent>
            </Card>
          </Show>

          {/* Updates Settings */}
          <Show when={activeTab() === "updates"}>
            <Card>
              <CardHeader>
                <CardTitle>Automatic Updates</CardTitle>
                <CardDescription>Keep your mods up to date</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Check for updates
                  </label>
                  <select class="w-full px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>

                <div class="space-y-3 pt-4 border-t border-[var(--color-border-subtle)]">
                  <div class="flex items-center justify-between py-2">
                    <div>
                      <p class="text-sm font-medium text-[var(--color-text-primary)]">
                        Critical security updates
                      </p>
                      <p class="text-xs text-[var(--color-text-secondary)]">
                        Install automatically (recommended)
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked class="sr-only peer" />
                      <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between py-2">
                    <div>
                      <p class="text-sm font-medium text-[var(--color-text-primary)]">
                        Show in-app notifications
                      </p>
                      <p class="text-xs text-[var(--color-text-secondary)]">
                        Notify when updates are available
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked class="sr-only peer" />
                      <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Features</CardTitle>
                <CardDescription>Protect your data</CardDescription>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Auto-backup before updates
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Create restore point automatically
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Rollback on failure
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Restore automatically if update fails
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </Show>

          {/* Performance Settings */}
          <Show when={activeTab() === "performance"}>
            <Card>
              <CardHeader>
                <CardTitle>Application Performance</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Performance Mode
                  </label>
                  <select class="w-full px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]">
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="performance">High Performance</option>
                    <option value="power-saver">Low Power</option>
                  </select>
                </div>

                <div class="flex items-center justify-between py-3 border-t border-[var(--color-border-subtle)]">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Hardware acceleration
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Use GPU for rendering
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Cache Size Limit
                  </label>
                  <select class="w-full px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]">
                    <option value="250">250 MB</option>
                    <option value="500" selected>500 MB</option>
                    <option value="1000">1 GB</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                  <p class="text-xs text-[var(--color-text-secondary)] mt-2">
                    Current usage: 456 MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </Show>

          {/* Advanced Settings */}
          <Show when={activeTab() === "advanced"}>
            <Card>
              <CardHeader>
                <CardTitle>Developer Options</CardTitle>
                <CardDescription>
                  ⚠️ Advanced settings - use with caution
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Enable debug logging
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Detailed logs for troubleshooting
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-medium text-[var(--color-text-primary)]">
                      Show detailed error messages
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      Technical error information
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:ring-4 peer-focus:ring-[var(--color-accent-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-primary)]"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent class="space-y-2">
                <Button variant="secondary" fullWidth>
                  Export All Settings
                </Button>
                <Button variant="secondary" fullWidth>
                  Import Settings
                </Button>
                <Button variant="danger" fullWidth>
                  Clear All Application Data
                </Button>
              </CardContent>
            </Card>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Settings;