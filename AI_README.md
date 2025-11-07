# ProjectFlow Technical README for AI Assistants

## 1. Project Overview

**Project Name**: ProjectFlow
**Description**: A single-user, browser-based project management, idea tracking, and learning dashboard. It uses the browser's `localStorage` for all data persistence. The application is built as a Single Page Application (SPA) experience using Next.js with the App Router.

## 2. Core Technologies & Libraries

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS with `tailwindcss-animate`.
- **UI Components**: `shadcn/ui`. Located in `src/components/ui/`.
- **Icons**: `lucide-react`.
- **State Management**:
  - **Local State**: `useState`, `useReducer`.
  - **Shared State (Cross-Component)**: React Context (`src/context/`).
  - **Persistent State**: A custom hook, `useLocalStorage` (`src/hooks/use-local-storage.ts`), is the **single source of truth** for all data persistence in `localStorage`.
- **Forms**: `react-hook-form` for form state management and `zod` for schema validation.
- **Drag & Drop**: `react-dnd` with `react-dnd-html5-backend` for reordering projects, links, and courses.
- **Data Parsing**: `papaparse` is used for exporting data to CSV format.

## 3. Key Architectural Patterns

### Data Persistence (`useLocalStorage`)

- **CRITICAL**: The entire application state (projects, courses, links, user profile, etc.) is persisted in the browser's `localStorage`.
- The `useLocalStorage` hook (`src/hooks/use-local-storage.ts`) is the **single source of truth** for reading and writing persistent data.
- The hook returns `[value, setValue, isLoaded]`. Components must wait for `isLoaded` to be `true` before rendering data-dependent UI to avoid hydration errors.
- Initial data for new users is sourced from `src/app/data.ts`.

### Global State (React Context)

- **`ProfileProvider` (`src/context/profile-context.tsx`)**: Manages user profile information (name, avatar, github) and UI preferences (font, layout).
- **`PinProvider` (`src/context/pin-context.tsx`)**: Manages the application's global PIN lock state.

### Routing (Next.js App Router)

- **`src/app/layout.tsx`**: The root layout, containing global context providers and the `Toaster`.
- **`src/app/page.tsx`**: The main dashboard page (`'use client'`). It fetches all data via `useLocalStorage` and renders the main tabs. It also contains the master import/export logic.
- **`src/app/project/[id]/page.tsx`**: Dynamic route for displaying and editing a single project. This page includes the logic for the project-specific PIN-locked API key storage.
- **`src/app/course/[id]/page.tsx`**: Dynamic route for displaying and editing a single learning course.

## 4. Data Structures (`src/app/types.ts`)

- **`Project`**: Core model for projects. Includes `id`, `title`, `description`, `requirements`, `links`, `notes`, `progress`, `tags`, `repoUrl`, `dueDate`, and PIN-protected `apiKeys`.
- **`Course`**: Core model for learning. Includes `id`, `name`, `completed`, `links`, `notes`, and `reason`.
- **`Link`**: `{ id?: string; title: string; url: string; description?: string; }`
- **`Note`**: `{ id: string; date: string; content: string; }`

## 5. File-by-File Breakdown for Editing

- **To change the main dashboard UI**:
  - Edit **`src/app/page.tsx`**. This file controls the layout of the dashboard, including the stats and the four main `Tabs` ("Ideas", "Completed", "Links", "Learning").

- **To change the project detail page (including API Key section)**:
  - Edit **`src/app/project/[id]/page.tsx`**. This file controls the display, editing, and secure storage functionality for a single project.

- **To change the course detail page**:
  - Edit **`src/app/course/[id]/page.tsx`**.

- **To add/modify properties on a `Project`, `Course`, or other data model**:
  1.  Update the interface in **`src/app/types.ts`**.
  2.  Update the components that use this data, primarily:
      - `src/app/project/[id]/page.tsx` (project detail)
      - `src/app/course/[id]/page.tsx` (course detail)
      - `src/components/project-card.tsx` / `src/components/course-card.tsx` (card views)
      - `src/components/project-form.tsx` / `src/components/course-form.tsx` (add/edit modals).
  3.  Update the initial data in **`src/app/data.ts`** to reflect the new structure.

- **To change the Header**:
  - Edit **`src/components/app-header.tsx`**. Note: The search bar is not yet implemented in the header.
  - The profile dropdown logic is in **`src/components/profile-menu.tsx`**.

- **To change the "Add/Edit Project" modal**:
  - Edit **`src/components/project-form.tsx`**. This includes the due date picker.

- **To change the "Add/Edit Course" modal**:
  - Edit **`src/components/course-form.tsx`**.

- **To modify drag-and-drop behavior**:
  - The logic is co-located within the card (`project-card.tsx`, `link-card.tsx`, `course-card.tsx`) and the list (`project-list.tsx`, `link-tab.tsx`, `learning-tab.tsx`).

## 6. Common Tasks & Gotchas

- **Handling User Interactions**: State changes that need to persist are propagated up to the page component (`page.tsx`) and saved using the `set...` function from a `useLocalStorage` hook.
- **Fixing a Data-Related Bug**: The first place to investigate is the `useLocalStorage` hook usage in the relevant component. Ensure `isLoaded` is correctly handled. Check `src/app/types.ts` for data structure mismatches.
- **Changing Theme Colors**: All theme colors are defined as CSS variables in `src/app/globals.css`. Adjusting these HSL values is the correct way to theme the application.
- **API Key Security**: The API keys are "secured" by a PIN within the local storage context. This is obfuscation, not true encryption. Advise the user that this protects against casual observation but is not a replacement for a secure backend vault.
