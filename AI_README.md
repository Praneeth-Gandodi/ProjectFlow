# ProjectFlow Technical README for AI Assistants

## 1. Project Overview

**Project Name**: ProjectFlow
**Description**: A single-user, browser-based project management and idea-tracking application. It uses the browser's `localStorage` for all data persistence, meaning there is no backend database. The application is built as a Single Page Application (SPA) experience using Next.js with the App Router.

## 2. Core Technologies & Libraries

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS with `tailwindcss-animate`.
- **UI Components**: `shadcn/ui`. Component primitives are from Radix UI.
  - **Location**: Base components are in `src/components/ui/` and application-specific components are in `src/components/`.
- **Icons**: `lucide-react`.
- **State Management**:
  - **Local State**: `useState`, `useReducer`.
  - **Shared State (Cross-Component)**: React Context (`src/context/`).
  - **Persistent State**: A custom hook, `useLocalStorage` (`src/hooks/use-local-storage.ts`), is used to persist all user data in the browser's `localStorage`. This is the primary data persistence mechanism.
- **Forms**: `react-hook-form` for form state management and `zod` for schema validation.
- **Drag & Drop**: `react-dnd` with `react-dnd-html5-backend` is used for reordering projects.
- **Data Parsing**: `papaparse` is used for exporting data to CSV format.
- **Linting & Formatting**: Standard Next.js configuration with ESLint and TypeScript.

## 3. Key Architectural Patterns

### Data Persistence (`useLocalStorage`)

- **CRITICAL**: The entire application state (projects, links, user profile, etc.) is persisted in the browser's `localStorage`.
- The `useLocalStorage` hook (`src/hooks/use-local-storage.ts`) is the **single source of truth** for reading and writing persistent data.
- The hook returns `[value, setValue, isLoaded]`. The `isLoaded` boolean is crucial for preventing hydration errors and race conditions. Components must wait for `isLoaded` to be `true` before attempting to render data-dependent UI.
- Initial data for new users is sourced from `src/app/data.ts`.

### Global State (React Context)

- **`ProfileProvider` (`src/context/profile-context.tsx`)**: Manages user profile information (name, avatar, github) and UI preferences (font, layout). This context uses `useLocalStorage` internally.
- **`PinProvider` (`src/context/pin-context.tsx`)**: Manages the application's PIN lock state, including the PIN itself, lock status, and unlock attempts. This also uses `useLocalStorage`.

### Routing (Next.js App Router)

- **`src/app/layout.tsx`**: The root layout. It wraps the entire application and includes global context providers (`PinProvider`, `ProfileProvider`) and the `Toaster` for notifications.
- **`src/app/page.tsx`**: The main dashboard page. This is a client component (`'use client'`) that fetches all data via `useLocalStorage` and renders the project tabs and stats.
- **`src/app/project/[id]/page.tsx`**: A dynamic route for displaying and editing a single project.
  - The `[id]` segment in the URL corresponds to the `project.id`.
  - This page fetches all projects from `localStorage` and then finds the specific project by its `id`.

## 4. Data Structures (`src/app/types.ts`)

- **`Project`**: The core data model.
  - `id`: Unique string identifier.
  - `title`, `description`: string.
  - `requirements`: An array of objects: `{ id: string; text: string; completed: boolean; }`.
  - `links`: An array of `Link` objects.
  - `notes`: An array of `Note` objects.
  - `progress`: number (0-100).
  - `tags`: `string[]`.
- **`Link`**: `{ id?: string; title: string; url: string; description?: string; }`
- **`Note`**: `{ id: string; date: string; content: string; }`
- **`Requirement`**: `{ id: string; text: string; completed: boolean; }`

## 5. File-by-File Breakdown for Editing

- **To change the main dashboard UI**:
  - Edit **`src/app/page.tsx`**. This file controls the layout of the dashboard, including the stats and tabs.

- **To change the project detail page UI**:
  - Edit **`src/app/project/[id]/page.tsx`**. This file controls the display and editing functionality for a single project.

- **To change the application's color scheme or global styles**:
  - Edit **`src/app/globals.css`**. Modify the HSL CSS variables within the `:root` and `.dark` blocks.

- **To add/modify properties on a `Project` or other data model**:
  1.  Update the interface in **`src/app/types.ts`**.
  2.  Update the components that use this data, primarily:
      - **`src/app/project/[id]/page.tsx`** (detail view).
      - **`src/components/project-card.tsx`** (card view on dashboard).
      - **`src/components/project-form.tsx`** (add/edit modal).
  3.  Update the initial data in **`src/app/data.ts`** to reflect the new structure.

- **To change the Header (logo, search, profile menu)**:
  - Edit **`src/components/app-header.tsx`**.
  - The profile dropdown logic is in **`src/components/profile-menu.tsx`**.

- **To change the "Add/Edit Project" modal form**:
  - Edit **`src/components/project-form.tsx`**. This includes form fields, tabs, and submission logic.

- **To change the "Add/Edit Link" modal form**:
  - Edit **`src/components/link-form.tsx`**.

- **To modify the application's fonts**:
  1.  Add/change font links in **`src/app/layout.tsx`**.
  2.  Update the font families in **`tailwind.config.ts`**.

- **To modify the PIN lock screen**:
  - Edit **`src/components/app-lock.tsx`**.

## 6. Common Tasks

- **Adding a new component**: Create a new `.tsx` file in `src/components/` and import it where needed. For UI primitives, use `shadcn/ui` components from `src/components/ui/`.
- **Handling User Interactions**: Most interactions are handled within the components themselves (e.g., `onClick` handlers). State changes that need to persist are propagated up to the page component (`page.tsx`) and saved using the `set...` function from a `useLocalStorage` hook.
- **Fixing a Data-Related Bug**: The first place to investigate is the `useLocalStorage` hook usage in the relevant component. Ensure `isLoaded` is correctly handled. Check `src/app/types.ts` for data structure mismatches.
- **Changing Theme Colors**: All theme colors are defined as CSS variables in `src/app/globals.css`. Adjusting these HSL values is the correct way to theme the application.
