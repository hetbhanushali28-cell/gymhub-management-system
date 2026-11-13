const express = require("express");
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = require("../controllers/classController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createClassValidator,
  updateClassValidator,
  classIdParamValidator,
} = require("../validators/classValidators");

router.get("/", getClasses);
router.get("/:id", classIdParamValidator, getClassById);
router.post("/", protect, admin, createClassValidator, createClass);
router.put("/:id", protect, admin, updateClassValidator, updateClass);
router.delete("/:id", protect, admin, classIdParamValidator, deleteClass);

module.exports = router;
