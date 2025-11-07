# ProjectFlow: Comprehensive File Structure Guide

This document provides a detailed breakdown of every file and directory in your ProjectFlow application. Use this guide to understand the purpose of each file and to quickly locate the code you need to modify for specific features or UI changes.

---

## 📂 `src/` - The Heart of Your Application

This directory contains all the core source code for your Next.js application.

### 📁 `src/app/` - Application Router & Pages

This folder uses the Next.js App Router. Each folder inside represents a URL path in your application.

- **`src/app/layout.tsx`**
  - **Purpose**: This is the main layout for the entire application. It wraps every page.
  - **Edit this file to**: Change the root HTML structure, add global context providers (`ProfileProvider`, `PinProvider`), or import global fonts.

- **`src/app/page.tsx`**
  - **Purpose**: This is the **main dashboard/home page** of your application.
  - **Edit this file to**: Modify the `Tabs` component that switches between "Ideas", "Completed", "Links", and "Learning". Adjust how data is fetched and passed to the tabs. It also contains the master import/export logic.

- **`src/app/project/[id]/page.tsx`**
  - **Purpose**: This is the **dynamic project detail page**. It renders details for any project based on its ID.
  - **Edit this file to**: Change the layout of the single project view, modify how project details (description, requirements, notes, links) are displayed, and manage the secure API key storage UI and logic.

- **`src/app/course/[id]/page.tsx`**
  - **Purpose**: The **dynamic course detail page**, similar to the project page but for learning resources.
  - **Edit this file to**: Change the layout for viewing a single course, including its notes, links, and the "reason for learning" section.

- **`src/app/globals.css`**
  - **Purpose**: This is where your global styles and Tailwind CSS theme variables are defined.
  - **Edit this file to**: Change the application's color scheme (background, primary, accent colors, etc.).

- **`src/app/data.ts`**
  - **Purpose**: Contains the initial, default data for the application. This data populates the app for a new user.
  - **Edit this file to**: Change the default "Ideas", "Completed" projects, "Links", or "Courses" that new users see.

- **`src/app/types.ts`**
  - **Purpose**: Defines the TypeScript types for your core data structures (`Project`, `Course`, `Link`, `Note`).
  - **Edit this file to**: Add or remove properties from your data models (e.g., adding `dueDate` to `Project`).

---

### 📁 `src/components/` - Reusable Building Blocks

This directory contains the React components that make up your application's UI.

- **`src/components/app-header.tsx`**: The header bar at the top, containing the logo, app title, and profile menu.
- **`src/components/app-lock.tsx`**: The full-screen UI that appears when the application is locked with a global PIN.
- **`src/components/dashboard-stats.tsx`**: The set of cards at the top of the dashboard showing key statistics.
- **`src/components/project-card.tsx`**: The individual card for each project. Handles inline progress editing and quick actions.
- **`src/components/project-list.tsx`**: Renders a grid of `ProjectCard` components and handles drag-and-drop logic for a column.
- **`src/components/project-tab.tsx`**: The main content for the "Ideas" and "Completed" tabs, containing the `ProjectList`.
- **`src/components/project-form.tsx`**: The comprehensive modal dialog for adding or editing a project.
- **`src/components/course-card.tsx`**: The individual card for each course in the "Learning" tab.
- **`src/components/course-form.tsx`**: The modal dialog for adding or editing a course.
- **`src/components/learning-tab.tsx`**: The main content for the "Learning" tab.
- **`src/components/link-card.tsx`**: The individual card component for each link in the "Links" tab.
- **`src/components/link-form.tsx`**: The modal dialog for adding or editing a link.
- **`src/components/link-tab.tsx`**: The main content for the "Links" tab.
- **`src/components/profile-dialog.tsx`**: The modal for editing user profile information and managing the global security PIN.
- **`src/components/profile-menu.tsx`**: The dropdown menu from the user avatar in the header. Contains actions like "Edit Profile," "Export," and "Lock App."
- **`src/components/tech-logo.tsx`**: A smart component that displays a relevant logo for a course based on its name (e.g., showing the React logo for a "React" course).
- **`src/components/theme-toggle.tsx`**: The button for switching between light and dark modes.

#### 📁 `src/components/ui/`

This directory contains the base UI components from **shadcn/ui**. You generally **should not edit these files**. Examples include `Button.tsx`, `Card.tsx`, `Input.tsx`, `Dialog.tsx`, etc.

---

### 📁 `src/context/` - Global State Management

- **`src/context/pin-context.tsx`**: Manages all state and logic for the application's global PIN lock feature.
- **`src/context/profile-context.tsx`**: Manages user profile info (name, avatar) and UI preferences (font, layout).

---

### 📁 `src/hooks/` - Reusable Logic

- **`src/hooks/use-local-storage.ts`**: A critical hook that handles saving and retrieving all application data from the browser's `localStorage`.
- **`src/hooks/use-mobile.tsx`**: A simple hook to detect if the user is on a mobile device.
- **`src/hooks/use-toast.ts`**: Manages the "toast" notifications that pop up to confirm actions or show errors.

---

### 📁 `src/lib/` - Utility Functions

- **`src/lib/utils.ts`**: Contains helper functions, primarily `cn` for merging Tailwind CSS classes.

---

## 📂 Root Directory - Configuration Files

- **`.env`**: For storing environment variables.
- **`apphosting.yaml`**: Configuration for Firebase App Hosting.
- **`components.json`**: Configuration for `shadcn/ui`.
- **`next.config.ts`**: Main configuration file for Next.js.
- **`package.json`**: Lists all project dependencies and scripts.
- **`tailwind.config.ts`**: Configuration file for Tailwind CSS.
- **`tsconfig.json`**: The TypeScript compiler configuration.
