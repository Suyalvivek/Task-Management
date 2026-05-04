# 📌 Frontend Requirements – Team Task Manager

## 🧠 Overview
This document defines the frontend architecture, UI/UX strategy, and implementation details for the **Team Task Management Web Application**.

The frontend will be built using a modern React-based stack with a focus on:
- Clean and professional UI
- Responsive design
- Role-based interaction
- Dark/Light theme support

---

## ⚙️ Tech Stack

- **React.js** – Core frontend library
- **Tailwind CSS** – Utility-first styling
- **shadcn/ui** – Prebuilt UI components
- **React Router** – Routing and navigation
- **Axios** – API communication
- **React Hook Form** – Form handling
- **Zod** – Schema validation
- **Custom ThemeContext** – Dark/Light mode (plain React Context, Vite-compatible)
- **lucide-react** – Icons
- **react-hot-toast** – Toast notifications

---

## 🧱 Application Structure

### 📁 Folder Structure
```
/src
  /api
    axiosInstance.js       ← Centralized Axios instance with JWT interceptor
    authApi.js
    projectApi.js
    taskApi.js
    dashboardApi.js
  /components
    Button.jsx
    Input.jsx
    Card.jsx
    Modal.jsx
    Navbar.jsx
    Sidebar.jsx
    TaskCard.jsx
    StatusBadge.jsx
    PriorityBadge.jsx
    MemberList.jsx
  /pages
    /auth
      Login.jsx
      Signup.jsx
    /dashboard
      Dashboard.jsx
    /projects
      Projects.jsx
      ProjectDetail.jsx
  /context
    AuthContext.jsx
    ThemeContext.jsx
  /hooks
    useAuth.js
    useProjects.js
    useTasks.js
  /utils
    validators.js
    formatDate.js
```

---

## 🧭 Routing

Routes are managed using React Router.
/login
/signup
/dashboard
/projects
/projects/:projectId
### 🔐 Protected Routes
- Only authenticated users can access dashboard and project routes
- Unauthorized users are redirected to login

---

## 🔐 Authentication (Frontend Behavior)

- Signup and Login forms
- Store JWT token in `localStorage`
- Attach token to all API requests using Axios interceptor
- Redirect to dashboard after login

---

## 🔌 API Integration

### Axios Setup

- Centralized Axios instance
- Automatically attaches Authorization header

```js
Authorization: Bearer <token>
API Modules

* authApi.js → login/signup
* projectApi.js → project operations
* taskApi.js → task operations

⸻

🧾 Forms & Validation

Handled using:

* React Hook Form
* Zod schema validation

Forms Include:

* Signup
* Login
* Create Project
* Create Task

Features:

* Real-time validation
* Inline error messages
* Disabled submit during loading

⸻

🎨 UI/UX Design System

🌗 Theme Support

* Dark mode (default)
* Light mode toggle
* Managed using a custom `ThemeContext` (React Context + `useEffect` on `document.body`)
* Persisted in `localStorage` across sessions
* No external dependency — fully Vite-compatible

🎯 Design Principles

* Minimal and clean layout
* Consistent spacing (p-4, gap-4)
* Soft borders and shadows
* Typography hierarchy

⸻

🧱 Layout Architecture
[ Sidebar ]   [ Topbar ]
              [ Main Content ]
📌 Sidebar

* Dashboard
* Projects
* Logout

📌 Topbar

* App name / Project name
* Theme toggle
* User avatar

📌 Main Content

* Dynamic content based on route

⸻

🧩 UI Components (shadcn)

Core components used:

* Button
* Input
* Card
* Badge
* Dialog (Modal)
* Select
* Dropdown Menu
* Avatar
* Separator

⸻

📊 Pages & Features

⸻

🔐 Auth Pages (Login / Signup)

* Centered card layout
* Input fields with validation
* Submit button with loading state

⸻

📊 Dashboard

Displays:

* Total tasks (count card)
* Tasks by status (To Do / In Progress / Done — count cards)
* Overdue tasks (count card with warning color)
* **Tasks per user** (table or horizontal bar list showing each team member + their task count)

UI:

* Grid layout using stat cards (top row)
* Tasks-per-user section below as a simple list/table
* Admins see all stats across all projects
* Members see only their own stats

⸻

📁 Projects Page

* List of projects
* “Create Project” button
* Each project card shows:
    * Name
    * Member count

⸻

📄 Project Detail Page

Main working area.

Displays:

* Project title
* Members list with avatars
* Task list (filtered by role — Members see only their assigned tasks)

Features (Admin only):

* Create task (modal with Title, Description, Due Date, Priority, Assignee)
* **Add member** — input field to search/add user by email
* **Remove member** — remove button next to each member in the list
* Delete task

Features (Member):

* View only tasks assigned to them
* Update task status (To Do → In Progress → Done)

> ⚠️ Role enforcement happens both on the frontend (conditional UI rendering) and backend (API guard middleware).

⸻

✅ Task UI

Each task card includes:

* Title
* Assigned user (Avatar)
* Status dropdown (To Do / In Progress / Done)
* Priority badge (Low / Medium / High)

⸻

🔐 Role-Based UI

Admin:

* Create project (becomes Admin automatically)
* Add/remove members from project
* Create, edit, and delete tasks
* View full dashboard (all users' stats)
* See all tasks in a project

Member:

* View only tasks assigned to them
* Update status on their own tasks
* View dashboard with personal stats only
* Cannot access member management controls

Implementation:

* Role stored in JWT payload and in `AuthContext`
* UI elements conditionally rendered using `role === 'admin'` checks
* API calls also protected by backend middleware (not just UI)

⸻

🎯 UX Enhancements

* Loading indicators (spinner/skeleton)
* Empty states (e.g., “No tasks yet”)
* Toast notifications for success/error
* Disabled buttons during API calls

⸻

⚠️ Best Practices

* Modular folder structure and clean code , follow srp,dry principles.
* Keep UI minimal and consistent
* Avoid unnecessary complexity (no Redux)
* Use reusable components
* Handle API errors properly
* Ensure responsiveness
