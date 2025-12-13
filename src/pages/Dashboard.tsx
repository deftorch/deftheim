import { Component, Show, For } from "solid-js";
import { Motion } from "@components/common/Motion";
import {
  Play,
  Settings,
  Edit,
  Download,
  TrendingUp,
  Star,
  Package,
  Zap,
  Clock
} from "lucide-solid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/common/Card";
import { Button } from "@components/common/Button";
import { profileStore, modStore } from "@stores/stores";

const Dashboard: Component = () => {
  const activeProfile = () => profileStore.activeProfile;
  const recentMods = () => modStore.installedMods.slice(0, 3);

  // Mock data for demo
  const trendingMods = [
    { name: "Creature Level Control", category: "Combat", rating: 4.8 },
    { name: "Better Archery", category: "Gameplay", rating: 4.9 },
    { name: "Valheim Legends", category: "Overhaul", rating: 5.0 }
  ];

  const recentActivity = [
    { action: "5 mod updates available", type: "info", time: "2m ago" },
    { action: 'Profile "Combat Enhanced" updated', type: "success", time: "1h ago" },
    { action: "Downloaded: Epic Loot v0.9.10", type: "success", time: "2h ago" }
  ];

  const quickProfiles = [
    { id: "1", name: "Vanilla", icon: "🎮", mods: 0, color: "blue" },
    { id: "2", name: "Combat", icon: "⚔️", mods: 32, color: "red" },
    { id: "3", name: "Building", icon: "🏗️", mods: 25, color: "green" },
    { id: "4", name: "Magic", icon: "✨", mods: 40, color: "purple" }
  ];

  return (
    <div class="p-6 space-y-6">
      {/* Welcome Header */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Welcome back, Viking! 👋
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Ready to continue your adventure?
        </p>
      </Motion.div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Profile */}
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          class="lg:col-span-2"
        >
          <Card hover variant="elevated">
            <CardHeader>
              <CardTitle>Active Profile</CardTitle>
              <CardDescription>Currently loaded configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Show
                when={activeProfile()}
                fallback={
                  <div class="text-center py-8">
                    <p class="text-[var(--color-text-secondary)] mb-4">
                      No active profile
                    </p>
                    <Button variant="primary">Create Profile</Button>
                  </div>
                }
              >
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-3xl">
                    ⚔️
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
                      Combat Enhanced
                    </h3>
                    <p class="text-sm text-[var(--color-text-secondary)] mb-4">
                      Hardcore survival experience with enhanced combat
                    </p>
                    <div class="flex flex-wrap gap-4 text-sm">
                      <div class="flex items-center gap-2">
                        <Package size={16} class="text-[var(--color-accent-primary)]" />
                        <span class="text-[var(--color-text-secondary)]">
                          32 mods active
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Zap size={16} class="text-[var(--color-accent-success)]" />
                        <span class="text-[var(--color-text-secondary)]">
                          All up-to-date
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Clock size={16} class="text-[var(--color-accent-warning)]" />
                        <span class="text-[var(--color-text-secondary)]">
                          Last played: 2h ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 mt-6">
                  <Button variant="primary" icon={<Play size={16} />}>
                    Launch Valheim
                  </Button>
                  <Button variant="secondary" icon={<Settings size={16} />}>
                    Configure
                  </Button>
                  <Button variant="ghost" icon={<Edit size={16} />}>
                    Edit Mods
                  </Button>
                </div>
              </Show>
            </CardContent>
          </Card>
        </Motion.div>

        {/* Quick Actions */}
        <Motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <Button fullWidth variant="primary" icon={<Play size={16} />}>
                  Launch Game
                </Button>
                <Button fullWidth variant="secondary" icon={<Package size={16} />}>
                  Switch Profile
                </Button>
                <Button fullWidth variant="secondary" icon={<Download size={16} />}>
                  Add Mods
                </Button>
                <Button fullWidth variant="secondary" icon={<TrendingUp size={16} />}>
                  Check Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </Motion.div>
      </div>

      {/* Second Row */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <For each={recentActivity}>
                  {(item) => (
                    <div class="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-background-tertiary)]">
                      <div
                        class={`
                          w-2 h-2 mt-1.5 rounded-full flex-shrink-0
                          ${item.type === "success" ? "bg-[var(--color-accent-success)]" : ""}
                          ${item.type === "info" ? "bg-[var(--color-accent-primary)]" : ""}
                          ${item.type === "warning" ? "bg-[var(--color-accent-warning)]" : ""}
                        `}
                      />
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-[var(--color-text-primary)]">
                          {item.action}
                        </p>
                        <p class="text-xs text-[var(--color-text-tertiary)] mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </CardContent>
          </Card>
        </Motion.div>

        {/* Your Profiles */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-3">
                <For each={quickProfiles}>
                  {(profile) => (
                    <Motion.button
                      class="p-4 rounded-lg bg-[var(--color-background-tertiary)] hover:bg-[var(--color-surface-elevated)] transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div class="text-2xl mb-2">{profile.icon}</div>
                      <h4 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                        {profile.name}
                      </h4>
                      <p class="text-xs text-[var(--color-text-secondary)]">
                        {profile.mods} mods
                      </p>
                    </Motion.button>
                  )}
                </For>
              </div>
            </CardContent>
          </Card>
        </Motion.div>
      </div>

      {/* Discover */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Discover</CardTitle>
            <CardDescription>Trending mods this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <For each={trendingMods}>
                {(mod, index) => (
                  <div class="flex items-center gap-4 p-3 rounded-lg bg-[var(--color-background-tertiary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-primary)] text-white font-bold text-sm">
                      {index() + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {mod.name}
                      </h4>
                      <p class="text-xs text-[var(--color-text-tertiary)]">
                        {mod.category}
                      </p>
                    </div>
                    <div class="flex items-center gap-1 text-[var(--color-accent-warning)]">
                      <Star size={14} fill="currentColor" />
                      <span class="text-sm font-medium">{mod.rating}</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </CardContent>
        </Card>
      </Motion.div>
    </div>
  );
};

export default Dashboard;