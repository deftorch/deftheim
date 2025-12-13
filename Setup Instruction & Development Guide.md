# Valheim Mod Manager - Setup & Development Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **Rust** >= 1.85 (2024 Edition)
- **npm** >= 10.0.0
- **Git**

### Installation

1. **Clone or create the project:**
```bash
# If using setup.sh script
chmod +x setup.sh
./setup.sh

# Or manually create structure
mkdir valheim-mod-manager && cd valheim-mod-manager
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run tauri:dev
```

The application will open automatically and hot-reload on changes.

---

## 📁 Project Structure

```
valheim-mod-manager/
├── src/                      # Frontend (SolidJS + TypeScript)
│   ├── components/
│   │   ├── common/          # Button, Card, Input, Modal, Toast
│   │   └── layout/          # Sidebar, Header
│   ├── pages/               # Dashboard, Profiles, Repository, etc
│   ├── stores/              # State management (Solid Store)
│   ├── lib/
│   │   ├── api/            # Tauri API wrappers
│   │   ├── utils/          # Utilities (formatters, helpers)
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   ├── styles/
│   │   └── app.css         # Tailwind v4 configuration
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
│
├── src-tauri/               # Backend (Rust)
│   ├── src/
│   │   ├── commands/       # Tauri commands (API endpoints)
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data structures
│   │   ├── utils/          # Utility functions
│   │   ├── db/             # Database layer
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
│
└── tests/                   # Tests (unit, integration, e2e)
```

---

## 🎨 Available Components

### Common Components

All components are fully typed and support dark theme by default.

#### Button
```tsx
import { Button, IconButton } from "@components/common";

<Button variant="primary" size="default">
  Click Me
</Button>

<IconButton icon={<Settings />} aria-label="Settings" />
```

**Variants:** `primary`, `secondary`, `danger`, `ghost`, `success`  
**Sizes:** `small`, `default`, `large`

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/common";

<Card hover variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Input
```tsx
import { Input, SearchInput, Textarea } from "@components/common";

<Input 
  label="Username"
  placeholder="Enter username"
  error="Required field"
/>

<SearchInput onSearch={(value) => console.log(value)} />
```

#### Modal
```tsx
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@components/common";

const [open, setOpen] = createSignal(false);

<Modal open={open()} onOpenChange={setOpen}>
  <ModalContent>
    <ModalHeader onClose={() => setOpen(false)}>
      <ModalTitle>Dialog Title</ModalTitle>
    </ModalHeader>
  </ModalContent>
</Modal>
```

#### Toast Notifications
```tsx
import { toast } from "@components/common";

// Usage
toast.success("Operation successful!");
toast.error("Something went wrong", "Error details here");
toast.info("Information message");
toast.warning("Warning message");

// Don't forget to add <Toaster /> to your app
```

---

## 🗄️ State Management

The app uses **Solid Store** for reactive state management.

### Available Stores

#### Mod Store
```tsx
import { modStore } from "@stores";

// Access state
const mods = modStore.mods;
const installedMods = modStore.installedMods;
const loading = modStore.state.loading;

// Actions
await modStore.loadMods();
modStore.addMod(mod);
modStore.updateMod(id, updates);
modStore.removeMod(id);
```

#### Profile Store
```tsx
import { profileStore } from "@stores";

// Access state
const profiles = profileStore.profiles;
const activeProfile = profileStore.activeProfile;

// Actions
await profileStore.loadProfiles();
await profileStore.switchProfile(id);
profileStore.addProfile(profile);
```

#### Settings Store
```tsx
import { settingsStore } from "@stores";

// Access state
const settings = settingsStore.settings;

// Actions
await settingsStore.loadSettings();
settingsStore.updateSettings({ theme: "dark" });
await settingsStore.saveSettings();
```

#### UI Store
```tsx
import { uiStore } from "@stores";

// Toggle sidebar
uiStore.toggleSidebar();
uiStore.setSidebarCollapsed(true);
```

---

## 🔧 Tauri Commands

Backend commands are defined in `src-tauri/src/commands/`.

### Calling Tauri Commands

```tsx
import { tauriCommands } from "@lib/api/tauri";

// Mod operations
const mods = await tauriCommands.scanMods();
await tauriCommands.installMod(modId);
await tauriCommands.enableMod(modId);

// Profile operations
const profile = await tauriCommands.createProfile(profileData);
await tauriCommands.switchProfile(profileId);

// System operations
const path = await tauriCommands.detectValheimPath();
const hasBepInEx = await tauriCommands.checkBepinex();
await tauriCommands.launchValheim(profileId);
```

---

## 🎨 Styling with Tailwind v4

The project uses **Tailwind CSS v4** with CSS-based configuration.

### Design Tokens

All design tokens are defined in `src/styles/app.css`:

```css
@theme {
  --color-background-primary: oklch(0.098 0 0);
  --color-text-primary: oklch(1 0 0);
  --color-accent-primary: oklch(0.608 0.191 255.3);
  /* ... more tokens */
}
```

### Using Tokens

```tsx
<div class="bg-[var(--color-background-primary)] text-[var(--color-text-primary)]">
  Content
</div>
```

### Custom Utilities

```css
/* Card hover effect */
.card-hover {
  transition: transform var(--transition-normal), 
              box-shadow var(--transition-normal);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# E2E tests
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/           # Component & utility tests
├── integration/    # Feature integration tests
└── e2e/            # End-to-end Playwright tests
```

---

## 🏗️ Building

### Development Build

```bash
npm run tauri:dev
```

### Production Build

```bash
npm run tauri:build
```

Output will be in `src-tauri/target/release/`.

---

## 📝 Code Quality

### Linting

```bash
# Check for errors
npm run lint

# Auto-fix
npm run lint:fix
```

### Formatting

```bash
npm run format
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically:
- Run ESLint
- Format code with Prettier
- Check TypeScript compilation

---

## 🐛 Debugging

### Frontend Debugging

1. Open DevTools: `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
2. Use browser console for logs
3. Use React DevTools for component inspection

### Backend Debugging (Rust)

1. Set `RUST_LOG=debug` environment variable
2. Check logs in terminal
3. Use `tracing::debug!()` for detailed logging

### VSCode Debugging

Launch configurations are in `.vscode/launch.json`:

- **Debug Frontend**: Attach to Vite dev server
- **Debug Backend**: Attach to Rust process

---

## 📚 Additional Resources

### Documentation
- **SolidJS**: https://www.solidjs.com/docs/latest
- **Tauri**: https://v2.tauri.app/
- **Tailwind v4**: https://tailwindcss.com/docs
- **Motion**: https://motion.dev/

### Community
- **Discord**: [Join our Discord](#)
- **GitHub**: [Report issues](#)
- **Wiki**: [View documentation](#)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript/ESLint rules
- Use Prettier for formatting
- Write descriptive commit messages
- Add tests for new features

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎯 Current Implementation Status

### ✅ Completed
- ✅ Project structure & configuration
- ✅ Core UI components (Button, Card, Input, Modal, Toast)
- ✅ Layout components (Sidebar)
- ✅ State management (Stores)
- ✅ Dashboard page
- ✅ Placeholder pages
- ✅ Tailwind v4 design system
- ✅ Rust backend structure

### 🚧 In Progress
- 🚧 Tauri command implementation
- 🚧 Database schema & queries
- 🚧 Profile management features
- 🚧 Mod repository browser
- 🚧 Settings pages

### 📋 Planned
- 📋 Onboarding wizard
- 📋 Update system
- 📋 Backup & recovery
- 📋 Diagnostics tools
- 📋 Community features
- 📋 Testing suite

---

## 💡 Next Steps

1. **Implement Tauri Commands**: Add actual implementation to backend commands
2. **Database Setup**: Create SQLite schema and migrations
3. **Build Profile Management**: Implement full profile CRUD
4. **Add Mod Scanner**: Scan and parse mod files
5. **Create Settings UI**: Build settings pages
6. **Add Tests**: Write unit and E2E tests

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Documentation](#)
2. Search [GitHub Issues](#)
3. Ask in [Discord](#)
4. Create a new issue with:
   - OS & version
   - Node.js & Rust versions
   - Error messages
   - Steps to reproduce

---

**Happy Modding! 🎮⚔️**