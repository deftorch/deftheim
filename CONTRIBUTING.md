# Contributing to Deftheim

Thank you for your interest in contributing to Deftheim! We welcome all types of contributions, from bug fixes and new features to documentation improvements.

## Code of Conduct

Please be respectful and considerate of others. We strive to create a welcoming and inclusive community.

## Getting Started

1.  **Fork the Repository**: Click the "Fork" button on the GitHub page.
2.  **Clone Your Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/deftheim.git
    cd deftheim
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Run Development Server**:
    ```bash
    npm run tauri dev
    ```

## Project Structure

-   `src/`: SolidJS frontend code.
    -   `stores/`: State management (Mod, Profile, Settings).
    -   `types/`: Shared TypeScript interfaces.
-   `src-tauri/`: Rust backend code.
    -   `src/commands/`: IPC command handlers.
    -   `src/models/`: Rust structs matching frontend types.
    -   `src/db/`: Database schema and migrations.

## Development Guidelines

### Code Style

-   **Frontend**: We use Prettier and ESLint. Ensure your code is formatted before committing.
-   **Backend**: We use `rustfmt` and `clippy`. Run `cargo fmt` and `cargo clippy` before committing.

### Type Safety

-   Avoid using `any` in TypeScript. Use strict types defined in `src/types/index.ts`.
-   Ensure Rust structs derive `TS` (from `ts-rs`) where applicable to maintain type synchronization.

### Security

-   Do not introduce new dependencies without vetting them.
-   Ensure all file system operations are strictly scoped.
-   Validate all inputs from the frontend in the backend commands.

## Submitting a Pull Request

1.  Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  Commit your changes with descriptive messages.
3.  Push your branch to your fork.
4.  Open a Pull Request against the `main` branch of the original repository.
5.  Provide a clear description of your changes and any relevant context.

## Reporting Bugs

If you encounter a bug, please open an issue on GitHub with the following details:

-   OS and version.
-   Deftheim version.
-   Steps to reproduce.
-   Expected vs. actual behavior.
-   Screenshots (if applicable).

Thank you for helping make Deftheim better!
