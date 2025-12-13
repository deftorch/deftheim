import { Component, JSX, splitProps } from "solid-js";
import { Motion } from "@components/common/Motion";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "small" | "default" | "large";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: JSX.Element;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-accent-primary)] hover:bg-[oklch(0.558_0.191_255.3)] text-white",
  secondary: "bg-[var(--color-background-tertiary)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]",
  danger: "bg-[var(--color-accent-error)] hover:bg-[oklch(0.558_0.238_27.3)] text-white",
  ghost: "bg-transparent hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]",
  success: "bg-[var(--color-accent-success)] hover:bg-[oklch(0.609_0.176_158.7)] text-white"
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-8 px-3 text-sm",
  default: "h-10 px-4 text-base",
  large: "h-12 px-6 text-lg"
};

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "variant",
    "size",
    "loading",
    "icon",
    "fullWidth",
    "children",
    "disabled",
    "class"
  ]);

  const variant = () => local.variant || "primary";
  const size = () => local.size || "default";
  const isDisabled = () => local.disabled || local.loading;

  return (
    <Motion.button
      {...others}
      disabled={isDisabled()}
      class={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2
        focus:ring-offset-[var(--color-background-primary)]
        ${variantClasses[variant()]}
        ${sizeClasses[size()]}
        ${local.fullWidth ? "w-full" : ""}
        ${local.class || ""}
      `}
      animate={{
        scale: isDisabled() ? 1 : undefined
      }}
      whileHover={{
        scale: isDisabled() ? 1 : 1.02
      }}
      whileTap={{
        scale: isDisabled() ? 1 : 0.98
      }}
    >
      {local.loading && (
        <svg
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {local.icon && !local.loading && local.icon}
      {local.children}
    </Motion.button>
  );
};

// Icon Button variant
interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
  "aria-label": string;
}

export const IconButton: Component<IconButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["icon", "variant", "size", "class"]);

  const variant = () => local.variant || "ghost";
  const size = () => local.size || "default";

  const sizeMap = {
    small: "h-8 w-8",
    default: "h-10 w-10",
    large: "h-12 w-12"
  };

  return (
    <Motion.button
      {...others}
      class={`
        inline-flex items-center justify-center
        rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2
        focus:ring-offset-[var(--color-background-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant()]}
        ${sizeMap[size()]}
        ${local.class || ""}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {local.icon}
    </Motion.button>
  );
};