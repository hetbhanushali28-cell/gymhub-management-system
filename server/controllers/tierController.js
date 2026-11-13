const MembershipTier = require("../models/MembershipTier");

// Seed default tiers if none exist
const defaultTiers = [
  {
    name: "The Classic",
    price: 350,
    billingPeriod: "month",
    cadence: "/ month",
    badge: "Standard",
    description: "Essential access to the main training floor, standard locker rooms, and group sessions.",
    features: [
      "Full access to main training floor",
      "5 group fitness classes per month",
      "Locker room & shower access",
      "Standard mobile app scheduling",
      "Free fitness assessment",
    ],
    popular: false,
    isActive: true,
  },
  {
    name: "The Annual",
    price: 3500,
    billingPeriod: "year",
    cadence: "/ year",
    badge: "Most Popular",
    description: "Our signature tier for committed athletes seeking complete access and schedule flexibility.",
    features: [
      "Unlimited gym floor access 24/7",
      "Unlimited group fitness & HIIT classes",
      "Sauna, steam room & cold plunge access",
      "2 complimentary guest passes / month",
      "Priority reservation window",
    ],
    popular: true,
    isActive: true,
  },
  {
    name: "The VIP Elite",
    price: 10000,
    billingPeriod: "year",
    cadence: "/ year",
    badge: "Exclusive",
    description: "An ultra-exclusive bespoke membership offering dedicated concierges and private recovery lounges.",
    features: [
      "Private recovery lounge & cryotherapy",
      "Dedicated private locker & laundry service",
      "Personalized trainer & nutrition consultation",
      "First-priority booking on all classes",
      "24/7 Concierge and valet parking",
    ],
    popular: false,
    isActive: true,
  },
];

// @desc    Get all membership tiers
// @route   GET /api/tiers
// @access  Public
const getTiers = async (req, res) => {
  try {
    let tiers = await MembershipTier.find().sort({ price: 1 });

    if (tiers.length === 0) {
      await MembershipTier.insertMany(defaultTiers);
      tiers = await MembershipTier.find().sort({ price: 1 });
    }

    return res.json({
      success: true,
      count: tiers.length,
      tiers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new membership tier
// @route   POST /api/tiers
// @access  Private/Admin
const createTier = async (req, res) => {
  try {
    const { name, price, billingPeriod, description, features, popular } = req.body;

    const existingTier = await MembershipTier.findOne({ name });
    if (existingTier) {
      return res.status(400).json({
        success: false,
        message: "A membership tier with this name already exists",
      });
    }

    const tier = await MembershipTier.create({
      name,
      price: Number(price),
      billingPeriod: billingPeriod || "year",
      cadence: billingPeriod === "month" ? "/ month" : "/ year",
      badge: popular ? "Most Popular" : "Custom Tier",
      description,
      features: Array.isArray(features) ? features : [features],
      popular: Boolean(popular),
      isActive: true,
    });

    if (req.io) {
      req.io.emit("notification", {
        id: Date.now(),
        type: "tier_created",
        title: "New Membership Tier",
        message: `New plan "${tier.name}" ($${tier.price}${tier.cadence}) is now available.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    return res.status(201).json({
      success: true,
      tier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update membership tier
// @route   PUT /api/tiers/:id
// @access  Private/Admin
const updateTier = async (req, res) => {
  try {
    const tier = await MembershipTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: "Membership tier not found",
      });
    }

    const updated = await MembershipTier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      tier: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Soft-delete / Toggle tier active status
// @route   DELETE /api/tiers/:id
// @access  Private/Admin
const deleteTier = async (req, res) => {
  try {
    const tier = await MembershipTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: "Membership tier not found",
      });
    }

    // Toggle active or remove
    tier.isActive = !tier.isActive;
    await tier.save();

    return res.json({
      success: true,
      message: `Tier "${tier.name}" is now ${tier.isActive ? "active" : "inactive"}`,
      tier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTiers,
  createTier,
  updateTier,
  deleteTier,
};

