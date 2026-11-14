const assert = require("assert");
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_2026";

// Load Validators
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  renewMembershipValidator,
} = require("./validators/authValidators");
const {
  createBookingValidator,
  bookingIdParamValidator,
} = require("./validators/bookingValidators");
const {
  createClassValidator,
  updateClassValidator,
  classIdParamValidator,
} = require("./validators/classValidators");
const {
  createTierValidator,
  updateTierValidator,
  tierIdParamValidator,
} = require("./validators/tierValidators");

// Load Middlewares
const {
  protect,
  admin,
  requireActiveMembership,
} = require("./middleware/authMiddleware");

// Helper to mock res object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

// Helper to execute express-validator middleware chain in-memory
const runValidatorChain = async (middlewares, req) => {
  const res = createMockRes();
  let nextCalled = false;

  for (const fn of middlewares) {
    let advanced = false;
    await fn(req, res, () => {
      advanced = true;
    });
    if (!advanced) {
      // Middleware responded directly (e.g. validateRequest on error)
      return { res, nextCalled: false };
    }
  }

  return { res, nextCalled: true };
};

let passedCount = 0;
let totalCount = 0;

const test = async (name, fn) => {
  totalCount++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
};

const runAllTests = async () => {
  console.log("=== COMPREHENSIVE INPUT VALIDATION & RBAC TEST SUITE ===\n");

  // SECTION 1: AUTH VALIDATORS
  console.log("--- Section 1: Auth Validators ---");

  await test("registerValidator rejects empty body with HTTP 400 and structured errors", async () => {
    const req = { body: {} };
    const { res, nextCalled } = await runValidatorChain(registerValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Validation failed");
    assert(Array.isArray(res.body.errors));
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("name"));
    assert(fields.includes("email"));
    assert(fields.includes("password"));
  });

  await test("registerValidator rejects invalid membershipTier with HTTP 400", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        membershipTier: "InvalidTierName",
      },
    };
    const { res, nextCalled } = await runValidatorChain(registerValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const tierError = res.body.errors.find((e) => e.field === "membershipTier");
    assert(tierError, "Should contain error for membershipTier");
    assert(tierError.message.includes("Membership tier must be"));
  });

  await test("registerValidator passes valid payload", async () => {
    const req = {
      body: {
        name: "Alexander Sterling",
        email: "alexander@elite.com",
        password: "securePassword123",
        role: "user",
        membershipTier: "VIP Elite",
      },
    };
    const { res, nextCalled } = await runValidatorChain(registerValidator, req);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, 200);
  });

  await test("loginValidator rejects missing email and password", async () => {
    const req = { body: {} };
    const { res, nextCalled } = await runValidatorChain(loginValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("email"));
    assert(fields.includes("password"));
  });

  await test("loginValidator passes valid credentials", async () => {
    const req = { body: { email: "user@example.com", password: "password123" } };
    const { res, nextCalled } = await runValidatorChain(loginValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  await test("updateProfileValidator rejects invalid phone and emergency contact", async () => {
    const req = {
      body: {
        phone: "12", // too short (min 5)
        emergencyContact: "not-an-object",
        password: "123", // too short (min 6)
      },
    };
    const { res, nextCalled } = await runValidatorChain(updateProfileValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("phone"));
    assert(fields.includes("emergencyContact"));
    assert(fields.includes("password"));
  });

  await test("updateProfileValidator passes valid partial update", async () => {
    const req = {
      body: {
        name: "Alexander Updated",
        phone: "+1-555-0199",
        emergencyContact: {
          name: "Jane Sterling",
          phone: "+1-555-0200",
          relation: "Spouse",
        },
      },
    };
    const { res, nextCalled } = await runValidatorChain(updateProfileValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  await test("renewMembershipValidator rejects invalid tier and invalid additionalDays", async () => {
    const req = {
      body: {
        tier: "SuperUltraPass",
        additionalDays: -30,
      },
    };
    const { res, nextCalled } = await runValidatorChain(renewMembershipValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("tier"));
    assert(fields.includes("additionalDays"));
  });

  await test("renewMembershipValidator passes valid renewal payload", async () => {
    const req = {
      body: {
        tier: "Annual",
        additionalDays: 365,
      },
    };
    const { res, nextCalled } = await runValidatorChain(renewMembershipValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  // SECTION 2: BOOKING VALIDATORS
  console.log("\n--- Section 2: Booking Validators ---");

  await test("createBookingValidator rejects missing or malformed classId", async () => {
    const req = { body: { classId: "invalid-id" } };
    const { res, nextCalled } = await runValidatorChain(createBookingValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.errors[0].field, "classId");
  });

  await test("createBookingValidator passes valid MongoId", async () => {
    const req = { body: { classId: "507f1f77bcf86cd799439011" } };
    const { res, nextCalled } = await runValidatorChain(createBookingValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  await test("bookingIdParamValidator rejects invalid param ID", async () => {
    const req = { params: { id: "not-a-mongo-id" } };
    const { res, nextCalled } = await runValidatorChain(bookingIdParamValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.errors[0].field, "id");
  });

  // SECTION 3: CLASS VALIDATORS
  console.log("\n--- Section 3: Class Validators ---");

  await test("createClassValidator rejects invalid date format and unknown category", async () => {
    const req = {
      body: {
        title: "HIIT Blast",
        description: "High intensity interval workout",
        instructor: "Coach Dan",
        date: "2026/11/14", // Should be YYYY-MM-DD
        time: "99:99", // Invalid time
        duration: 5, // Min is 10
        capacity: 0, // Min is 1
        category: "ExtremeArchery", // Invalid category
      },
    };
    const { res, nextCalled } = await runValidatorChain(createClassValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("date"));
    assert(fields.includes("time"));
    assert(fields.includes("duration"));
    assert(fields.includes("capacity"));
    assert(fields.includes("category"));
  });

  await test("createClassValidator passes valid class payload", async () => {
    const req = {
      body: {
        title: "Morning Vinyasa Flow",
        description: "Energizing yoga sequence for strength and flexibility.",
        instructor: "Elena Rostova",
        date: "2026-11-20",
        time: "08:30",
        duration: 60,
        capacity: 25,
        category: "Yoga",
        difficulty: "Intermediate",
      },
    };
    const { res, nextCalled } = await runValidatorChain(createClassValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  await test("classIdParamValidator validates mongo ID parameter", async () => {
    const badReq = { params: { id: "123" } };
    const goodReq = { params: { id: "507f1f77bcf86cd799439011" } };
    const badRes = await runValidatorChain(classIdParamValidator, badReq);
    const goodRes = await runValidatorChain(classIdParamValidator, goodReq);
    assert.strictEqual(badRes.nextCalled, false);
    assert.strictEqual(badRes.res.statusCode, 400);
    assert.strictEqual(goodRes.nextCalled, true);
  });

  // SECTION 4: TIER VALIDATORS
  console.log("\n--- Section 4: Tier Validators ---");

  await test("createTierValidator rejects negative price and invalid billingPeriod", async () => {
    const req = {
      body: {
        name: "T", // too short (min 2)
        price: -50, // invalid (must be >= 0)
        billingPeriod: "decade", // invalid
        description: "Bad", // too short (min 5)
      },
    };
    const { res, nextCalled } = await runValidatorChain(createTierValidator, req);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert(fields.includes("name"));
    assert(fields.includes("price"));
    assert(fields.includes("billingPeriod"));
    assert(fields.includes("description"));
  });

  await test("createTierValidator passes valid membership tier payload", async () => {
    const req = {
      body: {
        name: "The Platinum Executive",
        price: 1500,
        billingPeriod: "quarter",
        description: "Comprehensive quarterly pass with personal training.",
        features: ["Unlimited classes", "Sauna access", "Towel service"],
        popular: true,
      },
    };
    const { res, nextCalled } = await runValidatorChain(createTierValidator, req);
    assert.strictEqual(nextCalled, true);
  });

  await test("tierIdParamValidator validates mongo ID parameter", async () => {
    const badReq = { params: { id: "invalid-tier-id" } };
    const goodReq = { params: { id: "507f1f77bcf86cd799439011" } };
    const badRes = await runValidatorChain(tierIdParamValidator, badReq);
    const goodRes = await runValidatorChain(tierIdParamValidator, goodReq);
    assert.strictEqual(badRes.nextCalled, false);
    assert.strictEqual(badRes.res.statusCode, 400);
    assert.strictEqual(goodRes.nextCalled, true);
  });

  // SECTION 5: RBAC & MEMBERSHIP ACCESS CONTROL GUARDRAILS
  console.log("\n--- Section 5: RBAC & Access Control Guardrails ---");

  await test("admin middleware blocks user role with HTTP 403", async () => {
    const req = { user: { _id: "user123", role: "user" } };
    const res = createMockRes();
    let nextCalled = false;
    admin(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Admin privileges required"));
  });

  await test("admin middleware allows admin role to proceed", async () => {
    const req = { user: { _id: "admin123", role: "admin" } };
    const res = createMockRes();
    let nextCalled = false;
    admin(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, 200);
  });

  await test("requireActiveMembership rejects unauthenticated user with HTTP 401", async () => {
    const req = {};
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
  });

  await test("requireActiveMembership blocks admin from booking member classes with HTTP 403", async () => {
    const req = { user: { _id: "admin123", role: "admin", membershipTier: "VIP Elite", daysRemaining: 365 } };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Administrators cannot book member classes"));
  });

  await test("requireActiveMembership blocks Non-Member with HTTP 403 requiresMembership: true", async () => {
    const req = {
      user: {
        _id: "guest123",
        role: "user",
        membershipTier: "Non-Member",
        membershipStatus: "Inactive",
        daysRemaining: 0,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.requiresMembership, true);
    assert(res.body.message.includes("Active membership pass required"));
  });

  await test("requireActiveMembership blocks Expired member with HTTP 403", async () => {
    const req = {
      user: {
        _id: "expired123",
        role: "user",
        membershipTier: "Classic",
        membershipStatus: "Expired",
        daysRemaining: 0,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.requiresMembership, true);
  });

  await test("requireActiveMembership blocks Inactive status even if daysRemaining is set", async () => {
    const req = {
      user: {
        _id: "inactive123",
        role: "user",
        membershipTier: "Classic",
        membershipStatus: "Inactive",
        daysRemaining: 30,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.requiresMembership, true);
  });

  await test("requireActiveMembership blocks member with daysRemaining <= 0", async () => {
    const req = {
      user: {
        _id: "zerodays123",
        role: "user",
        membershipTier: "Classic",
        membershipStatus: "Active",
        daysRemaining: 0,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.requiresMembership, true);
  });

  await test("requireActiveMembership blocks member with past membershipEndDate", async () => {
    const req = {
      user: {
        _id: "pastdate123",
        role: "user",
        membershipTier: "Classic",
        membershipStatus: "Active",
        daysRemaining: 10,
        membershipEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.requiresMembership, true);
  });

  await test("requireActiveMembership allows active member with valid pass to reserve", async () => {
    const req = {
      user: {
        _id: "active123",
        role: "user",
        membershipTier: "VIP Elite",
        membershipStatus: "Active",
        daysRemaining: 180,
        membershipEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    requireActiveMembership(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, 200);
  });

  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${passedCount}/${totalCount} TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
};

runAllTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
