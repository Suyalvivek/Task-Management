const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");
const dashboardRoutes = require("./dashboard.routes");

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks/:projectId", taskRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
