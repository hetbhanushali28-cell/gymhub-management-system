# Requirements Specification: GymHub (College Evaluation)

This document specifies the exact requirements mapped to the 9 mandatory college mini-project evaluation criteria.

---

## 1. Traceability Matrix

| ID | Category | Checklist Requirement | Priority | Status |
|----|----------|-----------------------|----------|--------|
| REQ-FE-01 | UI/UX | Frontend with Tailwind CSS | P0 | In Progress |
| REQ-FE-02 | UI/UX | Responsive Design & Mobile Compatibility | P0 | Planned |
| REQ-FE-03 | UI/UX | Toast Notifications & User Feedback | P1 | Planned |
| REQ-ST-01 | React | Global Authentication State (`AuthContext`) | P0 | Implemented |
| REQ-ST-02 | React | Live Socket & Booking State Management | P0 | Planned |
| REQ-API-01 | Backend | RESTful API Endpoints for Classes & Bookings | P0 | Implemented |
| REQ-API-02 | Backend | Centralized Error Handling & Uniform JSON | P0 | Planned |
| REQ-DB-01 | Database | Mongoose Schema Definitions & Relations | P0 | Implemented |
| REQ-DB-02 | Database | Compound Indexes (Prevent Duplicate Bookings) | P0 | Planned |
| REQ-VAL-01 | Validation | Input Validation Middleware (`express-validator`) | P0 | Planned |
| REQ-VAL-02 | Validation | Client-side Validation & Feedback | P1 | Planned |
| REQ-AUTH-01| Security | JWT Generation, Signing & Verification | P0 | Implemented |
| REQ-AUTH-02| Security | Role-Based Access Control (RBAC) & Protected Routes | P0 | In Progress |
| REQ-RT-01 | Real-time | Socket.IO Server & Client Connection | P0 | In Progress |
| REQ-RT-02 | Real-time | Broadcast Slot Capacity & Booking Events Live | P0 | Planned |
| REQ-DOC-01 | DevOps | Client & Server Dockerfiles (Multi-stage build) | P0 | Planned |
| REQ-DOC-02 | DevOps | `docker-compose.yml` (App + API + Mongo) | P0 | Planned |
| REQ-OPS-01 | DevOps | CI/CD GitHub Actions Workflow | P1 | Planned |
| REQ-OPS-02 | DevOps | Production Deployment & Viva Demo Guide | P0 | Planned |

---

## 2. Detailed Requirements

### REQ-FE: Frontend with Tailwind
- **REQ-FE-01**: All pages must feature sleek, cohesive styling using Tailwind CSS (hero section, cards, badges, buttons, tables).
- **REQ-FE-02**: All layouts must be responsive across mobile (< 640px), tablet (< 1024px), and desktop screens.
- **REQ-FE-03**: Interactive toast messages for booking successes, errors, and real-time alerts.

### REQ-ST: React & State Management
- **REQ-ST-01**: `AuthContext` provides authenticated user details, login, logout, and token retention via `localStorage`.
- **REQ-ST-02**: Dedicated state or custom hook for real-time WebSocket listening, instantly updating available spots on `Classes.jsx` and `AdminDashboard.jsx` without full page refresh.

### REQ-API: Backend REST API
- **REQ-API-01**: Full REST CRUD:
  - `POST /api/auth/register` & `POST /api/auth/login`
  - `GET /api/classes`, `GET /api/classes/:id`, `POST /api/classes`, `PUT /api/classes/:id`, `DELETE /api/classes/:id`
  - `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings`, `DELETE /api/bookings/:id`
- **REQ-API-02**: Error handling middleware returning standard schema `{ success: false, message: string, errors?: array }`.

### REQ-DB: MongoDB & Mongoose
- **REQ-DB-01**: Schemas for `User` (name, email, password, role), `GymClass` (title, description, instructor, date, time, duration, capacity, bookedCount, category, difficulty), `Booking` (user ref, gymClass ref, status, createdAt).
- **REQ-DB-02**: Unique compound index `{ user: 1, gymClass: 1 }` on `Booking` so a user cannot book the same class twice.

### REQ-VAL: Data Validation
- **REQ-VAL-01**: Backend request validation:
  - Email format and password complexity on registration.
  - Required fields, positive capacity, valid date/time on gym class creation/update.
  - Valid MongoDB ObjectIds for booking and class routes.
- **REQ-VAL-02**: Clear validation errors returned with HTTP 400 status.

### REQ-AUTH: Authentication & Authorization
- **REQ-AUTH-01**: Passwords hashed with bcrypt (salt rounds = 10). JWT tokens issued on login/register with expiration.
- **REQ-AUTH-02**: `protect` middleware ensures valid Bearer token; `admin` middleware enforces `req.user.role === 'admin'`. React `ProtectedRoute` prevents unauthorized URL navigation.

### REQ-RT: Real-Time Features (Socket.IO)
- **REQ-RT-01**: Socket.io server integrated with HTTP server, handling client connection and room/broadcast events.
- **REQ-RT-02**: When a class is booked or canceled:
  - Server emits `class_updated` with new remaining seats.
  - Connected clients listening update UI in real time without refreshing.

### REQ-DOC & REQ-OPS: Docker, DevOps & Deployment
- **REQ-DOC-01**: `server/Dockerfile` (Node.js LTS, lightweight alpine) and `client/Dockerfile` (multi-stage build with Nginx or static serving).
- **REQ-DOC-02**: Root `docker-compose.yml` combining MongoDB, backend service, frontend service, volumes, and network bridge.
- **REQ-OPS-01**: GitHub Actions `.github/workflows/ci.yml` verifying linting, client build, and backend startup.
- **REQ-OPS-02**: Comprehensive `README.md` containing architecture diagram, API documentation, local run instructions, and step-by-step viva presentation script.

