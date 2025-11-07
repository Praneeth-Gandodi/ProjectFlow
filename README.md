# ProjectFlow

ProjectFlow is a modern and minimal Project Management Web Application built to help users organize, track, and complete projects efficiently.  
It provides an intuitive interface to create, manage, and categorize projects as "Ideas" or "Completed", manage a library of useful links, and track learning courses.

---

## Features

- **Comprehensive Dashboard**: At-a-glance statistics for projects and learning courses.
- **Tabbed Interface**: Separate, organized tabs for "Ideas", "Completed" projects, "Links", and "Learning".
- **Project Management**:
  - Add, edit, and delete projects with detailed descriptions, requirements, tags, and logos.
  - Inline progress editing directly on project cards.
  - Drag-and-drop reordering for projects, links, and courses.
  - One-click "Mark as Completed" and "Move back to Ideas" functionality.
  - Optional due dates with color-coded visual reminders for upcoming or overdue projects.
- **Learning Tracker**:
  - Add, edit, and delete courses you are taking.
  - Mark courses as complete.
  - Dedicated detail pages for each course to add notes and relevant links.
- **Link Library**: A centralized place to save and categorize useful URLs.
- **Detailed View Pages**:
  - Each project and course has its own dedicated page.
  - Add timestamped notes/logs to document progress.
  - Attach relevant links to projects and courses.
  - **Secure API Key Storage**: Store project-specific API keys securely with a 4-digit PIN lock on the project detail page.
- **Data Portability**:
  - Export all your data (projects, links, courses) to a single JSON backup file.
  - Export individual categories to CSV.
  - Import your data from a JSON backup file to restore your workspace.
- **Customization**:
  - Light/Dark mode toggle.
  - App-wide font (Sans/Serif) and layout (Compact/Comfortable) settings.
  - User profile customization with name, avatar, and GitHub link.
- **Local-First**: All data is saved directly in your browser's `localStorage`, making it fast and private.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React, Tailwind CSS, ShadCN/UI
- **State Management**: React Context and `useLocalStorage` custom hook
- **Icons**: `lucide-react`
- **Drag & Drop**: `react-dnd`
- **Form Management**: `react-hook-form` with `zod` for validation

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Praneeth-Gandodi/ProjectFlow.git
cd ProjectFlow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Then open the localhost URL from the terminal.

---

## Credits

This project was made possible with the collaboration and inspiration of the following tools and platforms:

- **Firebase Studio** — for providing the initial blueprint and backend-ready structure.  
- **DeepSeek AI** - For invaluable assistance with code generation and development guidance that made this website possible.
- **ChatGPT (OpenAI)** — for all code corrections, logic structuring, feature additions, and UI/UX refinements.  
- **Copilot** — for generating the favicon and offering intelligent code completions.

---

## Special Thanks

A heartfelt thank you to all the AI tools and platforms that contributed to this project's development. Your collective assistance with code generation, debugging, design suggestions, and feature implementation made this website possible🙏.
