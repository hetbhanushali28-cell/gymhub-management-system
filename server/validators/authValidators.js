const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  body("membershipTier")
    .optional()
    .isIn(["Classic", "Annual", "VIP Elite", "Non-Member"])
    .withMessage("Membership tier must be Classic, Annual, VIP Elite, or Non-Member"),
  validateRequest,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Phone number must be between 5 and 30 characters"),
  body("emergencyContact")
    .optional()
    .isObject()
    .withMessage("Emergency contact must be an object"),
  body("emergencyContact.name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Emergency contact name must be between 2 and 50 characters"),
  body("emergencyContact.phone")
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Emergency contact phone must be between 5 and 30 characters"),
  body("emergencyContact.relation")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Emergency contact relation must be between 2 and 30 characters"),
  body("password")
    .optional()
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be at least 6 characters long"),
  validateRequest,
];

const renewMembershipValidator = [
  body("tier")
    .optional()
    .trim()
    .isIn(["Classic", "Annual", "VIP Elite"])
    .withMessage("Tier must be Classic, Annual, or VIP Elite"),
  body("additionalDays")
    .optional()
    .isInt({ min: 1, max: 3650 })
    .withMessage("Additional days must be a positive integer up to 3650"),
  validateRequest,
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  renewMembershipValidator,
};

