# Phase 3 & 4: Real-Time Engine, Notifications & Premium UI/UX - Plan

## Phase Objective
Implement real-time bidirectional communication via Socket.IO, live slot synchronization across multiple tabs, live NotificationBell in Navbar, Search & Filter capabilities, and complete viva presentation artifacts.

---

## Evaluation Criteria Addressed
- **Real-Time Features (Socket.IO)**: WebSocket connection, triggers for class creation, updates, deletions, and bookings; live notification bell with badge counter.
- **Frontend with Tailwind**: Modern UI with Tailwind CSS v4, responsive Navbar, reusable `NotificationBell`, `Modal`, `Button`, and search/filter controls.
- **React & State Management**: Socket event synchronization with React state, optimistic updates, and multi-tab live sync.
- **Viva & Walkthrough Readiness**: Two-tab demonstration flow, Postman collection for API demonstration, and answers to expected faculty questions.

---

## Tasks Breakdown

### Task 1: Backend Real-Time Triggers & Notifications
- Update `classController.js` and `bookingController.js` to emit rich `notification` and `class_capacity_updated` events whenever:
  - An admin creates, updates, or deletes a class.
  - A member books or cancels a class spot.

### Task 2: Client Socket Service & NotificationBell Component
- Create `client/src/services/socket.js` for single-instance socket connection.
- Create `client/src/components/NotificationBell.jsx` with real-time audio/visual alert, unread count pill, and drop-down menu with timestamps.
- Integrate `NotificationBell` into `client/src/components/Navbar.jsx`.

### Task 3: Real-Time Classes Page with Search & Filter
- Update `client/src/pages/Classes.jsx`:
  - Instant search bar (title and instructor).
  - Category and difficulty filter chips.
  - Socket listeners for `class_capacity_updated`, `class_created`, `class_deleted` to update classes without page refresh.
- Update `ClassCard.jsx` with dynamic remaining slot badges ("X spots left", "Class Full").

### Task 4: Real-Time Admin Dashboard Polish
- Add live metrics (Total Classes, Total Bookings, Capacity utilization).
- Socket listener to automatically append/remove bookings in the Admin table when members book or cancel in another tab.

### Task 5: Postman Collection & Viva Walkthrough Guide
- Generate `GymHub_Postman_Collection.json` with all endpoints, sample payloads, and JWT Bearer tokens for Postman middleware/API demonstration.
- Create `docs/VIVA_WALKTHROUGH_GUIDE.md` with the exact two-tab screen sharing script and answers to faculty questions.

---

## Verification Criteria
- [ ] Opening member and admin in two separate browser tabs shows real-time capacity updates without page refresh.
- [ ] Notification bell rings and displays notification card when actions occur.
- [ ] Search and category filters work smoothly.
- [ ] Postman collection imports cleanly.

