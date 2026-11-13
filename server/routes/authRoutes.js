const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMembers,
  renewMembership,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

router.post("/register", registerValidator, registerUser);
router.post("/login", loginValidator, loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/members", protect, admin, getMembers);
router.put("/renew", protect, renewMembership);

module.exports = router;
