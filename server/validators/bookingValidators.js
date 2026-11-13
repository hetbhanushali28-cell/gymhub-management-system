const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const createBookingValidator = [
  body("classId")
    .notEmpty()
    .withMessage("Class ID is required")
    .isMongoId()
    .withMessage("Invalid class ID format"),
  validateRequest,
];

const bookingIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid booking ID format"),
  validateRequest,
];

module.exports = {
  createBookingValidator,
  bookingIdParamValidator,
};

