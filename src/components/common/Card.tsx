import { Component, JSX, splitProps } from "solid-js";
import { Motion } from "@components/common/Motion";

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "small" | "default" | "large";
  variant?: "default" | "elevated" | "outlined";
}

const paddingClasses = {
  none: "p-0",
  small: "p-4",
  default: "p-6",
  large: "p-8"
};

const variantClasses = {
  default: "bg-[var(--color-background-secondary)] border border-[var(--color-border-subtle)]",
  elevated: "bg-[var(--color-surface-elevated)] shadow-md",
  outlined: "bg-transparent border-2 border-[var(--color-border-default)]"
};

export const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, ["hover", "padding", "variant", "class", "children"]);

  const padding = () => local.padding || "default";
  const variant = () => local.variant || "default";

  return (
    <Motion.div
      {...others}
      class={`
        rounded-xl
        transition-all duration-200
        ${variantClasses[variant()]}
        ${paddingClasses[padding()]}
        ${local.hover ? "card-hover cursor-pointer" : ""}
        ${local.class || ""}
      `}
      whileHover={local.hover ? { y: -4 } : undefined}
    >
      {local.children}
    </Motion.div>
  );
};

export const CardHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      {...others}
      class={`flex items-center justify-between mb-4 ${local.class || ""}`}
    >
      {local.children}
    </div>
  );
};

export const CardTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <h3
      {...others}
      class={`text-xl font-semibold text-[var(--color-text-primary)] ${local.class || ""}`}
    >
      {local.children}
    </h3>
  );
};

export const CardDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <p
      {...others}
      class={`text-sm text-[var(--color-text-secondary)] ${local.class || ""}`}
    >
      {local.children}
    </p>
  );
};

export const CardContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div {...others} class={local.class}>
      {local.children}
    </div>
  );
};

export const CardFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      {...others}
      class={`flex items-center gap-2 mt-6 pt-4 border-t border-[var(--color-border-subtle)] ${local.class || ""}`}
    >
      {local.children}
    </div>
  );
};