const prisma = require("../config/prisma");

// Verify user is a member (any role) of the project
const requireProjectMember = async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    return res.status(403).json({ message: "Access denied: not a project member" });
  }

  req.membership = membership; // attach role info for downstream use
  next();
};

// Verify user is an Admin of the project
const requireProjectAdmin = async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }

  req.membership = membership;
  next();
};

module.exports = { requireProjectMember, requireProjectAdmin };
