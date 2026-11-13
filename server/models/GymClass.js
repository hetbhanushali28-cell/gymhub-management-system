const mongoose = require("mongoose");

const gymClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a class title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    instructor: {
      type: String,
      required: [true, "Please add an instructor name"],
      trim: true,
      maxlength: [50, "Instructor name cannot exceed 50 characters"],
    },
    date: {
      type: String,
      required: [true, "Please add a date (YYYY-MM-DD)"],
      trim: true,
      index: true,
    },
    time: {
      type: String,
      required: [true, "Please add a time (HH:mm)"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Please add duration in minutes"],
      min: [10, "Duration must be at least 10 minutes"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },
    capacity: {
      type: Number,
      required: [true, "Please add maximum capacity"],
      min: [1, "Capacity must be at least 1"],
      max: [500, "Capacity cannot exceed 500"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "Yoga",
        "Cardio",
        "Strength",
        "CrossFit",
        "Zumba",
        "Pilates",
        "Boxing",
        "HIIT",
      ],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for bookings count (populated when needed)
gymClassSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "gymClass",
});

module.exports = mongoose.model("GymClass", gymClassSchema);
