const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - user must be logged in with a valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user account not found",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authorized, no token provided",
  });
};

// Admin only middleware - enforces RBAC
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
};

// Require active membership pass for reserving classes
const requireActiveMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrators cannot book member classes.",
    });
  }

  const isNonMember = req.user.membershipTier === "Non-Member";
  const isExpired = req.user.membershipStatus === "Expired";
  const isInactive = req.user.membershipStatus === "Inactive";
  const hasZeroDays =
    typeof req.user.daysRemaining === "number" && req.user.daysRemaining <= 0;
  const isDatePast =
    req.user.membershipEndDate &&
    new Date(req.user.membershipEndDate) < new Date();

  if (isNonMember || isExpired || isInactive || hasZeroDays || isDatePast) {
    return res.status(403).json({
      success: false,
      requiresMembership: true,
      message:
        "Active membership pass required to reserve classes. Please activate or renew a membership tier.",
    });
  }

  return next();
};

module.exports = { protect, admin, requireActiveMembership };
