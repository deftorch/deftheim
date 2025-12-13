import { Component } from "solid-js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/common/Card";
import { Button } from "@components/common/Button";
import { Construction } from "lucide-solid";

// Generic placeholder component
const PagePlaceholder: Component<{ title: string; description: string }> = (props) => {
  return (
    <div class="p-6 h-full flex items-center justify-center">
      <Card variant="elevated" class="max-w-2xl w-full">
        <CardContent class="text-center py-12">
          <div class="mb-6 flex justify-center">
            <div class="w-20 h-20 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center">
              <Construction size={40} class="text-[var(--color-text-secondary)]" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {props.title}
          </h2>
          <p class="text-[var(--color-text-secondary)] mb-6">
            {props.description}
          </p>
          <div class="space-y-4 text-left bg-[var(--color-background-tertiary)] p-6 rounded-lg">
            <h3 class="font-semibold text-[var(--color-text-primary)]">
              Coming Soon:
            </h3>
            <ul class="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>✓ Full feature implementation</li>
              <li>✓ Beautiful UI with animations</li>
              <li>✓ Real-time updates</li>
              <li>✓ Seamless integration</li>
            </ul>
          </div>
          <Button variant="primary" class="mt-6">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// PROFILES PAGE
// ============================================================================
const Profiles: Component = () => {
  return (
    <PagePlaceholder
      title="Profile Management"
      description="Create, edit, and switch between different mod configurations. This page will include profile grid, creation wizard, and management tools."
    />
  );
};

export default Profiles;

// ============================================================================
// REPOSITORY PAGE
// ============================================================================
export const Repository: Component = () => {
  return (
    <PagePlaceholder
      title="Mod Repository"
      description="Browse, search, and manage your mod collection. Features include local mods, online browser, and download manager."
    />
  );
};

// ============================================================================
// SETTINGS PAGE
// ============================================================================
export const Settings: Component = () => {
  return (
    <PagePlaceholder
      title="Settings"
      description="Configure application settings, paths, updates, performance, and advanced options."
    />
  );
};

// ============================================================================
// UPDATES PAGE
// ============================================================================
export const Updates: Component = () => {
  return (
    <PagePlaceholder
      title="Updates Center"
      description="Check for mod updates, view changelogs, and manage automatic updates. Keep your mods up-to-date with one click."
    />
  );
};

// ============================================================================
// BACKUP PAGE
// ============================================================================
export const Backup: Component = () => {
  return (
    <PagePlaceholder
      title="Backup & Recovery"
      description="Manage backups, create restore points, and recover from issues. Never lose your configurations."
    />
  );
};

// ============================================================================
// DIAGNOSTICS PAGE
// ============================================================================
export const Diagnostics: Component = () => {
  return (
    <PagePlaceholder
      title="Diagnostics"
      description="System health checks, troubleshooting tools, and diagnostic reports. Ensure everything is working correctly."
    />
  );
};