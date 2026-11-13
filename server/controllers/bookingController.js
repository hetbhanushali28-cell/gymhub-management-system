const Booking = require("../models/Booking");
const GymClass = require("../models/GymClass");

// @desc    Book a gym class
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { classId } = req.body;

    // Check if class exists
    const gymClass = await GymClass.findById(classId);
    if (!gymClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Enforce Active Membership Pass check (Non-Members & Expired members must activate pass)
    if (
      req.user.membershipTier === "Non-Member" ||
      req.user.membershipStatus === "Expired" ||
      (req.user.daysRemaining !== undefined && req.user.daysRemaining <= 0)
    ) {
      return res.status(403).json({
        success: false,
        requiresMembership: true,
        message:
          "Active membership pass required to reserve classes. Please activate or renew a membership tier.",
      });
    }

    // Check if user has already booked this class
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      gymClass: classId,
      status: "confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this class",
      });
    }

    // Check capacity
    const currentBookings = await Booking.countDocuments({
      gymClass: classId,
      status: "confirmed",
    });

    if (currentBookings >= gymClass.capacity) {
      return res.status(400).json({
        success: false,
        message: "Class is already at maximum capacity",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      gymClass: classId,
      status: "confirmed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("gymClass");

    // Compute updated available slots
    const newBookedCount = currentBookings + 1;
    const availableSlots = Math.max(0, gymClass.capacity - newBookedCount);

    // Broadcast real-time slot update via Socket.IO
    if (req.io) {
      req.io.emit("class_capacity_updated", {
        classId,
        bookedCount: newBookedCount,
        availableSlots,
        isFull: availableSlots === 0,
      });

      req.io.emit("booking_created", populatedBooking);

      req.io.emit("notification", {
        id: Date.now(),
        type: "booking_created",
        title: "New Booking Alert",
        message: `${req.user.name} booked a spot in "${gymClass.title}". Remaining spots: ${availableSlots}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: populatedBooking,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this class",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's personal bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      status: "confirmed",
    })
      .populate("gymClass")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("gymClass")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only the user who made the booking or an admin can cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    const classId = booking.gymClass;
    await Booking.findByIdAndDelete(req.params.id);

    // Compute updated available slots after cancellation
    const gymClass = await GymClass.findById(classId);
    if (gymClass) {
      const remainingBooked = await Booking.countDocuments({
        gymClass: classId,
        status: "confirmed",
      });
      const availableSlots = Math.max(0, gymClass.capacity - remainingBooked);

      // Broadcast real-time slot update via Socket.IO
      if (req.io) {
        req.io.emit("class_capacity_updated", {
          classId,
          bookedCount: remainingBooked,
          availableSlots,
          isFull: availableSlots === 0,
        });

        req.io.emit("booking_cancelled", {
          bookingId: req.params.id,
          classId,
        });

        req.io.emit("notification", {
          id: Date.now(),
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `A spot in "${gymClass.title}" was cancelled. ${availableSlots} spots now available.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
};
