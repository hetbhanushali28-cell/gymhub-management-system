const mongoose = require("mongoose");

const membershipTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tier name is required"],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    billingPeriod: {
      type: String,
      enum: ["month", "quarter", "year"],
      default: "year",
    },
    cadence: {
      type: String,
      default: "/ year",
    },
    badge: {
      type: String,
      default: "Active Tier",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    popular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MembershipTier", membershipTierSchema);

