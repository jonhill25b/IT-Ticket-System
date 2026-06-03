import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("password123", 10);

  const [admin, agent, user1, user2] = await Promise.all([
    prisma.user.create({
      data: { email: "admin@local.dev", password: pw, name: "Admin", role: Role.ADMIN },
    }),
    prisma.user.create({
      data: { email: "agent@local.dev", password: pw, name: "Agent Smith", role: Role.AGENT },
    }),
    prisma.user.create({
      data: { email: "alice@local.dev", password: pw, name: "Alice", role: Role.USER },
    }),
    prisma.user.create({
      data: { email: "bob@local.dev", password: pw, name: "Bob", role: Role.USER },
    }),
  ]);

  console.log(`Created ${admin.name} (${admin.role})`);
  console.log(`Created ${agent.name} (${agent.role})`);
  console.log(`Created ${user1.name} (${user1.role})`);
  console.log(`Created ${user2.name} (${user2.role})`);

  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: "VPN connection drops every 30 minutes",
        description: "Cannot maintain stable VPN connection from home office.",
        priority: "HIGH",
        status: "OPEN",
        authorId: user1.id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Outlook not syncing on mobile",
        description: "Emails not arriving on iPhone Outlook app since Monday.",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        authorId: user1.id,
        assigneeId: agent.id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: "New laptop request for new hire",
        description: "Need a MacBook Pro for Jane Doe starting next week.",
        priority: "LOW",
        status: "RESOLVED",
        authorId: user2.id,
        assigneeId: agent.id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Access to shared drive denied",
        description: "Getting permission error when accessing /projects shared drive.",
        priority: "CRITICAL",
        status: "OPEN",
        authorId: user2.id,
      },
    }),
  ]);

  console.log(`Created ${tickets.length} sample tickets`);

  await prisma.comment.create({
    data: {
      content: "I'm experiencing the same issue. Started around the same time.",
      ticketId: tickets[0].id,
      authorId: user2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Checking the VPN gateway logs now.",
      ticketId: tickets[0].id,
      authorId: agent.id,
    },
  });

  console.log("Seeding complete.");
  console.log(`Password for all users: password123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
