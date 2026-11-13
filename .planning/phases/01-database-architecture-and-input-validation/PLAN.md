# Phase 1: Database Architecture & Input Validation - Plan

## Phase Objective
Harden MongoDB models with integrity constraints, implement a centralized request validation layer using `express-validator`, enhance controller queries with computed available slots, and standardize REST API error responses.

---

## Evaluation Criteria Addressed
- **MongoDB & Mongoose**: Schema validation, compound unique index on `{ user: 1, gymClass: 1 }`, orphan cleanup on class deletion.
- **Data Validation**: Request validation layer for Auth, Class, and Booking endpoints using `express-validator`.
- **Backend REST API**: Structured error handling, HTTP status codes (201, 400, 401, 403, 404), and computed `availableSlots` in class listings.

---

## Tasks Breakdown

### Task 1: Validation Layer Setup (`express-validator`)
- **Action:**
  1. Add `express-validator` to `server/package.json` and install.
  2. Create `server/middleware/validate.js` to extract `validationResult(req)` and return consistent 400 responses:
     ```json
     {
       "success": false,
       "message": "Validation Error",
       "errors": [
         { "field": "email", "message": "Please provide a valid email address" }
       ]
     }
     ```
  3. Create validator modules:
     - `server/validators/authValidators.js`: Registration (name, email, min 6 char password) and login validations.
     - `server/validators/classValidators.js`: Title, instructor, valid ISO date, time, duration (positive number), capacity (min 1), category, difficulty.
     - `server/validators/bookingValidators.js`: Mongo ID format validation for class IDs.
  4. Mount validator chains on `authRoutes.js`, `classRoutes.js`, and `bookingRoutes.js`.

### Task 2: Schema Hardening & Database Constraints
- **Action:**
  1. Update `server/models/Booking.js`:
     - Add compound unique index `{ user: 1, gymClass: 1 }` to enforce single booking per user per class at the database layer.
     - Add index on `{ gymClass: 1 }` for high-performance capacity queries.
  2. Update `server/models/GymClass.js`:
     - Add lowercase/trim sanitize modifiers.
     - Add schema options `{ toJSON: { virtuals: true }, toObject: { virtuals: true } }`.
  3. Update `server/models/User.js`:
     - Ensure email lowercase and trimmed.

### Task 3: Controller Enhancements & Referential Cleanup
- **Action:**
  1. In `server/controllers/classController.js`:
     - Update `getClasses` to include computed `bookedCount` and `availableSlots` for each class.
     - Update `deleteClass` to automatically cascade-delete associated bookings (`Booking.deleteMany({ gymClass: classId })`).
  2. In `server/controllers/bookingController.js`:
     - In `createBooking`, catch Mongo 11000 duplicate key error and return friendly "Already booked for this class" message.
  3. In `server/middleware/errorMiddleware.js`:
     - Catch Mongoose `CastError` (invalid ObjectId) -> 400 Bad Request.
     - Catch Mongoose duplicate key `11000` -> 400 Conflict/Bad Request.
     - Catch Mongoose `ValidationError` -> 400 Bad Request.

### Task 4: Seed Data & Verification
- **Action:**
  1. Update `server/seed.js` with consistent seed data testing the new fields and compound indexes.
  2. Verify:
     - Invalid request payloads receive structured 400 errors.
     - Valid request payloads pass validation and create records.
     - Duplicate bookings are rejected.
     - Deleting a class cleans up associated bookings.
     - Class listing includes accurate remaining spots.

---

## Verification Criteria
- [ ] `express-validator` installed and active on all mutating routes.
- [ ] Attempting to send `{ email: "invalid", password: "123" }` to `/api/auth/register` returns 400 with descriptive error array.
- [ ] Attempting to book the same class twice returns 400.
- [ ] `GET /api/classes` returns each class with `bookedCount` and `availableSlots`.
- [ ] Deleting a gym class removes any associated bookings.

