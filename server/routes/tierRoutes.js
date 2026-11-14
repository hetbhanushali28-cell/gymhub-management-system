const express = require("express");
const router = express.Router();
const {
  getTiers,
  createTier,
  updateTier,
  deleteTier,
} = require("../controllers/tierController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createTierValidator,
  updateTierValidator,
  tierIdParamValidator,
} = require("../validators/tierValidators");

router.get("/", getTiers);
router.post("/", protect, admin, createTierValidator, createTier);
router.put("/:id", protect, admin, updateTierValidator, updateTier);
router.delete("/:id", protect, admin, tierIdParamValidator, deleteTier);

module.exports = router;

