const prisma = require("../config/prisma");

// POST /api/tasks/:projectId — create task (admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assigneeId } = req.body;
    const { projectId } = req.params;

    if (!title) return res.status(400).json({ message: "Task title is required" });

    // Validate assignee is a project member (if provided)
    if (assigneeId) {
      const membership = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!membership) {
        return res.status(400).json({ message: "Assignee is not a project member" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        assigneeId: assigneeId || null,
        projectId,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/tasks/:projectId — get tasks (members see only their own)
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role } = req.membership;

    const whereClause = { projectId };
    if (role === "MEMBER") {
      whereClause.assigneeId = req.user.id;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/tasks/:projectId/:taskId/status — update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;
    const { role } = req.membership;

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Members can only update tasks assigned to them
    if (role === "MEMBER" && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own tasks" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/tasks/:projectId/:taskId — update full task (admin only)
const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, dueDate, priority, assigneeId, status } = req.body;

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (assigneeId) {
      const membership = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!membership) {
        return res.status(400).json({ message: "Assignee is not a project member" });
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate,
        priority: priority ?? task.priority,
        assigneeId: assigneeId ?? task.assigneeId,
        status: status ?? task.status,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/tasks/:projectId/:taskId — delete task (admin only)
const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, updateTask, deleteTask };
