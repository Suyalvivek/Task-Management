const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  addMember,
  removeMember,
} = require("../../controllers/project.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireProjectMember, requireProjectAdmin } = require("../../middleware/role.middleware");

router.use(protect);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", requireProjectMember, getProjectById);

// Member management (admin only)
router.post("/:projectId/members", requireProjectAdmin, addMember);
router.delete("/:projectId/members/:userId", requireProjectAdmin, removeMember);

module.exports = router;
