const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const validCategories = [
  "Yoga",
  "Cardio",
  "Strength",
  "CrossFit",
  "Zumba",
  "Pilates",
  "Boxing",
  "HIIT",
];

const validDifficulties = ["Beginner", "Intermediate", "Advanced"];

const createClassValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be between 5 and 1000 characters"),
  body("instructor")
    .trim()
    .notEmpty()
    .withMessage("Instructor is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format"),
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Time must be in HH:mm 24-hour format"),
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 10, max: 300 })
    .withMessage("Duration must be a number between 10 and 300 minutes"),
  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500 members"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(", ")}`),
  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),
  validateRequest,
];

const updateClassValidator = [
  param("id").isMongoId().withMessage("Invalid class ID format"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be between 5 and 1000 characters"),
  body("instructor")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),
  body("date")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format"),
  body("time")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Time must be in HH:mm 24-hour format"),
  body("duration")
    .optional()
    .isInt({ min: 10, max: 300 })
    .withMessage("Duration must be a number between 10 and 300 minutes"),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500 members"),
  body("category")
    .optional()
    .trim()
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(", ")}`),
  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),
  validateRequest,
];

const classIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid class ID format"),
  validateRequest,
];

module.exports = {
  createClassValidator,
  updateClassValidator,
  classIdParamValidator,
};

