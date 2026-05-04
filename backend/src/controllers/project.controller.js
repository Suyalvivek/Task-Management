const prisma = require("../config/prisma");

// GET /api/projects — list all projects the user belongs to
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/projects — create project, auto-add creator as ADMIN
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: { userId: req.user.id, role: "ADMIN" },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/projects/:projectId — get project details
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/projects/:projectId/members — add member by email (admin only)
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) return res.status(409).json({ message: "User is already a member" });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId, role: "MEMBER" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/projects/:projectId/members/:userId — remove member (admin only)
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Prevent admin from removing themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Admin cannot remove themselves" });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getProjects, createProject, getProjectById, addMember, removeMember };
