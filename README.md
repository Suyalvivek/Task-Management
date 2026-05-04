# TaskFlow - Team Task Management Application

TaskFlow is a full-stack, role-based collaborative task management web application designed to help teams organize projects, assign tasks, and track their progress in real-time. It features a modern, clean UI with light/dark mode support and a robust RESTful backend.

## 🔗 Live Demo & URLs

* **Frontend (Live App):** [https://task-management-production-1210.up.railway.app/](https://task-management-production-1210.up.railway.app/)
* **Backend API:** [https://task-magement-backend.up.railway.app/](https://task-magement-backend.up.railway.app/)
* **API Health Check:** [https://task-magement-backend.up.railway.app/api/health](https://task-magement-backend.up.railway.app/api/health)

## 🚀 Key Features

* **User Authentication:** Secure signup and login using JWT (JSON Web Tokens) and bcrypt password hashing.
* **Project Management:** Create projects and add/remove team members by email. The creator automatically becomes the Admin.
* **Task Management:** Create, assign, and update tasks with fields for Title, Description, Due Date, and Priority.
* **Role-Based Access Control (RBAC):**
  * **Admins:** Manage projects, add/remove members, and manage all tasks within a project.
  * **Members:** View project tasks and update the status (To Do, In Progress, Done) of tasks exclusively assigned to them.
* **Dashboard Analytics:** Visual overview displaying total tasks, overdue tasks, tasks per user, and progress bars breaking down tasks by status.

## 🛠️ Technology Stack

* **Frontend:** React, Vite, React Router, React Hook Form, Zod (validation), Tailwind CSS (design system), Lucide React (icons).
* **Backend:** Node.js, Express.js.
* **Database & ORM:** PostgreSQL managed via Prisma ORM.

## 📦 Local Setup Instructions

### Prerequisites
* Node.js (v18+ recommended)
* A local or cloud PostgreSQL database instance.

### 1. Clone the repository
```bash
git clone https://github.com/Suyalvivek/Task-Management.git
cd team-management
```

### 2. Backend Setup
```bash
cd backend
npm install
```
* Create a `.env` file in the `backend` directory based on `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager?schema=public"
PORT=5000
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```
* Push the database schema:
```bash
npx prisma db push
```
* Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
* Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:5000/api/v1"
```
* Start the frontend development server:
```bash
npm run dev
```

## 🌐 Deployment Instructions (Railway)

1. **Database:** Create a new PostgreSQL instance on Railway. Copy the connection URL.
2. **Backend:** Deploy the `backend` directory to Railway. Add your Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`). Add a custom build command `npm install && npx prisma db push` to ensure the database is synced.
3. **Frontend:** Deploy the `frontend` directory to Railway. Set `VITE_API_URL` to your newly deployed backend URL. Change the build command to `npm run build` and ensure the output directory is configured correctly for Vite (`dist`).

## 🎥 Demo Video
[Link to your 2-5 minute demo video goes here]
