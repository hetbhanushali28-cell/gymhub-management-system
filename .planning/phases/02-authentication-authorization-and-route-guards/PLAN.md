# Phase 2: Authentication, Authorization & Route Guards - Plan

## Phase Objective
Solidify end-to-end authentication and role-based authorization: eliminate server auth middleware bugs, introduce client-side Route Guard components (`ProtectedRoute.jsx`), implement an Axios 401 response interceptor for session cleanup, and provide seamless login redirects with validation error handling.

---

## Evaluation Criteria Addressed
- **Authentication & Authorization**: Secure JWT generation and verification, robust `protect` & `admin` middleware, and role-based access control (RBAC).
- **React & State Management**: Global `AuthContext` state synchronization, client-side route protection, and auth redirection state.

---

## Tasks Breakdown

### Task 1: Server-Side Auth & Authorization Hardening
- **Target Files:**
  - `server/middleware/authMiddleware.js`
  - `server/utils/generateToken.js`
  - `server/controllers/authController.js`
- **Actions:**
  1. Fix `authMiddleware.js`:
     - Guarantee early `return` on 401 responses to eliminate "Cannot set headers after they are sent to the client" errors.
     - Check if `User.findById` actually returned a user; if user no longer exists, return 401.
     - Return standardized `{ success: false, message: "Not authorized, token failed" }`.
  2. Update `generateToken.js` to sign `{ id, role }` with 30-day expiration.
  3. Ensure `loginUser` and `registerUser` return consistent payload: `{ success: true, _id, name, email, role, token }`.

### Task 2: Client-Side Route Guards (`ProtectedRoute.jsx`)
- **Target Files:**
  - `client/src/components/ProtectedRoute.jsx`
  - `client/src/App.jsx`
- **Actions:**
  1. Create `client/src/components/ProtectedRoute.jsx`:
     - Access `user` and `loading` from `useAuth()`.
     - Render full-screen loading spinner while `loading` is true to avoid false redirects on page refresh.
     - If unauthenticated, redirect to `/login` preserving intended destination: `<Navigate to="/login" state={{ from: location }} replace />`.
     - If `requiredRole="admin"` and `user.role !== "admin"`, redirect to `/` with alert or navigate home.
  2. In `client/src/App.jsx`:
     - Wrap `/my-bookings` with `<ProtectedRoute>`.
     - Wrap `/admin` with `<ProtectedRoute requiredRole="admin">`.
     - Remove redundant redirection boilerplate from `AdminDashboard.jsx` and `MyBookings.jsx`.

### Task 3: Axios Auto-Logout & Session Interceptor
- **Target Files:**
  - `client/src/services/api.js`
  - `client/src/context/AuthContext.jsx`
- **Actions:**
  1. Add response interceptor in `api.js`:
     - If an API call receives HTTP 401 and the request was not to `/auth/login`, purge `localStorage.removeItem("user")` and redirect to `/login?session_expired=true`.
  2. Update `AuthContext.jsx`:
     - Listen to storage events or session invalidation to keep state synchronized across tabs.

### Task 4: Login, Register & Navigation Polish
- **Target Files:**
  - `client/src/pages/Login.jsx`
  - `client/src/pages/Register.jsx`
- **Actions:**
  1. In `Login.jsx`:
     - Redirect to `location.state?.from?.pathname || "/"` after successful login.
     - Display server validation error array if present.
  2. In `Register.jsx`:
     - Display detailed validation feedback from `express-validator` (e.g. "Password must be at least 6 characters").
  3. Verify the full auth cycle:
     - Direct URL access to `/admin` without login -> redirects to `/login`.
     - Login as member user -> member cannot access `/admin`.
     - Login as admin user -> full access to `/admin`.
     - Logout removes token and locks down protected routes immediately.

---

## Verification Criteria
- [ ] Server `protect` middleware blocks requests with no token or invalid tokens with HTTP 401.
- [ ] Server `admin` middleware blocks non-admin users with HTTP 403.
- [ ] Unauthenticated browser visit to `/my-bookings` or `/admin` redirects to `/login` without flicker.
- [ ] Non-admin user cannot access `/admin` and is redirected home.
- [ ] Logging in redirects the user back to the page they originally attempted to visit.
- [ ] Expired/invalid token in `localStorage` triggers auto-logout and clean redirect.

