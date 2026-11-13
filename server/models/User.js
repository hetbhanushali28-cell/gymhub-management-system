const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    membershipTier: {
      type: String,
      enum: ["Classic", "Annual", "VIP Elite", "Non-Member"],
      default: "VIP Elite",
    },
    membershipStatus: {
      type: String,
      enum: ["Active", "Expiring Soon", "Expired", "Inactive"],
      default: "Active",
    },
    daysRemaining: {
      type: Number,
      default: 245,
    },
    phone: {
      type: String,
      default: "+1 (555) 234-8901",
    },
    emergencyContact: {
      name: { type: String, default: "Sarah Connor" },
      phone: { type: String, default: "+1 (555) 987-6543" },
      relation: { type: String, default: "Spouse" },
    },
    membershipStartDate: {
      type: Date,
      default: () => new Date(),
    },
    membershipEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 245 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
