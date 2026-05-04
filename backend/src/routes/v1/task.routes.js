const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../../controllers/task.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireProjectMember, requireProjectAdmin } = require("../../middleware/role.middleware");

router.use(protect);
router.use(requireProjectMember); // attaches req.membership with role

router.get("/", getTasks);
router.post("/", requireProjectAdmin, createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.put("/:taskId", requireProjectAdmin, updateTask);
router.delete("/:taskId", requireProjectAdmin, deleteTask);

module.exports = router;
