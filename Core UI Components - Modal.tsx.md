import { Component, JSX, Show, createEffect, splitProps } from "solid-js";
import { Motion, Presence } from "motion/solid";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
}

export const Modal: Component<ModalProps> = (props) => {
  let backdropRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === backdropRef) {
      props.onOpenChange(false);
    }
  };

  return (
    <Portal>
      <Presence>
        <Show when={props.open}>
          <Motion.div
            ref={backdropRef}
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          >
            <Motion.div
              class="relative max-h-[90vh] overflow-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              {props.children}
            </Motion.div>
          </Motion.div>
        </Show>
      </Presence>
    </Portal>
  );
};

interface ModalContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "default" | "large" | "full";
}

const sizeClasses = {
  small: "max-w-md",
  default: "max-w-2xl",
  large: "max-w-4xl",
  full: "max-w-7xl"
};

export const ModalContent: Component<ModalContentProps> = (props) => {
  const [local, others] = splitProps(props, ["size", "class", "children"]);

  const size = () => local.size || "default";

  return (
    <div
      {...others}
      class={`
        w-full
        bg-[var(--color-background-secondary)]
        rounded-xl
        shadow-lg
        ${sizeClasses[size()]}
        ${local.class || ""}
      `}
    >
      {local.children}
    </div>
  );
};

interface ModalHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const ModalHeader: Component<ModalHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ["onClose", "class", "children"]);

  return (
    <div
      {...others}
      class={`
        flex items-center justify-between
        p-6 pb-4
        border-b border-[var(--color-border-subtle)]
        ${local.class || ""}
      `}
    >
      <div class="flex-1">{local.children}</div>
      <Show when={local.onClose}>
        <button
          onClick={local.onClose}
          class="
            ml-4 p-1 rounded-lg
            text-[var(--color-text-tertiary)]
            hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-background-tertiary)]
            transition-colors
          "
        >
          <X size={20} />
        </button>
      </Show>
    </div>
  );
};

export const ModalTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <h2
      {...others}
      class={`text-2xl font-semibold text-[var(--color-text-primary)] ${local.class || ""}`}
    >
      {local.children}
    </h2>
  );
};

export const ModalDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <p
      {...others}
      class={`mt-1 text-sm text-[var(--color-text-secondary)] ${local.class || ""}`}
    >
      {local.children}
    </p>
  );
};

export const ModalBody: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div {...others} class={`p-6 ${local.class || ""}`}>
      {local.children}
    </div>
  );
};

export const ModalFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <div
      {...others}
      class={`
        flex items-center justify-end gap-2
        p-6 pt-4
        border-t border-[var(--color-border-subtle)]
        ${local.class || ""}
      `}
    >
      {local.children}
    </div>
  );
};