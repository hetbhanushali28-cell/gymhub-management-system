# GymHub: College Mini-Project Demonstration & Viva Guide
**Student:** Het Bhanushali  
**Class:** D15A • **Roll No.:** 16  
**Project:** Gym Membership Management System ("GymHub" / "Elite Athletic Club")  
**Reference Report:** Experiment 0: Web Application Design and Planning (`16 het (1) (1).pdf`)

---

## 1. Technical Stack Overview

| Layer | Technology | Role & Implementation |
|---|---|---|
| **Frontend Framework** | **React.js 19 (Vite 8)** | Single Page Application (SPA), React Hooks (`useState`, `useEffect`, `useContext`, custom hooks). |
| **State Management** | **React Context API** | Global state for authentication (`AuthContext` / `useAuth`) and WebSockets (`SocketContext` / `useSocket`). |
| **Styling & UI** | **Tailwind CSS v4** | Dark luxury theme matching wireframes, custom status pills, responsive tables, interactive SVG charts. |
| **Routing** | **React Router DOM v7** | Client-side routing with route guards (`<ProtectedRoute>` for `user` and `admin`). Supports `/admin/dashboard` and `/member/dashboard`. |
| **Backend Runtime** | **Node.js + Express.js** | Modular REST API with controllers, route handlers, and centralized error handling middleware. |
| **Database & ODM** | **MongoDB (Local: 27017) + Mongoose** | Local database `gym-management` with Mongoose schemas, field validations, and compound unique index `{ user: 1, gymClass: 1 }`. |
| **Real-Time Engine** | **Socket.IO (WebSockets)** | Bidirectional WebSocket notifications (`admin_broadcast`, `class_capacity_updated`, `notification`, `booking_created`). |
| **Security & Auth** | **JWT + bcryptjs** | Salted password hashing (10 rounds), signed Bearer tokens with 30-day expiry, and RBAC (`admin` vs `user`). |
| **Data Validation** | **express-validator** | Request sanitization and boundary validations on all mutating endpoints with standardized HTTP 400 responses. |
| **Containerization** | **Docker & Docker Compose** | Multi-container setup for Frontend, Backend, and MongoDB with persistent volumes. |
| **DevOps & Testing** | **GitHub Actions + Postman** | Automated CI pipeline (`ci.yml`) and pre-configured Postman test suite (`GymHub_Postman_Collection.json`). |

---

## 2. Views & Modules Implemented (Directly from Report Wireframes)

| Page / Wireframe | Route | Key Features Implemented |
|---|---|---|
| **View 1: Landing & Pricing** *(Page 6)* | `/` | Hero section ("The Pinnacle of Physicality"), Unrivaled Environments (Olympic Grounds, Wellness Suites, Cryo), 3 Membership Tiers ($350/mo Classic, $3,500/yr Annual, $10,000/yr VIP Elite), Flagship Address & Interactive Location Map. |
| **View 2: Authentication** *(Page 7)* | `/login` & `/register` | Luxury dark card matching Page 7 wireframe: "ELITE ATHLETIC PRIVATE MEMBERS CLUB", Tabbed toggle between `Member Login` and `Request Access`, 1-Click Demo Fill buttons (Admin / Member), server-side validation alerts. |
| **View 3: Admin Facility Overview** *(Page 7)* | `/admin` & `/admin/dashboard` | Key metric cards (1,248 Total Members, 982 Active Plans, $245.8K Revenue, Live Status), Live Broadcast Dispatch Box (Socket.IO), Classes table, Bookings table, Member Directory with Search & Status/Tier filters, Membership Tier CRUD management tab. |
| **View 4: Member Portal & Dashboard** *(Page 8 & 9)* | `/member/dashboard` & `/my-bookings` | 4 integrated sub-views:<br>• **Overview (Page 8 Top):** VIP Elite status card, Days Remaining, Renew Subscription modal, Live Announcements feed.<br>• **Bookings & Calendar (Page 9):** Interactive Calendar grid with session dots, upcoming sessions cards (Personal Training with Marcus T., Recovery Protocol), Cancel/Reschedule buttons, "+ Book New Session".<br>• **Performance Analytics (Page 8 Bottom):** Weekly Volume (24.5k), HR Recovery (42 bpm/min), Strength Index (94.2), 6-Month Strength Progression SVG curve, Personal Records, 96% Consistency Elite Tier.<br>• **Profile & Contacts (Module 2):** Edit personal phone, emergency contacts (Name, Phone, Relation), and membership validity dates. |

---

## 3. Step-by-Step Screen-Sharing Demonstration (Two-Tab Walkthrough)

> **Pro-Tip for Sharing:** Open two browser windows side-by-side:
> - **Left Window:** Member or Non-Member Portal at `http://localhost:5173/member/dashboard`
> - **Right Window:** Admin Facility Overview at `http://localhost:5173/admin/dashboard`

### Available Demo Accounts (1-Click Fill on Login Screen):
| Role / Tier | Email | Password | Status & Validity |
|---|---|---|---|
| **Admin** | `admin@gymhub.com` | `password123` | Full admin control, broadcast transmission & facility metrics |
| **VIP Elite Tier ($10,000/yr)** | `vip@gymhub.com` | `password123` | Active • 365 Days Left • All-inclusive lounge & recovery |
| **Annual Pass ($3,500/yr)** | `annual@gymhub.com` | `password123` | Active • 365 Days Left • Unlimited classes & saunas |
| **Classic Pass ($350/mo)** | `classic@gymhub.com` | `password123` | Active • 30 Days Left • Main gym floor & group sessions |
| **Non-Member (Guest)** | `guest@gymhub.com` | `password123` | Inactive • 0 Days Left • Prompts to activate membership pass |
| **Expired Member** | `expired@gymhub.com` | `password123` | Expired • 0 Days Left • Prompts to renew membership pass |

### Step 1: Explain the Architecture & Local MongoDB
1. Say: *"Our project is the Gym Membership Management System, built following the exact MERN architecture, real-time WebSockets, and wireframe designs from my Experiment 0 project report."*
2. Mention: *"The server connects to our local MongoDB instance on port 27017 via Mongoose ODM, utilizing compound unique indexes for referential integrity."*

### Step 2: Demonstrate Authentication & Role Guard (RBAC)
1. In an Incognito window, try visiting `http://localhost:5173/admin/dashboard`.
   - **Show:** The user is immediately blocked by `<ProtectedRoute>` and redirected to `/login` with an alert.
2. In `/login`, show the tabbed switcher (`Member Login` / `Request Access`) and the 1-Click quick fill buttons.
3. Log in as Member on Left Window and Admin on Right Window.

### Step 3: Demonstrate Real-Time Trigger 1 (Live Admin Broadcast)
1. On the **Right Tab (Admin)**, scroll to the **Live Facility Broadcast** box.
2. Type: `"Facility reminder: Olympic lap pool closes at 8 PM today for deep maintenance."`
3. Click **⚡ Transmit Broadcast**.
4. **Watch the Left Tab (Member) immediately:**
   - The **Notification Bell (`🔔`)** flashes an unread counter `(1)`.
   - The live announcement drawer updates in real-time without refreshing!

### Step 4: Demonstrate Real-Time Trigger 2 (Class Creation & Live Slot Booking)
1. On the **Right Tab (Admin)**, click **+ Add New Class**, create a class with capacity `10`.
2. On the **Left Tab (Member)**, go to `/classes`:
   - Member reserves a spot: available slots decrement from 10 to 9 in real time.
   - Admin Bookings table receives the reservation instantly via WebSocket.

### Step 5: Demonstrate Compound Index (Duplicate Prevention)
1. Explain to the teacher:
   - *"Even if a user tries to double-click or bypass frontend validation, our Mongoose schema enforces `{ user: 1, gymClass: 1 }` as a compound unique index in MongoDB, physically rejecting duplicate bookings."*

### Step 6: Demonstrate Member Portal Views (Page 8 & 9 Wireframes)
1. On the Member Portal (`/member/dashboard`):
   - Click **Bookings & Calendar**: Show the interactive October calendar grid and upcoming session cards.
   - Click **Performance Analytics**: Show the 24.5k volume metric, HR Recovery, and the 6-Month Strength Progression SVG curve.
   - Click **Renew Subscription**: Choose a tier and extend validity by 365 days; show the validity counter updating live in MongoDB!

### Step 7: Demonstrate Postman API Collection
1. Open Postman, import `GymHub_Postman_Collection.json`.
2. Run **4.1 Test Registration Validation** → Show HTTP 400 Bad Request with field errors.
3. Run **4.4 Test Role Guard** → Show HTTP 403 Forbidden when a member tries to access admin routes.
4. Run **5.1 Get All Tiers** → Show the 3 tiers stored in MongoDB.

---

## 4. Answers to Expected Faculty Questions

### Q1: "Have you applied JWT?"
> **Answer:**  
> *"Yes, professor. We use stateless JSON Web Tokens (JWT). When a user registers or logs in, our Node.js server signs a token containing `{ id, role }` using `jsonwebtoken` with a 30-day expiration.  
> On every protected API call, Axios attaches the token as `Authorization: Bearer <token>`. The backend `protect` middleware verifies the token signature, checks if the user exists in MongoDB, and attaches `req.user`. The `admin` middleware enforces Role-Based Access Control (RBAC) by requiring `req.user.role === 'admin'`."*

---

### Q2: "Are you doing data validation?"
> **Answer:**  
> *"Yes, we use a two-tier validation approach:  
> 1. **Request Middleware:** `express-validator` sanitizes and validates inputs before reaching controllers (e.g., email format, minimum 6-character passwords, ISO dates, capacity between 1–500, valid MongoDB ObjectIds).  
> 2. **Database Schema Constraints:** Mongoose enforces schema validations, enum restrictions, and a compound unique index `{ user: 1, gymClass: 1 }` to prevent duplicate bookings."*

---

### Q3: "Have you deployed it / Docker containerization?"
> **Answer:**  
> *"Yes, the project is fully containerized and production-ready:  
> • **Docker & Docker Compose:** `docker-compose.yml` orchestrates 3 services: the React client (built with Vite and served via Nginx), the Express API server (Node 20 Alpine), and a MongoDB database container with persistent data volumes.  
> • **Production Build:** The frontend compiles using `npm run build` with Vite code-splitting and asset compression.  
> • **DevOps CI Pipeline:** Configured with GitHub Actions (`.github/workflows/ci.yml`) to automatically test and build on push."*

---

### Q4: "Which React applications / architecture are you using?"
> **Answer:**  
> *"We are using **React 19** with **Vite 8** for optimal performance.  
> • **State Management:** React Context API with two dedicated contexts: `AuthContext` (`useAuth`) for user sessions and `SocketContext` (`useSocket`) for WebSocket connection state and push notifications.  
> • **Routing:** React Router DOM v7 with protected navigation guards (`<ProtectedRoute>`).  
> • **Real-Time Integration:** Socket.IO client singleton synchronized with component lifecycles.  
> • **Styling:** Tailwind CSS v4 with custom responsive layouts matching our wireframes."*

---

## 5. Docker Desktop Demonstration Guide

The entire GymHub application is 100% containerized with Docker and Docker Compose.

### Running Containers in Docker Desktop:
```powershell
# Build and start all 3 services in the background
docker compose up -d

# Seed the containerized database with classes and demo users
docker compose exec server node seed.js

# Verify all containers are healthy and running
docker ps
```

### Container Architecture:
| Container Name | Base Image | Port Mapping | Responsibility |
|---|---|---|---|
| `gymhub_client` | `nginx:alpine` (Multi-stage Node 20) | `5173:80` | Serves compiled React production bundle + reverse proxies `/api/` & `/socket.io/` to backend. |
| `gymhub_server` | `node:20-alpine` | `5000:5000` | Express REST API server + Socket.IO real-time notification engine. |
| `gymhub_mongo` | `mongo:6-jammy` | `27018:27017` | Isolated MongoDB database with persistent volume `mongo_data` (avoids host port 27017 collision). |

### Demonstrating in Viva:
1. Open **Docker Desktop** on Windows.
2. Click **Containers** in the left sidebar.
3. Show the **`gymprojectforcaollage`** stack with 3 green running indicators:
   - `gymhub_client`
   - `gymhub_server`
   - `gymhub_mongo`
4. Open your browser to `http://localhost:5173`. Everything loads completely from inside Docker!

---

## 6. Cloud Deployment Architecture (Vercel + Render + MongoDB Atlas)

### Can you deploy the entire project to Vercel?
- **Frontend (Client):** **YES, 100% supported!** Vercel is specifically built for frontend React/Vite SPAs.
- **Backend (Server) & Socket.IO:** **Vercel is serverless** and does NOT maintain persistent WebSocket connections required by Socket.IO. Therefore, deploying the Node.js backend to a persistent container service like **Render** or **Railway** is the industry-standard design.
- **Database (MongoDB):** MongoDB requires a persistent database service. We use **MongoDB Atlas** (100% free cloud cluster).

### Free Cloud Deployment Steps:

#### Step 1: Deploy Database on MongoDB Atlas (Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create an **M0 Free Cluster** (Shared, AWS / Mumbai region).
3. Under **Database Access**, create a user `gymadmin` with a password.
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://gymadmin:<password>@cluster0.xxxxx.mongodb.net/gym-management?retryWrites=true&w=majority
   ```

#### Step 2: Deploy Backend to Render (Free)
1. Push your project code to GitHub.
2. Sign in to [render.com](https://render.com) with GitHub.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Add **Environment Variables** in Render dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET` = `gym_super_secret_jwt_key_2026_het_bhanushali`
   - `CLIENT_URL` = `https://<your-vercel-app-name>.vercel.app`
7. Click **Deploy Web Service**. You will receive your backend URL:
   `https://gymhub-backend.onrender.com`

#### Step 3: Deploy Frontend to Vercel (Free)
1. Sign in to [vercel.com](https://vercel.com) with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://gymhub-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://gymhub-backend.onrender.com`
6. Click **Deploy**. Vercel will build and assign you a global domain:
   `https://gymhub-frontend.vercel.app`
7. *(Note: Our `client/vercel.json` and root `vercel.json` have already been created with SPA rewrites to ensure deep routing like `/classes` or `/admin/dashboard` never produces 404 errors on refresh!)*

---

## 5. Live Production Deployment Information

| Service | Host / Platform | Live Endpoint / Connection |
|---|---|---|
| **Frontend (Client)** | **Vercel** | [https://gymhub-het.vercel.app](https://gymhub-het.vercel.app) |
| **Backend (API & WebSockets)** | **Render (Docker Container)** | [https://gymhub-management-system.onrender.com](https://gymhub-management-system.onrender.com) |
| **Cloud Database** | **MongoDB Atlas** | `cluster0.jecnqcc.mongodb.net/gym-management` (AWS Mumbai `ap-south-1`) |
| **GitHub Repository** | **GitHub** | [https://github.com/hetbhanushali28-cell/gymhub-management-system](https://github.com/hetbhanushali28-cell/gymhub-management-system) |

---

## 6. Viva Theory Masterclass: State Management & React Hooks

### Q1: What is State Management in React, and why is it needed?
**Answer:**
State is dynamic data inside a component that determines what gets rendered on the screen. Whenever state changes, React automatically re-evaluates the component virtual DOM and re-renders the UI with the updated data.

### Q2: What are the 4 Types of State in React?
1. **Local Component State:** State managed exclusively inside a single component using `useState` (e.g., `menuOpen` in `Navbar`, `searchQuery` in `Classes`, or form input states).
2. **Global / Shared State:** Data needed across multiple components in different parts of the component tree (e.g., currently authenticated user in `AuthContext`, or live notifications in `SocketContext`).
3. **Server / Remote State:** Data fetched from a database or API over HTTP (e.g., class listings, member records, and bookings in MongoDB).
4. **URL / Route State:** State maintained in the browser address bar query params or pathname using `react-router-dom` (e.g., `?tier=VIP%20Elite`, `/admin/dashboard`).

### Q3: What is "Prop Drilling" and how does GymHub solve it?
**Answer:**
Prop drilling occurs when you have to pass props down through multiple layers of intermediate components that do not actually need the data, just to reach a deeply nested child component.  
**GymHub Solution:** We use **React Context API** (`createContext` + `useContext`). By wrapping the top-level `<App>` with `<AuthProvider>` and `<SocketProvider>`, any component anywhere in the tree can consume `user`, `login()`, `logout()`, or `socket` directly with one custom hook (`useAuth()` or `useSocket()`) without any prop drilling!

### Q4: React Context API vs. Redux: Why did you choose Context API?
**Answer:**
Redux adds substantial boilerplate (actions, reducers, dispatchers, store configuration). For a medium-scale MERN project like GymHub, React Context API is built directly into React core, provides zero extra bundle overhead, is lightweight, and perfectly handles our authentication sessions and real-time socket connections.

---

## 7. Viva Theory Masterclass: WebSockets & Socket.IO Real-Time Engine

### Q1: What is the difference between standard HTTP and WebSockets?
| Feature | Traditional HTTP (REST) | WebSockets (Socket.IO) |
|---|---|---|
| **Protocol** | `http://` or `https://` | `ws://` or `wss://` |
| **Connection Model** | Request-Response (Half-duplex). Client requests, server responds, connection closes. | Persistent Full-Duplex TCP connection. Stays open continuously. |
| **Latency** | High overhead (headers sent with every single request, requires polling). | Ultra-low latency (sub-50ms message packets over open socket). |
| **Server-Push** | Impossible without long-polling or SSE. | Native bidirectional push. Server can send messages to clients at any millisecond. |

### Q2: How does the Admin see a new booking in real time when a Member reserves a class?
**Answer:**
1. A member logs into `https://gymhub-het.vercel.app` on their phone or browser and clicks **"Reserve Spot"** on a class.
2. The browser sends a `POST /api/bookings` request to the Render backend.
3. The Express controller verifies the user's active membership pass and database capacity in MongoDB Atlas.
4. If valid, the backend saves the new booking to MongoDB, decrements the available slots, and immediately triggers:
   ```javascript
   req.io.emit("booking_created", populatedBooking);
   req.io.emit("class_capacity_updated", { classId, availableSlots });
   req.io.emit("notification", { type: "booking_created", title: "New Booking Alert", ... });
   ```
5. On the Admin's device, the Socket.IO client catches `booking_created` and `notification`:
   - It appends the new booking to the top of the Bookings table with a pulsing emerald highlight.
   - It updates the live available slot counters and utilization metrics without needing a page refresh!
   - A floating `LiveToast` banner flashes across the screen notifying the admin of the reservation.

---

## 8. Mobile Responsiveness & Chrome UI/UX Optimization

1. **Fluid Responsive Grids:**
   - On desktop: Multi-column layouts (4-column metric cards, 3-column class cards).
   - On smartphone: Clean 1-column cards and 2x2 tab navigation (`grid grid-cols-2 sm:flex sm:flex-wrap`) for touch-friendly ergonomics.
2. **Horizontal Table Swiping (`overflow-x-auto` + `min-w-[640px]`):**
   - Data tables on smartphones retain their comfortable spacing without columns collapsing.
   - An intuitive mobile indicator ("👉 Swipe horizontally for full table") guides phone users.
3. **Mobile Dropdowns & Notification Bell:**
   - On mobile screens, the notification bell uses viewport-relative positioning (`fixed inset-x-3 top-16`) with an explicit "✕" close button and `touchstart` support to ensure one-tap dismissal on iOS Safari and Android Chrome.
4. **Touch Targets:**
   - All interactive controls have minimum 44px tap targets adhering to Apple HIG and Google Material guidelines.
5. **Ultra-Narrow Screen Safety (down to 320px):**
   - Replaced fixed widths with fluid responsive padding (`px-3 sm:px-6`, `p-4 sm:p-8`).
   - Dynamic typography (`text-xl sm:text-2xl sm:text-3xl break-words`) prevents brand title clipping.
   - Reflowed 1-Click demo fill items into a 1-column layout on viewports under 380px (`grid-cols-1 min-[380px]:grid-cols-2`) to eliminate button overlap on split-screen or narrow devices.

---

## 9. Viva Theory Masterclass: Data Validation & Role-Based Access Control (RBAC)

### Q1: How does GymHub perform Data Validation?
**Answer:**
We implement dual-layer data validation:
1. **Frontend Validation:** Form checks on React (`onChange`, `onSubmit`, email regex, password minimum lengths) providing instant feedback before network dispatch.
2. **Backend Validation (`express-validator`):** Middleware chains on Express routes (`registerValidator`, `loginValidator`, `createBookingValidator`, `createClassValidator`, `createTierValidator`, `updateProfileValidator`, `renewMembershipValidator`).
   - Standardized 400 response format: `{ success: false, message: "Validation failed", errors: [{ field, message }] }`.
   - Protects database from malformed payloads, injection, and invalid data types.

### Q2: How does Role-Based Access Control (RBAC) work in GymHub?
**Answer:**
We enforce 3 clear tiers of authorization:
1. **Admin (`role: "admin"`):**
   - Verified via `protect` + `admin` middleware on routes (`POST /api/classes`, `DELETE /api/classes/:id`, `GET /api/bookings`, `GET /api/auth/members`, `POST /api/tiers`).
   - Prohibited from reserving member spots via `requireActiveMembership` (returns HTTP 403: *"Administrators cannot book member classes"*).
2. **Active Member (`role: "user"` with Active Pass):**
   - Verified via `protect` + `requireActiveMembership` middleware on `POST /api/bookings`.
   - Requires `membershipStatus: "Active"`, `daysRemaining > 0`, and valid expiry date.
3. **Non-Member / Guest (`membershipTier: "Non-Member"`):**
   - Can view the live schedule and facility info.
   - Class reservations are strictly blocked on the backend with HTTP 403 (`{ success: false, requiresMembership: true }`).
   - On the frontend, reservation buttons are locked (`🔒 Reserve (Membership Required)`) and prompt the user to activate a membership pass.



