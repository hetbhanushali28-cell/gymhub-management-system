const GymClass = require("../models/GymClass");
const Booking = require("../models/Booking");

// @desc    Get all gym classes with computed available slots
// @route   GET /api/classes
// @access  Public
const getClasses = async (req, res) => {
  try {
    const classes = await GymClass.find().sort({ createdAt: -1 }).lean();

    // Aggregate active bookings for each class
    const bookingCounts = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: "$gymClass", count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    bookingCounts.forEach((item) => {
      countsMap[item._id.toString()] = item.count;
    });

    const enrichedClasses = classes.map((cls) => {
      const bookedCount = countsMap[cls._id.toString()] || 0;
      const availableSlots = Math.max(0, cls.capacity - bookedCount);
      return {
        ...cls,
        bookedCount,
        availableSlots,
        isFull: availableSlots === 0,
      };
    });

    res.json(enrichedClasses);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single gym class with live slot availability
// @route   GET /api/classes/:id
// @access  Public
const getClassById = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id).lean();
    if (!gymClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const bookedCount = await Booking.countDocuments({
      gymClass: req.params.id,
      status: "confirmed",
    });
    const availableSlots = Math.max(0, gymClass.capacity - bookedCount);

    res.json({
      ...gymClass,
      bookedCount,
      availableSlots,
      isFull: availableSlots === 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a gym class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      date,
      time,
      duration,
      capacity,
      category,
      difficulty,
    } = req.body;

    const gymClass = await GymClass.create({
      title,
      description,
      instructor,
      date,
      time,
      duration: Number(duration),
      capacity: Number(capacity),
      category,
      difficulty: difficulty || "Beginner",
      createdBy: req.user._id,
    });

    const responseData = {
      ...gymClass.toObject(),
      bookedCount: 0,
      availableSlots: gymClass.capacity,
      isFull: false,
    };

    if (req.io) {
      req.io.emit("class_created", responseData);
      req.io.emit("notification", {
        id: Date.now(),
        type: "class_created",
        title: "New Class Scheduled!",
        message: `"${gymClass.title}" (${gymClass.category}) with ${gymClass.instructor} on ${gymClass.date} at ${gymClass.time}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a gym class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const updatedClass = await GymClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    const bookedCount = await Booking.countDocuments({
      gymClass: req.params.id,
      status: "confirmed",
    });
    const availableSlots = Math.max(0, updatedClass.capacity - bookedCount);

    const responseData = {
      ...updatedClass,
      bookedCount,
      availableSlots,
      isFull: availableSlots === 0,
    };

    if (req.io) {
      req.io.emit("class_updated", responseData);
      req.io.emit("notification", {
        id: Date.now(),
        type: "class_updated",
        title: "Class Updated",
        message: `Details for "${responseData.title}" have been updated by admin.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a gym class & cascade-delete associated bookings
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);

    if (!gymClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const classTitle = gymClass.title;

    // Cascade delete associated bookings
    await Booking.deleteMany({ gymClass: req.params.id });
    await GymClass.findByIdAndDelete(req.params.id);

    if (req.io) {
      req.io.emit("class_deleted", { classId: req.params.id });
      req.io.emit("notification", {
        id: Date.now(),
        type: "class_deleted",
        title: "Class Removed",
        message: `"${classTitle}" has been cancelled by the gym administrator.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    res.json({
      success: true,
      message: "Class and all associated bookings removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
