import { Component, createSignal, Show, For } from "solid-js";
import { Motion } from "@components/common/Motion";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Copy,
  Share2,
  Settings,
  Clock,
  Package,
  Zap
} from "lucide-solid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@components/common/Card";
import { Button, IconButton } from "@components/common/Button";
import { Input, SearchInput } from "@components/common/Input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter
} from "@components/common/Modal";
import { toast } from "@components/common/Toast";
import { profileStore } from "@stores/stores";

const Profiles: Component = () => {
  const [view, setView] = createSignal<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = createSignal("");
  const [sortBy, setSortBy] = createSignal("lastPlayed");
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [selectedProfile, setSelectedProfile] = createSignal<string | null>(null);
  const [profileToDelete, setProfileToDelete] = createSignal<string | null>(null);

  // Mock profiles for demo
  const profiles = () => [
    {
      id: "1",
      name: "Vanilla",
      description: "Pure Valheim experience",
      icon: "🎮",
      color: "blue",
      mods: 0,
      active: false,
      lastUsed: "30d ago",
      playTime: 0
    },
    {
      id: "2",
      name: "Combat Enhanced",
      description: "Hardcore survival with enhanced combat",
      icon: "⚔️",
      color: "red",
      mods: 32,
      active: true,
      lastUsed: "2h ago",
      playTime: 48
    },
    {
      id: "3",
      name: "Building Pack",
      description: "Creative freedom with unlimited building",
      icon: "🏗️",
      color: "green",
      mods: 25,
      active: false,
      lastUsed: "5d ago",
      playTime: 24
    },
    {
      id: "4",
      name: "Magic & Farming",
      description: "Chill farming with magic elements",
      icon: "✨🌾",
      color: "purple",
      mods: 18,
      active: false,
      lastUsed: "60d ago",
      playTime: 12
    }
  ];

  const filteredProfiles = () => {
    let filtered = profiles();

    if (searchQuery()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery().toLowerCase())
      );
    }

    return filtered;
  };

  const handleLaunchProfile = async (id: string) => {
    try {
      await profileStore.switchProfile(id);
      toast.success("Profile Activated", `Launching Valheim with ${profiles().find(p => p.id === id)?.name}`);
    } catch (err) {
      toast.error("Failed to launch", (err as Error).message);
    }
  };

  const requestDelete = (id: string) => {
    setProfileToDelete(id);
  };

  const confirmDelete = async () => {
    const id = profileToDelete();
    if (id) {
      try {
        profileStore.removeProfile(id);
        toast.success("Profile deleted");
      } catch (err) {
        toast.error("Failed to delete", (err as Error).message);
      }
      setProfileToDelete(null);
    }
  };

  return (
    <div class="p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
            My Profiles
          </h1>
          <p class="text-[var(--color-text-secondary)] mt-1">
            Manage your mod configurations
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Profile
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent class="py-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[300px]">
              <SearchInput
                placeholder="Search profiles..."
                onSearch={setSearchQuery}
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--color-text-secondary)]">
                Sort by:
              </span>
              <select
                class="px-3 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] text-sm"
                value={sortBy()}
                onChange={(e) => setSortBy(e.currentTarget.value)}
              >
                <option value="lastPlayed">Last Played</option>
                <option value="name">Name</option>
                <option value="mods">Mod Count</option>
                <option value="created">Date Created</option>
              </select>
            </div>
            <div class="flex gap-1 p-1 bg-[var(--color-background-tertiary)] rounded-lg">
              <button
                class={`px-3 py-1 rounded transition-colors ${
                  view() === "grid"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                class={`px-3 py-1 rounded transition-colors ${
                  view() === "list"
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Grid */}
      <Show
        when={view() === "grid"}
        fallback={
          <div class="space-y-3">
            <For each={filteredProfiles()}>
              {(profile) => (
                <Card hover>
                  <CardContent class="py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-2xl">
                        {profile.icon}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">
                            {profile.name}
                          </h3>
                          <Show when={profile.active}>
                            <span class="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent-success)] text-white rounded-full">
                              Active
                            </span>
                          </Show>
                        </div>
                        <p class="text-sm text-[var(--color-text-secondary)] truncate">
                          {profile.description}
                        </p>
                      </div>
                      <div class="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
                        <div class="flex items-center gap-2">
                          <Package size={16} />
                          <span>{profile.mods} mods</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{profile.lastUsed}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <Button
                          size="small"
                          variant="primary"
                          icon={<Play size={16} />}
                          onClick={() => handleLaunchProfile(profile.id)}
                        >
                          Launch
                        </Button>
                        <IconButton
                          size="small"
                          variant="secondary"
                          icon={<Edit size={16} />}
                          aria-label="Edit"
                        />
                        <IconButton
                          size="small"
                          variant="secondary"
                          icon={<Trash2 size={16} />}
                          aria-label="Delete"
                          onClick={() => requestDelete(profile.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </For>
          </div>
        }
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={filteredProfiles()}>
            {(profile) => (
              <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card hover>
                  <CardContent class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-3xl">
                        {profile.icon}
                      </div>
                      <Show when={profile.active}>
                        <span class="px-2 py-1 text-xs font-medium bg-[var(--color-accent-success)] text-white rounded-full">
                          Active
                        </span>
                      </Show>
                    </div>

                    <h3 class="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {profile.name}
                    </h3>
                    <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                      {profile.description}
                    </p>

                    <div class="space-y-2 mb-6">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-[var(--color-text-secondary)]">
                          Mods:
                        </span>
                        <span class="font-medium text-[var(--color-text-primary)]">
                          {profile.mods}
                        </span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-[var(--color-text-secondary)]">
                          Last used:
                        </span>
                        <span class="font-medium text-[var(--color-text-primary)]">
                          {profile.lastUsed}
                        </span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-[var(--color-text-secondary)]">
                          Play time:
                        </span>
                        <span class="font-medium text-[var(--color-text-primary)]">
                          {profile.playTime}h
                        </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <Button
                        fullWidth
                        variant="primary"
                        size="small"
                        icon={<Play size={16} />}
                        onClick={() => handleLaunchProfile(profile.id)}
                      >
                        Launch
                      </Button>
                      <IconButton
                        size="small"
                        variant="secondary"
                        icon={<Settings size={16} />}
                        aria-label="Settings"
                      />
                    </div>

                    <div class="flex gap-2 mt-2">
                      <IconButton
                        size="small"
                        variant="ghost"
                        icon={<Edit size={16} />}
                        aria-label="Edit"
                      />
                      <IconButton
                        size="small"
                        variant="ghost"
                        icon={<Copy size={16} />}
                        aria-label="Duplicate"
                      />
                      <IconButton
                        size="small"
                        variant="ghost"
                        icon={<Share2 size={16} />}
                        aria-label="Share"
                      />
                      <IconButton
                        size="small"
                        variant="ghost"
                        icon={<Trash2 size={16} />}
                        aria-label="Delete"
                        onClick={() => requestDelete(profile.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            )}
          </For>

          {/* Create New Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card hover>
              <CardContent class="p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div class="w-16 h-16 rounded-xl bg-[var(--color-background-tertiary)] flex items-center justify-center mb-4">
                  <Plus size={32} class="text-[var(--color-text-secondary)]" />
                </div>
                <h3 class="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  Create New Profile
                </h3>
                <p class="text-sm text-[var(--color-text-secondary)] mb-4">
                  Start with a template or build from scratch
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Motion.div>
        </div>
      </Show>

      {/* Create Profile Modal */}
      <Modal open={showCreateModal()} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader onClose={() => setShowCreateModal(false)}>
            <ModalTitle>Create New Profile</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div class="space-y-4">
              <Input
                label="Profile Name"
                placeholder="e.g., Combat Enhanced"
                fullWidth
              />
              <Input
                label="Description"
                placeholder="Brief description of this profile"
                fullWidth
              />
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Choose an Icon
                </label>
                <div class="flex gap-2 flex-wrap">
                  <For each={["🎮", "⚔️", "🏗️", "✨", "🌲", "🔥", "🛡️", "⚡"]}>
                    {(icon) => (
                      <button class="w-12 h-12 rounded-lg bg-[var(--color-background-tertiary)] hover:bg-[var(--color-surface-elevated)] transition-colors text-2xl">
                        {icon}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowCreateModal(false);
                toast.success("Profile created!");
              }}
            >
              Create Profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!profileToDelete()} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <ModalContent>
          <ModalHeader onClose={() => setProfileToDelete(null)}>
            <ModalTitle class="text-[var(--color-accent-error)]">Delete Profile?</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p class="text-[var(--color-text-secondary)]">
              Are you sure you want to delete this profile? This action cannot be undone and will remove all associated configurations.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setProfileToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Permanently
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Profiles;
