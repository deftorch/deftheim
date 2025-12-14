import { createStore } from "solid-js/store";

interface UIState {
  sidebarCollapsed: boolean;
  currentPage: string;
}

const [uiState, setUIState] = createStore<UIState>({
  sidebarCollapsed: false,
  currentPage: "/"
});

export const uiStore = {
  get state() {
    return uiState;
  },

  toggleSidebar() {
    setUIState("sidebarCollapsed", (collapsed) => !collapsed);
  },

  setSidebarCollapsed(collapsed: boolean) {
    setUIState("sidebarCollapsed", collapsed);
  },

  setCurrentPage(page: string) {
    setUIState("currentPage", page);
  }
};
