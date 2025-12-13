import { Component, For, createSignal, Show } from "solid-js";
import { Motion, Presence } from "@components/common/Motion";
import { Portal } from "solid-js/web";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-solid";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const [toasts, setToasts] = createSignal<Toast[]>([]);

export const toast = {
  success: (title: string, description?: string, duration = 5000) => {
    addToast({ type: "success", title, description, duration });
  },
  error: (title: string, description?: string, duration = 5000) => {
    addToast({ type: "error", title, description, duration });
  },
  info: (title: string, description?: string, duration = 5000) => {
    addToast({ type: "info", title, description, duration });
  },
  warning: (title: string, description?: string, duration = 5000) => {
    addToast({ type: "warning", title, description, duration });
  },
  custom: (toast: Omit<Toast, "id">) => {
    addToast(toast);
  }
};

function addToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { ...toast, id };

  setToasts((prev) => [...prev, newToast]);

  if (toast.duration !== Infinity) {
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }
}

function removeToast(id: string) {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}

const typeConfig: Record<ToastType, { icon: Component; color: string; bg: string }> = {
  success: {
    icon: CheckCircle,
    color: "text-[var(--color-accent-success)]",
    bg: "bg-[var(--color-accent-success)]/10"
  },
  error: {
    icon: AlertCircle,
    color: "text-[var(--color-accent-error)]",
    bg: "bg-[var(--color-accent-error)]/10"
  },
  info: {
    icon: Info,
    color: "text-[var(--color-accent-primary)]",
    bg: "bg-[var(--color-accent-primary)]/10"
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[var(--color-accent-warning)]",
    bg: "bg-[var(--color-accent-warning)]/10"
  }
};

const ToastItem: Component<{ toast: Toast }> = (props) => {
  const config = () => typeConfig[props.toast.type];
  const Icon = () => config().icon as any;

  return (
    <Motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      class={`
        flex items-start gap-3 p-4 min-w-[320px] max-w-md
        bg-[var(--color-background-secondary)]
        border border-[var(--color-border-default)]
        rounded-lg shadow-lg
        ${config().bg}
      `}
    >
      <div class={`flex-shrink-0 ${config().color}`}>
        {/* @ts-ignore */}
        <Icon size={20} />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-[var(--color-text-primary)]">
          {props.toast.title}
        </p>
        <Show when={props.toast.description}>
          <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
            {props.toast.description}
          </p>
        </Show>
        <Show when={props.toast.action}>
          <button
            onClick={props.toast.action!.onClick}
            class="mt-2 text-sm font-medium text-[var(--color-accent-primary)] hover:underline"
          >
            {props.toast.action!.label}
          </button>
        </Show>
      </div>

      <button
        onClick={() => removeToast(props.toast.id)}
        class="
          flex-shrink-0 p-1 rounded
          text-[var(--color-text-tertiary)]
          hover:text-[var(--color-text-primary)]
          hover:bg-[var(--color-background-tertiary)]
          transition-colors
        "
      >
        {/* @ts-ignore */}
        <X size={16} />
      </button>
    </Motion.div>
  );
};

export const Toaster: Component = () => {
  return (
    <Portal>
      <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <Presence>
          <For each={toasts()}>
            {(toast) => <ToastItem toast={toast} />}
          </For>
        </Presence>
      </div>
    </Portal>
  );
};