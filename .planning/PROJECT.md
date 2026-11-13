# GymHub - Gym Management System
## College Mini Project Evaluation

### 1. Executive Summary
**GymHub** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for managing gym memberships, class schedules, and member bookings. The system is built for a college mini-project evaluation and fulfills all 9 mandatory checklist criteria required by the evaluation committee.

---

### 2. Mandatory Evaluation Checklist & Gap Analysis

| # | Evaluation Criterion | Current Status | Planned Implementation / Gap Closure |
|---|----------------------|----------------|---------------------------------------|
| 1 | **Frontend with Tailwind** | Partially Implemented | Modern UI styled with Tailwind CSS v4. Needs responsive polish, toast alerts, consistent layout, and accessible UI states. |
| 2 | **React & State Management** | Baseline AuthContext | Expand context/custom hooks to manage live bookings, real-time notifications, class filters, and modal states cleanly. |
| 3 | **Backend REST API** | Express 5 routes exist | Standardize REST endpoints (`/api/auth`, `/api/classes`, `/api/bookings`), structured error handling, and uniform JSON responses. |
| 4 | **MongoDB & Mongoose** | Models for User, GymClass, Booking | Add schema indexes, referential integrity (cascade delete or orphan protection), and automated DB seeding. |
| 5 | **Data Validation** | Minimal / Schema-only | Implement dedicated request validation layer (e.g. Joi / express-validator) for sanitization, boundary checks, and human-friendly error messages. |
| 6 | **Authentication & Authorization** | JWT & bcrypt in place | Role-Based Access Control (Admin vs. Member), route guards on both React frontend and Express backend, token expiration and secure headers. |
| 7 | **Real-Time Features (Socket.IO)** | Socket.IO setup present | Wire real-time slot capacity updates and live notifications across connected clients when classes are booked, updated, or canceled. |
| 8 | **Docker** | Missing | Multi-container Docker setup: `Dockerfile` for client, `Dockerfile` for server, and `docker-compose.yml` orchestrating client, server, and MongoDB with healthchecks. |
| 9 | **DevOps & Deployment** | Missing | GitHub Actions CI workflow (linting, build verification), `.env.example` configurations, production build optimization, and deployment guide for demonstration. |

---

### 3. Target User Personas & Core Workflows

1. **Member / General User:**
   - Sign up / Log in securely with email & password.
   - Browse upcoming gym classes with filtering (Category, Difficulty, Schedule).
   - View live remaining seat capacity (updated in real time via Socket.IO).
   - Book a class (with duplicate booking prevention and capacity enforcement).
   - View and cancel active bookings in "My Bookings" with instant seat restoration.

2. **Admin:**
   - Log into a dedicated admin interface (`/admin`).
   - Create, update, and delete gym classes (title, category, difficulty, instructor, date, time, duration, max capacity).
   - View all member bookings across all classes.
   - Monitor real-time booking changes without manual page refreshes.

---

### 4. Technical Stack

- **Frontend:** React (Vite), React Router DOM, Tailwind CSS, Axios, Socket.IO Client.
- **Backend:** Node.js, Express.js, Socket.IO, JWT, bcryptjs, express-validator.
- **Database:** MongoDB with Mongoose ODM.
- **DevOps & Tooling:** Docker, Docker Compose, GitHub Actions, Nodemon.

---

### 5. Success Criteria for Evaluation & Viva
- [ ] Every checklist item is fully demonstrated and explained during the evaluation.
- [ ] Zero runtime console/backend errors during demonstration.
- [ ] One-command startup via `docker compose up --build`.
- [ ] Real-time updates visually demonstrated across two open browser windows.
- [ ] Clean documentation (README, API endpoints, schema diagrams, viva guide).

