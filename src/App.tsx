import { Component, lazy, onMount } from "solid-js";
import { RouteSectionProps } from "@solidjs/router";
import { Sidebar } from "@components/layout/Sidebar";
import { Toaster } from "@components/common/Toast";
import { modStore, profileStore, settingsStore, uiStore } from "@stores/stores";

const App: Component<RouteSectionProps> = (props) => {
  onMount(async () => {
    // Load initial data
    await Promise.all([
      settingsStore.loadSettings(),
      modStore.loadMods(),
      profileStore.loadProfiles()
    ]);
  });

  return (
    <div class="flex h-screen overflow-hidden bg-[var(--color-background-primary)]">
      {/* Sidebar */}
      <Sidebar
        collapsed={uiStore.state.sidebarCollapsed}
        onToggle={uiStore.toggleSidebar}
      />

      {/* Main Content */}
      <main class="flex-1 overflow-y-auto">
        {props.children}
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default App;