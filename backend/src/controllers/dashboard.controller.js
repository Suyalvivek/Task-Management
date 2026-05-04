const prisma = require("../config/prisma");

// GET /api/dashboard — returns stats scoped to user's role
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get all projects the user belongs to
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true },
    });

    const projectIds = memberships.map((m) => m.projectId);
    const isAdmin = memberships.some((m) => m.role === "ADMIN");

    // Base task filter: admins see all tasks in their projects, members see only assigned
    const taskFilter = isAdmin
      ? { projectId: { in: projectIds } }
      : { projectId: { in: projectIds }, assigneeId: userId };

    const [totalTasks, todoCount, inProgressCount, doneCount, overdueCount] =
      await Promise.all([
        prisma.task.count({ where: taskFilter }),
        prisma.task.count({ where: { ...taskFilter, status: "TODO" } }),
        prisma.task.count({ where: { ...taskFilter, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { ...taskFilter, status: "DONE" } }),
        prisma.task.count({
          where: { ...taskFilter, dueDate: { lt: now }, status: { not: "DONE" } },
        }),
      ]);

    // Tasks per user (admin only — across all their projects)
    let tasksPerUser = [];
    if (isAdmin) {
      const grouped = await prisma.task.groupBy({
        by: ["assigneeId"],
        where: { projectId: { in: projectIds }, assigneeId: { not: null } },
        _count: { id: true },
      });

      const userIds = grouped.map((g) => g.assigneeId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });

      tasksPerUser = grouped.map((g) => ({
        user: users.find((u) => u.id === g.assigneeId),
        taskCount: g._count.id,
      }));
    }

    res.json({
      totalTasks,
      byStatus: { TODO: todoCount, IN_PROGRESS: inProgressCount, DONE: doneCount },
      overdueCount,
      tasksPerUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getDashboard };
