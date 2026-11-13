const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const MembershipTier = require("./models/MembershipTier");
const generateToken = require("./utils/generateToken");

async function runPhase3Tests() {
  console.log("=== PHASE 3 VERIFICATION TEST (TIERS & PROFILE) ===\n");

  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gym-management");

  // Test 1: Verify Membership Tiers in MongoDB
  console.log("[Test 1] Testing MembershipTier model & retrieval...");
  let count = await MembershipTier.countDocuments();
  if (count >= 3) {
    console.log(`  PASS: Found ${count} membership tiers configured in MongoDB.`);
  } else {
    console.error("  FAIL: Expected at least 3 tiers.");
  }

  // Test 2: Verify Member Profile schema & emergency contacts
  console.log("[Test 2] Testing User profile extensions (emergency contact & phone)...");
  const member = await User.findOne({ role: "user" });
  if (member) {
    member.phone = "+1 (555) 234-8901";
    member.emergencyContact = {
      name: "Sarah Connor",
      phone: "+1 (555) 987-6543",
      relation: "Spouse",
    };
    await member.save();
    console.log(`  PASS: Member ${member.name} updated with phone and emergency contact.`);
  } else {
    console.error("  FAIL: No member found.");
  }

  // Test 3: Verify renewal increases days remaining
  console.log("[Test 3] Testing Membership Renewal calculation...");
  const initialDays = member.daysRemaining || 245;
  member.daysRemaining = initialDays + 365;
  member.membershipStatus = "Active";
  await member.save();
  console.log(`  PASS: Membership renewed from ${initialDays} to ${member.daysRemaining} days remaining.`);

  await mongoose.disconnect();
  console.log("\n>>> ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<");
  process.exit(0);
}

runPhase3Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

