import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { TicketPriority, TicketStatus } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.nativeEnum(TicketPriority).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assigneeId: z.number().int().nullable().optional(),
});

// GET /tickets - list all (AGENT+), or own tickets (USER)
export async function listTickets(req: Request, res: Response) {
  const q = req.query.q as string | undefined;
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = {};

  // USERs only see their own tickets
  if (req.user.role === "USER") {
    where.authorId = req.user.userId;
  }

  if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(tickets);
}

// GET /tickets/:id
export async function getTicket(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  // USERs can only see their own tickets
  if (req.user.role === "USER" && ticket.authorId !== req.user.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(ticket);
}

// POST /tickets
export async function createTicket(req: Request, res: Response) {
  const body = createSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.format() });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: body.data.title,
      description: body.data.description,
      priority: body.data.priority ?? TicketPriority.MEDIUM,
      authorId: req.user.userId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json(ticket);
}

// PATCH /tickets/:id
export async function updateTicket(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const body = updateSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.format() });
    return;
  }

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  // USERs can only update their own tickets (title/description only)
  if (req.user.role === "USER") {
    if (existing.authorId !== req.user.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    // USERs cannot change status/priority/assignee
    delete body.data.status;
    delete body.data.priority;
    delete body.data.assigneeId;
  }

  // Only AGENTS and ADMINS can assign
  if (body.data.assigneeId !== undefined && req.user.role === "AGENT") {
    // ok
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: body.data as any,
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });

  res.json(ticket);
}

// DELETE /tickets/:id - ADMIN only
export async function deleteTicket(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  await prisma.ticket.delete({ where: { id } });
  res.status(204).send();
}
