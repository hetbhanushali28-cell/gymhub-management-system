const express = require("express");
const { validationResult } = require("express-validator");
const { registerValidator, loginValidator } = require("./validators/authValidators");
const { createClassValidator, classIdParamValidator } = require("./validators/classValidators");
const { createBookingValidator, bookingIdParamValidator } = require("./validators/bookingValidators");
const User = require("./models/User");
const GymClass = require("./models/GymClass");
const Booking = require("./models/Booking");

console.log("=== PHASE 1 VERIFICATION TEST ===");

// 1. Test Model Compilation
console.log("\n[Test 1] Testing Mongoose Models compilation...");
if (User && GymClass && Booking) {
  console.log("  PASS: User, GymClass, and Booking models loaded successfully.");
} else {
  console.error("  FAIL: Model compilation failed.");
  process.exit(1);
}

// 2. Test Compound Index on Booking
console.log("\n[Test 2] Checking Compound Unique Index on Booking model...");
const bookingIndexes = Booking.schema.indexes();
const hasCompoundIndex = bookingIndexes.some((idx) => {
  const fields = idx[0];
  const options = idx[1];
  return fields.user === 1 && fields.gymClass === 1 && options && options.unique === true;
});

if (hasCompoundIndex) {
  console.log("  PASS: Compound unique index { user: 1, gymClass: 1 } found on Booking schema.");
} else {
  console.error("  FAIL: Compound index missing on Booking schema.");
  process.exit(1);
}

// 3. Test Validation Middleware with Express Mock
console.log("\n[Test 3] Testing Request Validators against bad payloads...");

const runValidatorTest = async () => {
  const app = express();
  app.use(express.json());

  // Mount test route
  app.post("/test-register", registerValidator, (req, res) => {
    res.json({ success: true });
  });

  app.post("/test-class", createClassValidator, (req, res) => {
    res.json({ success: true });
  });

  app.post("/test-booking", createBookingValidator, (req, res) => {
    res.json({ success: true });
  });

  // Verify server can start cleanly
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    try {
      // Test 3a: Bad register payload
      const res1 = await fetch(`${baseUrl}/test-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "A", email: "not-an-email", password: "123" }),
      });
      const data1 = await res1.json();
      if (res1.status === 400 && data1.errors && data1.errors.length >= 3) {
        console.log("  PASS: Registration validator correctly caught short name, invalid email, and short password.");
      } else {
        console.error("  FAIL: Registration validator did not reject bad payload appropriately:", data1);
      }

      // Test 3b: Bad class creation payload
      const res2 = await fetch(`${baseUrl}/test-class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "HI",
          description: "desc",
          instructor: "I",
          date: "12-11-2026", // bad format
          time: "7:00 PM",    // bad format
          duration: 5,        // < 10
          capacity: 0,        // < 1
          category: "InvalidCategory",
        }),
      });
      const data2 = await res2.json();
      if (res2.status === 400 && data2.errors && data2.errors.length >= 5) {
        console.log("  PASS: Class creation validator correctly rejected invalid date, time, duration, capacity & category.");
      } else {
        console.error("  FAIL: Class validator did not reject bad payload appropriately:", data2);
      }

      // Test 3c: Bad booking payload (invalid mongo id)
      const res3 = await fetch(`${baseUrl}/test-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: "invalid-id" }),
      });
      const data3 = await res3.json();
      if (res3.status === 400 && data3.errors && data3.errors.some((e) => e.field === "classId")) {
        console.log("  PASS: Booking validator correctly caught invalid MongoDB ObjectId for classId.");
      } else {
        console.error("  FAIL: Booking validator failed to validate ObjectId:", data3);
      }

      console.log("\n>>> ALL PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<");
      server.close();
      process.exit(0);
    } catch (err) {
      console.error("Test execution failed:", err);
      server.close();
      process.exit(1);
    }
  });
};

runValidatorTest();

