# AGENTS.md

## Project Overview

Monorepo for `@gzim/svelte-datagrid` — a high-performance, accessible data grid component for Svelte 4 with virtual scrolling, column reordering/resizing, and built-in cell editors.

## Repository Structure

```
/
├── packages/
│   ├── svelte-datagrid/   # Core library (@gzim/svelte-datagrid)
│   └── eslint-config/     # Shared ESLint config (@mycustom/eslint-config)
├── apps/
│   └── website/           # SvelteKit static demo site (Tailwind CSS)
├── .changeset/            # Changesets version management
└── .github/workflows/     # CI (lint + test) and CD (publish + deploy)
```

## Tech Stack

- **Svelte 4** (peer deps: svelte ^3.1.0 || ^4.0.0)
- **SvelteKit** for both library packaging and website
- **TypeScript** with strict mode
- **pnpm** workspaces + **Turborepo** for monorepo orchestration
- **Vitest** + **@testing-library/svelte** for unit tests (jsdom)
- **Changesets** for versioning and npm publishing
- **Prettier** (tabs, single quotes, no trailing commas, 100 print width)
- **ESLint** with TypeScript + Svelte + Prettier plugins

## Commands

Run from the repository root:

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `pnpm install`     | Install all dependencies                         |
| `pnpm dev`         | Start dev servers (library + website)             |
| `pnpm build`       | Build all packages                               |
| `pnpm test`        | Run unit tests                                   |
| `pnpm test:watch`  | Run tests in watch mode                          |
| `pnpm test:ui`     | Run tests with Vitest UI                         |
| `pnpm lint`        | Run ESLint + Prettier checks                     |
| `pnpm format`      | Auto-format with Prettier                        |
| `pnpm package`     | Build library dist + copy README                 |
| `pnpm release`     | Publish via Changesets                           |

## Key Source Files (Library)

```
packages/svelte-datagrid/src/lib/
├── index.ts                          # Public exports
├── types.ts                          # GridColumn<T>, GridCellUpdated<T>, GridRow<T>
├── DataGridProps.ts                  # CSS custom properties interface (GridProps)
├── configurations.ts                 # Constants: MIN_ROW_HEIGHT=20, MAX_DEFAULT_ROWS_PER_PAGE=10
├── components/
│   ├── Datagrid.svelte               # Main component (virtual scrolling, events, ARIA)
│   ├── TextboxCell.svelte            # Debounced text input cell editor
│   ├── SelectCell.svelte             # Dropdown select cell editor
│   ├── CheckboxCell.svelte           # Checkbox boolean cell editor
│   └── Datagrid.test.ts              # Component tests
├── actions/
│   ├── dragAndDrop.ts                # Column drag-and-drop reordering action
│   └── resizeColumn.ts               # Column resize action
└── functions/
    ├── calculateFunctions.ts         # Math helpers for grid calculations
    ├── calculateFunctions.test.ts    # Calculation tests
    ├── gridHelpers.ts                # Grid manipulation utilities
    └── gridHelpers.test.ts           # Grid helper tests
```

## Code Patterns

- **Svelte 4 syntax** — reactive `$:` statements, `createEventDispatcher`, `setContext`/`getContext`, `beforeUpdate` hooks
- **Generics** — components and types use `<T>` for row data typing
- **Custom Svelte actions** — `use:dragAndDrop`, `use:reziseColumn` for DOM interactions
- **Virtual scrolling** — only visible rows are rendered, calculated via `getVisibleRowsIndexes()`
- **Context API** — `activeRow` state shared via `writable` store in context

## Library Public API

**Components:** `Datagrid`, `TextboxCell`, `SelectCell`, `CheckboxCell`
**Functions:** `getGridState()`, `scrollToRow(rowIndex, behavior?)`
**Types:** `GridColumn<T>`, `GridCellUpdated<T>`, `GridRow<T>`, `GridProps`

**Events emitted by Datagrid:**
- `scroll` / `xScroll` — scrolling
- `valueUpdated` — cell edits
- `columnsSwapped` — column reorder
- `rowClick` / `rowDblClick` — row interactions

## Testing

Tests live alongside source files (`*.test.ts`). Uses Vitest with jsdom environment and `@testing-library/svelte`. No e2e tests.

Run: `pnpm test` (root) or `pnpm --filter @gzim/svelte-datagrid test`

## CI/CD

- **CI** (`ci.yml`): Runs lint + tests on PRs to `main`
- **CD** (`cd.yml`): On push to `main`/`next` — builds library, publishes to npm via Changesets, deploys website to GitHub Pages

## Conventions

- Use **tabs** for indentation
- **Single quotes**, no trailing commas, 100 char print width
- PR template requires: descriptive title, lint pass, test pass
- Version bumps managed via `pnpm changeset`
