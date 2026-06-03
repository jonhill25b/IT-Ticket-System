import { Router } from "express";
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
import { authenticate, requireRole } from "../middleware/auth";
import commentRouter from "./commentRoutes";

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// READ - any authenticated user (USER sees own tickets in controller)
router.get("/", listTickets);
router.get("/:id", getTicket);

// CREATE - any authenticated user can create tickets
router.post("/", createTicket);

// UPDATE - AGENT and ADMIN can update any field;
//          USER can update title/description of own tickets (enforced in controller)
router.patch("/:id", updateTicket);

// DELETE - ADMIN only (route-level gate)
router.delete("/:id", requireRole("ADMIN"), deleteTicket);

// Nested comments: /tickets/:ticketId/comments
router.use("/:ticketId/comments", commentRouter);

export default router;
