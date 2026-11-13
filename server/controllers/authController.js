const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new member user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, membershipTier = "VIP Elite" } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    let days = 365;
    let status = "Active";
    if (membershipTier === "Classic") {
      days = 30;
      status = "Active";
    } else if (membershipTier === "Annual") {
      days = 365;
      status = "Active";
    } else if (membershipTier === "VIP Elite") {
      days = 365;
      status = "Active";
    } else if (membershipTier === "Non-Member") {
      days = 0;
      status = "Inactive";
    }

    // Enforce default 'user' role to prevent public privilege escalation
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      membershipTier,
      membershipStatus: status,
      daysRemaining: days,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipTier: user.membershipTier,
        membershipStatus: user.membershipStatus,
        daysRemaining: user.daysRemaining,
        token: generateToken(user._id, user.role),
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid user data",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipTier: user.membershipTier || "VIP Elite",
        membershipStatus: user.membershipStatus || "Active",
        daysRemaining: user.daysRemaining || 245,
        token: generateToken(user._id, user.role),
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      return res.json({
        success: true,
        user,
      });
    }
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.emergencyContact) {
      user.emergencyContact = {
        name: req.body.emergencyContact.name || user.emergencyContact?.name || "",
        phone: req.body.emergencyContact.phone || user.emergencyContact?.phone || "",
        relation: req.body.emergencyContact.relation || user.emergencyContact?.relation || "",
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        emergencyContact: updatedUser.emergencyContact,
        membershipTier: updatedUser.membershipTier,
        membershipStatus: updatedUser.membershipStatus,
        daysRemaining: updatedUser.daysRemaining,
        membershipStartDate: updatedUser.membershipStartDate,
        membershipEndDate: updatedUser.membershipEndDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all gym members (Admin only)
// @route   GET /api/auth/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Renew membership subscription
// @route   PUT /api/auth/renew
// @access  Private
const renewMembership = async (req, res) => {
  try {
    const { tier = "VIP Elite", additionalDays = 365 } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.membershipTier = tier;
    user.membershipStatus = "Active";
    user.daysRemaining = (user.daysRemaining || 0) + Number(additionalDays);

    await user.save();

    // Broadcast notification if io is available
    if (req.io) {
      req.io.emit("notification", {
        id: Date.now(),
        type: "membership_renewed",
        title: "Membership Renewed",
        message: `${user.name} successfully renewed ${user.membershipTier} subscription (${user.daysRemaining} days remaining).`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    return res.json({
      success: true,
      message: "Membership renewed successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipTier: user.membershipTier,
        membershipStatus: user.membershipStatus,
        daysRemaining: user.daysRemaining,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMembers,
  renewMembership,
};
