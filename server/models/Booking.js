const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for a booking"],
      index: true,
    },
    gymClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymClass",
      required: [true, "GymClass ID is required for a booking"],
      index: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index: Prevent a user from creating multiple active bookings for the same class
bookingSchema.index({ user: 1, gymClass: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
