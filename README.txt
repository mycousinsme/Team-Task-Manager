====================================================
  TEAMFLOW - Team Task Manager (Full-Stack App)
====================================================

LIVE URL: [https://team-task-manager-production-4d25.up.railway.app/]
GITHUB:   []

----------------------------------------------------
OVERVIEW
----------------------------------------------------
TeamFlow is a full-stack Team Task Manager web app
built with React (frontend) and Node.js/Express +
PostgreSQL (backend). Users can create projects,
assign tasks, manage teams, and track progress via
a Kanban board — with role-based access control.

----------------------------------------------------
FEATURES
----------------------------------------------------
Authentication:
  - Signup / Login with JWT tokens
  - Role-based: Admin or Member
  - Persistent sessions via localStorage

Projects:
  - Create, view, delete projects
  - Add/remove team members per project
  - Project-level roles (admin/member)

Tasks:
  - Kanban board (To Do / In Progress / Done)
  - Create, edit, delete tasks
  - Assign to team members
  - Set priority (Low/Medium/High) and due date
  - One-click status transitions

Dashboard:
  - Summary stats (total, todo, in progress, done)
  - Overdue task alerts
  - Recent task feed

Role-Based Access:
  - Admins: Full access to all projects/tasks
  - Members: See only their projects; edit own tasks
  - Project owner: Manage members and all tasks

----------------------------------------------------
TECH STACK
----------------------------------------------------
Frontend:
  - React 18 (Create React App)
  - React Router v6
  - Axios for API calls
  - Custom CSS (no UI library)

Backend:
  - Node.js + Express
  - Sequelize ORM
  - PostgreSQL database
  - JWT Authentication
  - bcryptjs for password hashing

Deployment:
  - Railway (backend + frontend served together)
  - PostgreSQL plugin on Railway

----------------------------------------------------
LOCAL SETUP
----------------------------------------------------
Prerequisites: Node.js 18+, PostgreSQL

1. Clone the repo:
   git clone <repo-url>
   cd team-task-manager

2. Backend setup:
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   node src/index.js

3. Frontend setup (new terminal):
   cd frontend
   npm install
   REACT_APP_API_URL=http://localhost:5000/api npm start

4. Open http://localhost:3000

----------------------------------------------------
API ENDPOINTS
----------------------------------------------------
POST   /api/auth/signup          Register user
POST   /api/auth/login           Login
GET    /api/auth/me              Current user

GET    /api/projects             List projects
POST   /api/projects             Create project
GET    /api/projects/:id         Project detail + tasks
PUT    /api/projects/:id         Update project
DELETE /api/projects/:id         Delete project
POST   /api/projects/:id/members Add member
DELETE /api/projects/:id/members/:userId  Remove member

GET    /api/tasks/dashboard      Dashboard data
GET    /api/tasks/project/:id    Tasks by project
POST   /api/tasks                Create task
PUT    /api/tasks/:id            Update task
DELETE /api/tasks/:id            Delete task

GET    /api/users                List all users

----------------------------------------------------
RAILWAY DEPLOYMENT STEPS
----------------------------------------------------
1. Push code to GitHub
2. Go to https://railway.app → New Project → GitHub
3. Add PostgreSQL plugin (auto-sets DATABASE_URL)
4. Set environment variables:
   - JWT_SECRET=<random 32+ char string>
   - NODE_ENV=production
5. Railway auto-deploys using railway.toml config
6. Copy the generated URL as your Live URL

----------------------------------------------------
ENVIRONMENT VARIABLES
----------------------------------------------------
DATABASE_URL=postgresql://...   (set by Railway plugin)
JWT_SECRET=your_secret_here
PORT=5000                       (set by Railway auto)
NODE_ENV=production

----------------------------------------------------
PROJECT STRUCTURE
----------------------------------------------------
team-task-manager/
├── railway.toml              Deployment config
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js          Entry point
│       ├── models/           Sequelize models
│       │   ├── index.js      DB + associations
│       │   ├── user.js
│       │   ├── project.js
│       │   ├── task.js
│       │   └── projectMember.js
│       ├── controllers/      Route handlers
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   └── taskController.js
│       ├── middleware/
│       │   └── auth.js       JWT middleware
│       └── routes/
│           ├── auth.js
│           ├── projects.js
│           ├── tasks.js
│           └── users.js
└── frontend/
    ├── package.json
    └── src/
        ├── App.js            Router setup
        ├── index.css         Global styles
        ├── context/
        │   └── AuthContext.js  Auth state + axios
        ├── components/
        │   └── Layout.js     Sidebar layout
        └── pages/
            ├── Login.js
            ├── Signup.js
            ├── Dashboard.js
            ├── Projects.js
            └── ProjectDetail.js

----------------------------------------------------
AUTHOR
----------------------------------------------------
Built for ethara.ai Full-Stack Assessment
Timeline: ~10 hours
====================================================
