import { Component, createSignal, Show, For } from "solid-js";
import { Motion } from "motion/solid";
import {
  Download,
  Search,
  Filter,
  Star,
  TrendingUp,
  Package,
  ExternalLink,
  Check,
  Loader
} from "lucide-solid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@components/common/Card";
import { Button, IconButton } from "@components/common/Button";
import { SearchInput } from "@components/common/Input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter
} from "@components/common/Modal";
import { toast } from "@components/common/Toast";
import { modStore } from "@stores";
import { formatBytes } from "@lib/utils";

const Repository: Component = () => {
  const [activeTab, setActiveTab] = createSignal<"local" | "online">("local");
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal("all");
  const [selectedMod, setSelectedMod] = createSignal<any>(null);
  const [showModDetail, setShowModDetail] = createSignal(false);

  const categories = [
    { id: "all", name: "All", count: 247 },
    { id: "combat", name: "Combat", count: 45 },
    { id: "building", name: "Building", count: 38 },
    { id: "qol", name: "Quality of Life", count: 67 },
    { id: "graphics", name: "Graphics", count: 23 },
    { id: "magic", name: "Magic", count: 18 },
    { id: "exploration", name: "Exploration", count: 31 },
    { id: "items", name: "Items", count: 25 }
  ];

  const mods = () => [
    {
      id: "1",
      name: "Creature Level & Loot Control",
      author: "RandyKnapp",
      version: "4.6.10",
      description: "Dynamic difficulty scaling for enemies based on distance from spawn and biome difficulty. Makes exploration more rewarding!",
      category: "combat",
      rating: 4.8,
      downloads: 125482,
      size: 2.3 * 1024 * 1024,
      installed: true,
      enabled: true,
      lastUpdated: "3 days ago",
      thumbnail: "🦴"
    },
    {
      id: "2",
      name: "Epic Loot",
      author: "RandyKnapp",
      version: "0.9.10",
      description: "Item rarity, enchantments, and legendary loot drops. Transform Valheim into an ARPG experience.",
      category: "items",
      rating: 4.9,
      downloads: 98234,
      size: 4.1 * 1024 * 1024,
      installed: true,
      enabled: true,
      lastUpdated: "5 days ago",
      thumbnail: "⚔️"
    },
    {
      id: "3",
      name: "Valheim Plus",
      author: "nxPublic",
      version: "0.9.12",
      description: "Quality of life improvements and tweaks. Highly customizable with extensive configuration options.",
      category: "qol",
      rating: 4.7,
      downloads: 250123,
      size: 2.5 * 1024 * 1024,
      installed: true,
      enabled: true,
      lastUpdated: "1 week ago",
      thumbnail: "⚡"
    },
    {
      id: "4",
      name: "Better Archery",
      author: "ishid4",
      version: "1.9.1",
      description: "Enhanced archery mechanics with improved arrow physics and new bow types.",
      category: "combat",
      rating: 4.6,
      downloads: 67890,
      size: 1.8 * 1024 * 1024,
      installed: false,
      enabled: false,
      lastUpdated: "2 weeks ago",
      thumbnail: "🏹"
    },
    {
      id: "5",
      name: "Build Camera",
      author: "Therzie",
      version: "1.2.5",
      description: "Advanced camera controls for building. Includes freecam, grid snapping, and more.",
      category: "building",
      rating: 4.9,
      downloads: 45678,
      size: 1.1 * 1024 * 1024,
      installed: false,
      enabled: false,
      lastUpdated: "1 month ago",
      thumbnail: "📷"
    },
    {
      id: "6",
      name: "Valheim Legends",
      author: "LegendsMod",
      version: "2.0.0",
      description: "Major overhaul adding classes, skills, and new progression systems.",
      category: "magic",
      rating: 5.0,
      downloads: 89012,
      size: 15.2 * 1024 * 1024,
      installed: false,
      enabled: false,
      lastUpdated: "NEW",
      thumbnail: "✨"
    }
  ];

  const filteredMods = () => {
    let filtered = mods();

    if (selectedCategory() !== "all") {
      filtered = filtered.filter((m) => m.category === selectedCategory());
    }

    if (searchQuery()) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery().toLowerCase())
      );
    }

    return filtered;
  };

  const handleInstallMod = async (modId: string) => {
    toast.info("Downloading mod...", "This may take a few moments");
    // Simulate installation
    setTimeout(() => {
      toast.success("Mod installed!", "Added to repository");
    }, 2000);
  };

  const handleViewDetails = (mod: any) => {
    setSelectedMod(mod);
    setShowModDetail(true);
  };

  return (
    <div class="p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
            Mod Repository
          </h1>
          <p class="text-[var(--color-text-secondary)] mt-1">
            Browse and manage your mod collection
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div class="flex gap-4">
        <button
          class={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab() === "local"
              ? "bg-[var(--color-accent-primary)] text-white"
              : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          onClick={() => setActiveTab("local")}
        >
          📁 Local Mods
        </button>
        <button
          class={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab() === "online"
              ? "bg-[var(--color-accent-primary)] text-white"
              : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          onClick={() => setActiveTab("online")}
        >
          🌐 Browse Online
        </button>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent class="py-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <SearchInput
                placeholder="Search mods by name or description..."
                onSearch={setSearchQuery}
              />
            </div>
            <div class="flex gap-2">
              <select
                class="px-4 py-2 bg-[var(--color-background-tertiary)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]"
                value={selectedCategory()}
                onChange={(e) => setSelectedCategory(e.currentTarget.value)}
              >
                <For each={categories}>
                  {(cat) => (
                    <option value={cat.id}>
                      {cat.name} ({cat.count})
                    </option>
                  )}
                </For>
              </select>
              <Button variant="secondary" icon={<Filter size={20} />}>
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Section (Online Tab) */}
      <Show when={activeTab() === "online"}>
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <TrendingUp size={20} class="text-[var(--color-accent-warning)]" />
              <CardTitle>Trending This Week</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <For each={mods().slice(0, 3)}>
                {(mod) => (
                  <div class="p-4 bg-[var(--color-background-tertiary)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer">
                    <div class="flex items-start gap-3 mb-3">
                      <div class="text-3xl">{mod.thumbnail}</div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-[var(--color-text-primary)] truncate">
                          {mod.name}
                        </h4>
                        <div class="flex items-center gap-2 mt-1">
                          <div class="flex items-center gap-1 text-[var(--color-accent-warning)]">
                            <Star size={12} fill="currentColor" />
                            <span class="text-xs font-medium">{mod.rating}</span>
                          </div>
                          <span class="text-xs text-[var(--color-text-tertiary)]">
                            {(mod.downloads / 1000).toFixed(1)}K downloads
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="primary"
                      fullWidth
                      icon={<Download size={14} />}
                    >
                      Quick Install
                    </Button>
                  </div>
                )}
              </For>
            </div>
          </CardContent>
        </Card>
      </Show>

      {/* Mod List */}
      <div class="grid grid-cols-1 gap-4">
        <For each={filteredMods()}>
          {(mod) => (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card hover>
                <CardContent class="p-6">
                  <div class="flex gap-4">
                    {/* Icon */}
                    <div class="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-4xl">
                      {mod.thumbnail}
                    </div>

                    {/* Content */}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-4 mb-2">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <h3
                              class="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] cursor-pointer truncate"
                              onClick={() => handleViewDetails(mod)}
                            >
                              {mod.name}
                            </h3>
                            <Show when={mod.installed}>
                              <span class="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent-success)] text-white rounded-full flex items-center gap-1">
                                <Check size={12} />
                                Installed
                              </span>
                            </Show>
                            <Show when={mod.lastUpdated === "NEW"}>
                              <span class="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent-warning)] text-white rounded-full">
                                NEW
                              </span>
                            </Show>
                          </div>
                          <p class="text-sm text-[var(--color-text-secondary)] mb-2">
                            by {mod.author} • v{mod.version}
                          </p>
                        </div>

                        <div class="flex items-center gap-4 text-sm">
                          <div class="flex items-center gap-1 text-[var(--color-accent-warning)]">
                            <Star size={16} fill="currentColor" />
                            <span class="font-medium">{mod.rating}</span>
                          </div>
                          <div class="text-[var(--color-text-secondary)]">
                            <Package size={16} class="inline mr-1" />
                            {formatBytes(mod.size)}
                          </div>
                        </div>
                      </div>

                      <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                        {mod.description}
                      </p>

                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                          <span>{mod.downloads.toLocaleString()} downloads</span>
                          <span>Updated {mod.lastUpdated}</span>
                          <span class="px-2 py-1 bg-[var(--color-background-tertiary)] rounded">
                            {categories.find((c) => c.id === mod.category)?.name}
                          </span>
                        </div>

                        <div class="flex items-center gap-2">
                          <Show
                            when={mod.installed}
                            fallback={
                              <Button
                                size="small"
                                variant="primary"
                                icon={<Download size={16} />}
                                onClick={() => handleInstallMod(mod.id)}
                              >
                                Install
                              </Button>
                            }
                          >
                            <Button
                              size="small"
                              variant={mod.enabled ? "success" : "secondary"}
                            >
                              {mod.enabled ? "Enabled" : "Disabled"}
                            </Button>
                          </Show>
                          <IconButton
                            size="small"
                            variant="ghost"
                            icon={<ExternalLink size={16} />}
                            aria-label="View on Thunderstore"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Motion.div>
          )}
        </For>
      </div>

      {/* Mod Detail Modal */}
      <Modal open={showModDetail()} onOpenChange={setShowModDetail}>
        <ModalContent size="large">
          <ModalHeader onClose={() => setShowModDetail(false)}>
            <div class="flex items-center gap-4">
              <div class="text-4xl">{selectedMod()?.thumbnail}</div>
              <div>
                <ModalTitle>{selectedMod()?.name}</ModalTitle>
                <ModalDescription>
                  by {selectedMod()?.author} • v{selectedMod()?.version}
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div class="space-y-6">
              {/* Stats */}
              <div class="grid grid-cols-4 gap-4">
                <div class="p-4 bg-[var(--color-background-tertiary)] rounded-lg">
                  <div class="flex items-center gap-2 text-[var(--color-accent-warning)] mb-2">
                    <Star size={16} fill="currentColor" />
                    <span class="text-2xl font-bold">{selectedMod()?.rating}</span>
                  </div>
                  <p class="text-xs text-[var(--color-text-secondary)]">Rating</p>
                </div>
                <div class="p-4 bg-[var(--color-background-tertiary)] rounded-lg">
                  <div class="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {((selectedMod()?.downloads || 0) / 1000).toFixed(1)}K
                  </div>
                  <p class="text-xs text-[var(--color-text-secondary)]">Downloads</p>
                </div>
                <div class="p-4 bg-[var(--color-background-tertiary)] rounded-lg">
                  <div class="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {formatBytes(selectedMod()?.size || 0)}
                  </div>
                  <p class="text-xs text-[var(--color-text-secondary)]">Size</p>
                </div>
                <div class="p-4 bg-[var(--color-background-tertiary)] rounded-lg">
                  <div class="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    v{selectedMod()?.version}
                  </div>
                  <p class="text-xs text-[var(--color-text-secondary)]">Version</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 class="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  About
                </h4>
                <p class="text-[var(--color-text-secondary)]">
                  {selectedMod()?.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h4 class="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  Features
                </h4>
                <ul class="space-y-2">
                  <For each={["Dynamic scaling", "Customizable config", "Multiplayer compatible"]}>
                    {(feature) => (
                      <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Check size={16} class="text-[var(--color-accent-success)]" />
                        {feature}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowModDetail(false)}>
              Close
            </Button>
            <Show
              when={!selectedMod()?.installed}
              fallback={
                <Button variant="success" disabled>
                  <Check size={16} /> Installed
                </Button>
              }
            >
              <Button
                variant="primary"
                icon={<Download size={16} />}
                onClick={() => {
                  handleInstallMod(selectedMod()?.id);
                  setShowModDetail(false);
                }}
              >
                Install Mod
              </Button>
            </Show>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Repository;