import { Component, JSX, splitProps, Show, createUniqueId } from "solid-js";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: JSX.Element;
  fullWidth?: boolean;
}

export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "error",
    "helperText",
    "icon",
    "fullWidth",
    "class",
    "id"
  ]);

  const defaultId = createUniqueId();
  const inputId = () => local.id || `input-${defaultId}`;
  const helperId = `helper-${defaultId}`;
  const errorId = `error-${defaultId}`;

  return (
    <div class={`${local.fullWidth ? "w-full" : ""}`}>
      <Show when={local.label}>
        <label
          for={inputId()}
          class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          {local.label}
        </label>
      </Show>

      <div class="relative">
        <Show when={local.icon}>
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
            {local.icon}
          </div>
        </Show>

        <input
          {...others}
          id={inputId()}
          aria-invalid={!!local.error}
          aria-describedby={local.error ? errorId : local.helperText ? helperId : undefined}
          class={`
            w-full h-10 px-3
            ${local.icon ? "pl-10" : ""}
            bg-[var(--color-background-tertiary)]
            border border-[var(--color-border-default)]
            rounded-lg
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            transition-all duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--color-accent-primary)]
            focus:border-transparent
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${local.error ? "border-[var(--color-accent-error)] focus:ring-[var(--color-accent-error)]" : ""}
            ${local.class || ""}
          `}
        />
      </div>

      <Show when={local.error}>
        <p
          id={errorId}
          class="mt-2 text-sm text-[var(--color-accent-error)]"
          role="alert"
        >
          {local.error}
        </p>
      </Show>

      <Show when={!local.error && local.helperText}>
        <p
          id={helperId}
          class="mt-2 text-sm text-[var(--color-text-secondary)]"
        >
          {local.helperText}
        </p>
      </Show>
    </div>
  );
};

interface SearchInputProps extends Omit<InputProps, "icon"> {
  onSearch?: (value: string) => void;
}

export const SearchInput: Component<SearchInputProps> = (props) => {
  const [local, others] = splitProps(props, ["onSearch", "placeholder"]);

  let inputRef: HTMLInputElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputRef) {
      local.onSearch?.(inputRef.value);
    }
  };

  return (
    <Input
      {...others}
      ref={inputRef}
      type="search"
      placeholder={local.placeholder || "Search..."}
      icon={
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      onKeyDown={handleKeyDown}
    />
  );
};

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "error",
    "helperText",
    "fullWidth",
    "class",
    "id"
  ]);

  const defaultId = createUniqueId();
  const textareaId = () => local.id || `textarea-${defaultId}`;
  const helperId = `helper-${defaultId}`;
  const errorId = `error-${defaultId}`;

  return (
    <div class={`${local.fullWidth ? "w-full" : ""}`}>
      <Show when={local.label}>
        <label
          for={textareaId()}
          class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          {local.label}
        </label>
      </Show>

      <textarea
        {...others}
        id={textareaId()}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? errorId : local.helperText ? helperId : undefined}
        class={`
          w-full px-3 py-2
          bg-[var(--color-background-tertiary)]
          border border-[var(--color-border-default)]
          rounded-lg
          text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-tertiary)]
          transition-all duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-[var(--color-accent-primary)]
          focus:border-transparent
          disabled:opacity-50
          disabled:cursor-not-allowed
          resize-none
          ${local.error ? "border-[var(--color-accent-error)] focus:ring-[var(--color-accent-error)]" : ""}
          ${local.class || ""}
        `}
      />

      <Show when={local.error}>
        <p
          id={errorId}
          class="mt-2 text-sm text-[var(--color-accent-error)]"
          role="alert"
        >
          {local.error}
        </p>
      </Show>

      <Show when={!local.error && local.helperText}>
        <p
          id={helperId}
          class="mt-2 text-sm text-[var(--color-text-secondary)]"
        >
          {local.helperText}
        </p>
      </Show>
    </div>
  );
};
