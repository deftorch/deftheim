import { Component, For, JSX, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { Motion } from "@components/common/Motion";
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
        overflow-hidden whitespace-nowrap z-20
      `}
      animate={{
        width: props.collapsed ? "4rem" : "16rem"
      }}
      transition={{ duration: 0.3, easing: "ease-in-out" }}
    >
      {/* Logo */}
      <div class="flex items-center h-16 px-4 border-b border-[var(--color-border-subtle)]">
        <div class="w-8 h-8 flex-shrink-0 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
          <span class="text-white font-bold text-sm">V</span>
        </div>

        <Motion.div
          animate={{ opacity: props.collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          class="ml-3 overflow-hidden"
        >
          <h1 class="text-sm font-bold text-[var(--color-text-primary)]">
            Valheim
          </h1>
          <p class="text-xs text-[var(--color-text-tertiary)]">
            Mod Manager
          </p>
        </Motion.div>
      </div>

      {/* Navigation */}
      <nav class="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        <ul class="space-y-1">
          <For each={navigationItems}>
            {(item) => {
              const Icon = item.icon as any;
              const active = isActive(item.path);

              return (
                <li>
                  <A
                    href={item.path}
                    title={props.collapsed ? item.name : undefined}
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
                    {/* @ts-ignore */}
                    <div class="flex-shrink-0">
                      <Icon size={20} />
                    </div>

                    <Motion.span
                      animate={{ opacity: props.collapsed ? 0 : 1, x: props.collapsed ? -10 : 0 }}
                      class="ml-3 flex-1 text-sm font-medium overflow-hidden text-ellipsis"
                    >
                      {item.name}
                    </Motion.span>

                    <Show when={item.badge && !props.collapsed}>
                      <Motion.span
                        animate={{ opacity: props.collapsed ? 0 : 1 }}
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
                      </Motion.span>
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
        <div class={`flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-background-tertiary)] transition-colors cursor-pointer ${props.collapsed ? "justify-center" : ""}`}>
          <div class="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--color-accent-secondary)] flex items-center justify-center">
            {/* @ts-ignore */}
            <User size={16} class="text-white" />
          </div>

          <Motion.div
             animate={{ opacity: props.collapsed ? 0 : 1 }}
             transition={{ duration: 0.2 }}
             class="flex-1 min-w-0 overflow-hidden"
          >
            <p class="text-sm font-medium text-[var(--color-text-primary)] truncate">
              Viking User
            </p>
            <p class="text-xs text-[var(--color-text-tertiary)] truncate">
              v2.0.0
            </p>
          </Motion.div>
        </div>
      </div>
    </Motion.aside>
  );
};
