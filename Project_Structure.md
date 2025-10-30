# ProjectFlow: Comprehensive File Structure Guide

This document provides a detailed breakdown of every file and directory in your ProjectFlow application. Use this guide to understand the purpose of each file and to quickly locate the code you need to modify for specific features or UI changes.

---

## 📂 `src/` - The Heart of Your Application

This directory contains all the core source code for your Next.js application.

### 📁 `src/app/` - Application Router & Pages

This folder uses the Next.js App Router. Each folder inside represents a URL path in your application.

- **`src/app/layout.tsx`**
  - **Purpose**: This is the main layout for the entire application. It wraps every page.
  - **Edit this file to**:
    - Change the root HTML structure (`<html>`, `<body>`).
    - Add or modify global context providers (like `ProfileProvider`, `PinProvider`).
    - Import global fonts or stylesheets.

- **`src/app/page.tsx`**
  - **Purpose**: This is the **main dashboard/home page** of your application.
  - **Edit this file to**:
    - Change the layout of the main dashboard.
    - Modify the `Tabs` component that switches between "Ideas", "Completed", and "Links".
    - Adjust how data (projects, links) is filtered or displayed on the dashboard.

- **`src/app/project/[id]/page.tsx`**
  - **Purpose**: This is the **dynamic project detail page**. The `[id]` in the path means it can render details for any project based on its ID.
  - **Edit this file to**:
    - Change the layout of the single project view.
    - Modify how project details (title, description, requirements, notes, links) are displayed.
    - Implement or change the "edit mode" functionality.

- **`src/app/globals.css`**
  - **Purpose**: This is where your global styles and Tailwind CSS theme variables are defined.
  - **Edit this file to**:
    - Change the application's color scheme (background, primary, accent colors, etc.) by modifying the CSS variables inside the `:root` and `.dark` blocks.
    - Add any custom CSS classes that need to be available globally.

- **`src/app/data.ts`**
  - **Purpose**: Contains the initial, default data for the application. This data is used to populate the app when a user visits for the first time or when their local browser storage is empty.
  - **Edit this file to**:
    - Change the default "Ideas", "Completed" projects, or "Links" that new users see.

- **`src/app/types.ts`**
  - **Purpose**: Defines the TypeScript types and interfaces for your core data structures (`Project`, `Link`, `Note`, `Requirement`).
  - **Edit this file to**:
    - Add or remove properties from your data models. For example, if you wanted to add a `dueDate` to a `Project`, you would add it here.

---

### 📁 `src/components/` - Reusable Building Blocks

This directory contains the React components that make up your application's UI.

- **`src/components/app-header.tsx`**: The header bar at the top of the application, containing the logo, title, search bar, and profile menu.
- **`src/components/app-lock.tsx`**: The full-screen UI that appears when the application is locked with a PIN.
- **`src/components/dashboard-stats.tsx`**: The set of three cards at the top of the dashboard showing "Total Projects," "Ideas," and "Completed" counts.
- **`src/components/icons.tsx`**: Contains custom SVG icon components, like the `AppLogo`.
- **`src/components/link-card.tsx`**: The individual card component used to display each link in the "Links" tab.
- **`src/components/link-form.tsx`**: The modal dialog (popup) for adding a new link or editing an existing one.
- **`src/components/link-tab.tsx`**: The main content for the "Links" tab on the dashboard, which displays the grid of `LinkCard` components.
- **`src/components/profile-dialog.tsx`**: The modal for editing user profile information (name, avatar, GitHub) and managing the security PIN.
- **`srcA/components/profile-menu.tsx`**: The dropdown menu that appears when you click the user avatar in the header. Contains actions like "Edit Profile," "Export," and "Lock App."
- **`src/components/project-card.tsx`**: The individual card for each project shown in the "Ideas" and "Completed" tabs.
- **`src/components/project-form.tsx`**: The comprehensive modal dialog for adding a new project or editing an existing one.
- **`src/components/project-list.tsx`**: A component that renders a grid of `ProjectCard` components. It handles drag-and-drop logic within a column.
- **`src/components/project-tab.tsx`**: The main content for the "Ideas" and "Completed" tabs, which contains the `ProjectList`.
- **`src/components/theme-toggle.tsx`**: The sun/moon button in the header for switching between light and dark modes.

#### 📁 `src/components/ui/`

This directory contains the base UI components from **shadcn/ui**. You generally **should not edit these files** unless you want to make fundamental changes to a core component's style or behavior across the entire app. Examples include `Button.tsx`, `Card.tsx`, `Input.tsx`, `Dialog.tsx`, etc.

---

### 📁 `src/context/` - Global State Management

This folder holds React Context providers for managing state that needs to be shared across your entire application.

- **`src/context/pin-context.tsx`**: Manages all state and logic related to the application's PIN lock feature (e.g., if the app is locked, unlock attempts, setting the PIN).
- **`src/context/profile-context.tsx`**: Manages user profile information (name, avatar), as well as UI preferences like font and layout mode.

---

### 📁 `src/hooks/` - Reusable Logic

This directory is for custom React Hooks that encapsulate reusable logic.

- **`src/hooks/use-local-storage.ts`**: A critical hook that handles saving and retrieving data from the browser's `localStorage`. This is what makes your data persist between sessions.
- **`src/hooks/use-mobile.tsx`**: A simple hook to detect if the user is on a mobile device.
- **`src/hooks/use-toast.ts`**: Manages the "toast" notifications that pop up to confirm actions or show errors.

---

### 📁 `src/lib/` - Utility Functions

- **`src/lib/utils.ts`**: Contains helper functions. Currently, it includes `cn`, which is used to merge Tailwind CSS classes conditionally.

---

## 📂 Root Directory - Configuration Files

These files are in the main folder of your project and configure how the application is built and runs.

- **`.env`**: For storing environment variables. You would put secret keys or environment-specific settings here.
- **`PROJECT_STRUCTURE.md`**: The file you are currently reading!
- **`README.md`**: A basic introductory file for the project.
- **`apphosting.yaml`**: Configuration for Firebase App Hosting.
- **`components.json`**: Configuration file for `shadcn/ui`, defining where components are stored, styling preferences, etc.
- **`next.config.ts`**: The main configuration file for Next.js. You can use it to set up image domains, redirects, and other advanced settings.
- **`package.json`**: Lists all of your project's dependencies (the libraries it uses) and defines script commands like `npm run dev`.
- **`tailwind.config.ts`**: Configuration file for Tailwind CSS. You edit this to extend the default styling capabilities, such as adding custom fonts or colors.
- **`tsconfig.json`**: The configuration file for TypeScript. It tells the compiler how to check your code for errors.
