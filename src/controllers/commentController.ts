import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  content: z.string().min(1),
});

// POST /tickets/:ticketId/comments
export async function createComment(req: Request, res: Response) {
  const ticketId = parseInt(req.params.ticketId);
  const body = createSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.format() });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  // USERs can only comment on their own tickets
  if (req.user.role === "USER" && ticket.authorId !== req.user.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const comment = await prisma.comment.create({
    data: {
      content: body.data.content,
      ticketId,
      authorId: req.user.userId,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(comment);
}

// GET /tickets/:ticketId/comments
export async function listComments(req: Request, res: Response) {
  const ticketId = parseInt(req.params.ticketId);

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (req.user.role === "USER" && ticket.authorId !== req.user.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const comments = await prisma.comment.findMany({
    where: { ticketId },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(comments);
}
