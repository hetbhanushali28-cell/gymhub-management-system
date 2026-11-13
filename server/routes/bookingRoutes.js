const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createBookingValidator,
  bookingIdParamValidator,
} = require("../validators/bookingValidators");

router.post("/", protect, createBookingValidator, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, admin, getAllBookings);
router.delete("/:id", protect, bookingIdParamValidator, cancelBooking);

module.exports = router;
