import { Component, For, JSX, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { Motion } from "motion/solid";
import {
  Home,
  Package,
  Library,
  Settings,
  User,
  Download,
  RefreshCw,
  Shield,
  Heart
} from "lucide-solid";

interface NavItem {
  name: string;
  path: string;
  icon: Component;
  badge?: number;
}

const navigationItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Profiles", path: "/profiles", icon: Package },
  { name: "Repository", path: "/repository", icon: Library },
  { name: "Updates", path: "/updates", icon: RefreshCw },
  { name: "Backup", path: "/backup", icon: Shield },
  { name: "Diagnostics", path: "/diagnostics", icon: Heart },
  { name: "Settings", path: "/settings", icon: Settings }
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: Component<SidebarProps> = (props) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Motion.aside
      class={`
        flex flex-col
        h-full
        bg-[var(--color-background-secondary)]
        border-r border-[var(--color-border-subtle)]
        transition-all duration-300
        ${props.collapsed ? "w-16" : "w-64"}
      `}
      animate={{
        width: props.collapsed ? "4rem" : "16rem"
      }}
    >
      {/* Logo */}
      <div class="flex items-center h-16 px-4 border-b border-[var(--color-border-subtle)]">
        <Show
          when={!props.collapsed}
          fallback={
            <div class="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
              <span class="text-white font-bold text-sm">V</span>
            </div>
          }
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
              <span class="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h1 class="text-sm font-bold text-[var(--color-text-primary)]">
                Valheim
              </h1>
              <p class="text-xs text-[var(--color-text-tertiary)]">
                Mod Manager
              </p>
            </div>
          </div>
        </Show>
      </div>

      {/* Navigation */}
      <nav class="flex-1 p-2 overflow-y-auto">
        <ul class="space-y-1">
          <For each={navigationItems}>
            {(item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li>
                  <A
                    href={item.path}
                    class={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors duration-200
                      ${
                        active
                          ? "bg-[var(--color-accent-primary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]"
                      }
                    `}
                    activeClass="bg-[var(--color-accent-primary)] text-white"
                  >
                    <Icon size={20} class="flex-shrink-0" />
                    <Show when={!props.collapsed}>
                      <span class="flex-1 text-sm font-medium">
                        {item.name}
                      </span>
                      <Show when={item.badge}>
                        <span
                          class={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-[var(--color-accent-primary)] text-white"
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      </Show>
                    </Show>
                  </A>
                </li>
              );
            }}
          </For>
        </ul>
      </nav>

      {/* Footer */}
      <div class="p-4 border-t border-[var(--color-border-subtle)]">
        <Show
          when={!props.collapsed}
          fallback={
            <button
              class="w-full p-2 rounded-lg hover:bg-[var(--color-background-tertiary)] transition-colors"
              title="User"
            >
              <User size={20} class="text-[var(--color-text-secondary)]" />
            </button>
          }
        >
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-background-tertiary)] transition-colors cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-[var(--color-accent-secondary)] flex items-center justify-center">
              <User size={16} class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--color-text-primary)] truncate">
                Viking User
              </p>
              <p class="text-xs text-[var(--color-text-tertiary)] truncate">
                v2.0.0
              </p>
            </div>
          </div>
        </Show>
      </div>
    </Motion.aside>
  );
};