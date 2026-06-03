import "dotenv/config";
import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import { authenticate, requireRole } from "./middleware/auth";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Admin-only: list all users
app.get(
  "/api/users",
  authenticate,
  requireRole("ADMIN", "AGENT"),
  async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  }
);

// Admin-only: get single user
app.get(
  "/api/users/:id",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  }
);

// Admin-only: update user (name, email, password, role)
app.patch(
  "/api/users/:id",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email, password, role } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      res.json(user);
    } catch (e: any) {
      if (e.code === "P2025") { res.status(404).json({ error: "User not found" }); return; }
      if (e.code === "P2002") { res.status(409).json({ error: "Email already in use" }); return; }
      throw e;
    }
  }
);

// Admin-only: delete user (also removes their tickets and comments)
app.delete(
  "/api/users/:id",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      // Delete user's comments first, then tickets, then the user
      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { authorId: id } }),
        prisma.ticket.deleteMany({ where: { authorId: id } }),
        prisma.ticket.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
        prisma.user.delete({ where: { id } }),
      ]);
      res.status(204).send();
    } catch (e: any) {
      if (e.code === "P2025") { res.status(404).json({ error: "User not found" }); return; }
      throw e;
    }
  }
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "public")));

// SPA fallback — serve index.html for any non-API route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`IT Ticket System running on http://localhost:${PORT}`);
  console.log(`API:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/tickets`);
  console.log(`  GET    /api/tickets/:id`);
  console.log(`  POST   /api/tickets`);
  console.log(`  PATCH  /api/tickets/:id`);
  console.log(`  DELETE /api/tickets/:id    (ADMIN only)`);
  console.log(`  GET    /api/tickets/:ticketId/comments`);
  console.log(`  POST   /api/tickets/:ticketId/comments`);
  console.log(`  GET    /api/users            (ADMIN + AGENT)`);
  console.log(`  GET    /api/users/:id        (ADMIN only)`);
  console.log(`  PATCH  /api/users/:id        (ADMIN only)`);
  console.log(`  DELETE /api/users/:id        (ADMIN only)`);
});
