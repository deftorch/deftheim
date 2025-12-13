import { Component, lazy, onMount } from "solid-js";
import { Route, Routes } from "@solidjs/router";
import { Sidebar } from "@components/layout/Sidebar";
import { Toaster } from "@components/common/Toast";
import { modStore, profileStore, settingsStore, uiStore } from "@stores";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profiles = lazy(() => import("@/pages/Profiles"));
const Repository = lazy(() => import("@/pages/Repository"));
const Settings = lazy(() => import("@/pages/Settings"));
const Updates = lazy(() => import("@/pages/Updates"));
const Backup = lazy(() => import("@/pages/Backup"));
const Diagnostics = lazy(() => import("@/pages/Diagnostics"));

const App: Component = () => {
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
        <Routes>
          <Route path="/" component={Dashboard} />
          <Route path="/profiles" component={Profiles} />
          <Route path="/repository" component={Repository} />
          <Route path="/updates" component={Updates} />
          <Route path="/backup" component={Backup} />
          <Route path="/diagnostics" component={Diagnostics} />
          <Route path="/settings" component={Settings} />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default App;