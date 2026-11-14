const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const validBillingPeriods = ["month", "quarter", "year"];

const createTierValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tier name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tier name must be between 2 and 50 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("billingPeriod")
    .optional()
    .isIn(validBillingPeriods)
    .withMessage(`Billing period must be one of: ${validBillingPeriods.join(", ")}`),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be between 5 and 500 characters"),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  body("popular")
    .optional()
    .isBoolean()
    .withMessage("Popular must be a boolean"),
  validateRequest,
];

const updateTierValidator = [
  param("id").isMongoId().withMessage("Invalid tier ID format"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Tier name must be between 2 and 50 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("billingPeriod")
    .optional()
    .isIn(validBillingPeriods)
    .withMessage(`Billing period must be one of: ${validBillingPeriods.join(", ")}`),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be between 5 and 500 characters"),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  body("popular")
    .optional()
    .isBoolean()
    .withMessage("Popular must be a boolean"),
  validateRequest,
];

const tierIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid tier ID format"),
  validateRequest,
];

module.exports = {
  createTierValidator,
  updateTierValidator,
  tierIdParamValidator,
};
