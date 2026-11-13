const express = require("express");
const router = express.Router();
const {
  getTiers,
  createTier,
  updateTier,
  deleteTier,
} = require("../controllers/tierController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getTiers);
router.post("/", protect, admin, createTier);
router.put("/:id", protect, admin, updateTier);
router.delete("/:id", protect, admin, deleteTier);

module.exports = router;

