process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_2026";
const jwt = require("jsonwebtoken");
const generateToken = require("./utils/generateToken");
const { protect, admin } = require("./middleware/authMiddleware");

console.log("=== PHASE 2 VERIFICATION TEST ===");

// 1. Test JWT Generation with Role
console.log("\n[Test 1] Testing generateToken with id and role...");
const token = generateToken("507f1f77bcf86cd799439011", "admin");
const decoded = jwt.verify(token, process.env.JWT_SECRET);
if (decoded.id === "507f1f77bcf86cd799439011" && decoded.role === "admin") {
  console.log("  PASS: JWT properly signed with user ID and role payload.");
} else {
  console.error("  FAIL: Decoded JWT payload incorrect:", decoded);
  process.exit(1);
}

// Helper for mocking req/res/next
const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runMiddlewareTests = async () => {
  // 2. Test protect middleware with NO token
  console.log("\n[Test 2] Testing protect middleware with missing token...");
  const reqNoToken = { headers: {} };
  const resNoToken = mockRes();
  let nextCalled = false;
  await protect(reqNoToken, resNoToken, () => {
    nextCalled = true;
  });

  if (resNoToken.statusCode === 401 && !nextCalled && resNoToken.body.success === false) {
    console.log("  PASS: protect rejected missing token with HTTP 401.");
  } else {
    console.error("  FAIL: protect failed on missing token:", resNoToken);
    process.exit(1);
  }

  // 3. Test protect middleware with INVALID token
  console.log("\n[Test 3] Testing protect middleware with invalid token...");
  const reqBadToken = { headers: { authorization: "Bearer invalid.jwt.token" } };
  const resBadToken = mockRes();
  nextCalled = false;
  await protect(reqBadToken, resBadToken, () => {
    nextCalled = true;
  });

  if (resBadToken.statusCode === 401 && !nextCalled && resBadToken.body.success === false) {
    console.log("  PASS: protect rejected invalid token with HTTP 401.");
  } else {
    console.error("  FAIL: protect failed on invalid token:", resBadToken);
    process.exit(1);
  }

  // 4. Test admin middleware with standard 'user' role
  console.log("\n[Test 4] Testing admin middleware with 'user' role...");
  const reqMember = { user: { _id: "123", role: "user" } };
  const resMember = mockRes();
  nextCalled = false;
  admin(reqMember, resMember, () => {
    nextCalled = true;
  });

  if (resMember.statusCode === 403 && !nextCalled && resMember.body.success === false) {
    console.log("  PASS: admin middleware blocked non-admin user with HTTP 403.");
  } else {
    console.error("  FAIL: admin middleware did not block user role:", resMember);
    process.exit(1);
  }

  // 5. Test admin middleware with 'admin' role
  console.log("\n[Test 5] Testing admin middleware with 'admin' role...");
  const reqAdmin = { user: { _id: "123", role: "admin" } };
  const resAdmin = mockRes();
  nextCalled = false;
  admin(reqAdmin, resAdmin, () => {
    nextCalled = true;
  });

  if (nextCalled && resAdmin.statusCode === 200) {
    console.log("  PASS: admin middleware allowed admin user through.");
  } else {
    console.error("  FAIL: admin middleware failed for admin role:", resAdmin);
    process.exit(1);
  }

  console.log("\n>>> ALL PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<");
};

runMiddlewareTests();

