# IT Support Ticket System

A full-stack IT support ticket management application built with **Express**, **Prisma**, **PostgreSQL**, and **React**. Features JWT-based authentication, role-based access control (RBAC), and a dark-themed UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Default Accounts](#default-accounts)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Tickets](#tickets)
  - [Comments](#comments)
  - [Users](#users)
- [Role-Based Access Control](#role-based-access-control)
- [Project Structure](#project-structure)
- [Color Theme](#color-theme)

---

## Features

- **Authentication** — Register and login with bcrypt-hashed passwords and JWT tokens containing role claims
- **Role-Based Access Control** — Three roles (ADMIN, AGENT, USER) with middleware-enforced permissions at both route and controller levels
- **Ticket Management** — Full CRUD for tickets with status tracking (Open, In Progress, Resolved, Closed) and priority levels (Low, Medium, High, Critical)
- **User Management** — Admins can view, edit, and delete user accounts; agents can view the user list
- **Comments** — Threaded comments on tickets with ownership validation
- **Assignee System** — Staff can assign tickets to users via a dropdown selector
- **Cascading Deletes** — Deleting a user removes their tickets, comments, and unassigns them from other tickets atomically
- **Responsive UI** — Dark zinc/amber theme, mobile-friendly layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 4, TypeScript |
| **ORM** | Prisma 5.22 |
| **Database** | PostgreSQL |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | Zod |
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | React Router DOM |
| **Styling** | CSS (custom properties, no framework) |

---

## Architecture

### Backend (Express + Prisma)

```
Client Request
      |
  Express Router
      |
  Middleware (authenticate → requireRole)
      |
  Controller (business logic)
      |
  Prisma Client → PostgreSQL
```

- **Middleware-first auth** — `authenticate` extracts and verifies the JWT, attaching `req.user` with `{ userId, email, role }`. `requireRole(...allowed)` gates routes by role.
- **Route-level gating** — `router.use(authenticate)` protects entire route groups; per-route `requireRole("ADMIN")` adds finer control.
- **Controller-level ownership** — Additional checks in controllers enforce that USERs can only access their own resources.

### Frontend (React SPA)

- Hash-free routing via `BrowserRouter`
- JWT stored in `localStorage`, attached to every API request via `Authorization: Bearer` header
- `AuthProvider` context exposes `user`, `token`, `isStaff`, `isAdmin` to all components
- Protected and guest route guards redirect unauthenticated users

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd it-ticket-system

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE it_tickets;
```

2. Configure your `.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/it_tickets?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=4000
```

3. Run migrations and generate the Prisma client:

```bash
npm run db:migrate
npm run db:generate
```

4. (Optional) Seed sample data:

```bash
npm run db:seed
```

This creates 4 test accounts (see [Default Accounts](#default-accounts)) and sample tickets with comments.

### Running the App

You need two terminals:

```bash
# Terminal 1 — Build the frontend (one-time, or after frontend changes)
cd frontend && npm run build

# Terminal 2 — Start the backend dev server
cd .. && npm run dev
```

Then open **http://localhost:4000** in your browser.

For frontend development with hot reload, run the Vite dev server separately:

```bash
cd frontend && npm run dev
```

This starts the frontend on http://localhost:5173 with API proxying to the backend on port 4000.

---

## Default Accounts

After running `npm run db:seed`, the following accounts are available. All use password `password123`.

| Email | Role | Access Level |
|---|---|---|
| `admin@local.dev` | ADMIN | Full access — manage users, delete tickets, all features |
| `agent@local.dev` | AGENT | View all tickets, update status/priority/assignee, view users |
| `alice@local.dev` | USER | Create tickets, view/edit own tickets, comment on own tickets |
| `bob@local.dev` | USER | Same as Alice |

---

## API Reference

All API endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new account. Body: `{ name, email, password }` |
| POST | `/api/auth/login` | Public | Login and receive JWT. Body: `{ email, password }` |

**Login/Register Response:**
```json
{
  "token": "eyJhbG...",
  "user": { "id": 1, "email": "alice@local.dev", "name": "Alice", "role": "USER" }
}
```

### Tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tickets` | Authenticated | List tickets. USER sees own; AGENT/ADMIN sees all. Query params: `?status=OPEN`, `?q=search` |
| GET | `/api/tickets/:id` | Authenticated | Get ticket with comments. USER can only access own tickets |
| POST | `/api/tickets` | Authenticated | Create a ticket. Body: `{ title, description, priority? }` |
| PATCH | `/api/tickets/:id` | Authenticated | Update ticket. USER: title/description only. AGENT/ADMIN: status, priority, assigneeId |
| DELETE | `/api/tickets/:id` | ADMIN only | Delete a ticket |

### Comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tickets/:ticketId/comments` | Authenticated | List comments on a ticket |
| POST | `/api/tickets/:ticketId/comments` | Authenticated | Add a comment. Body: `{ content }` |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | ADMIN, AGENT | List all users |
| GET | `/api/users/:id` | ADMIN only | Get a single user by ID |
| PATCH | `/api/users/:id` | ADMIN only | Update user. Body: `{ name?, email?, password?, role? }` |
| DELETE | `/api/users/:id` | ADMIN only | Delete user (cascades to their tickets and comments) |

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Returns `{ status: "ok", timestamp }` |

---

## Role-Based Access Control

The system uses a **token-only approach** — the JWT payload contains the user's role, and middleware enforces access at the route level.

### Roles

| Role | Tickets | Users | Comments |
|---|---|---|---|
| **ADMIN** | Full CRUD on all tickets | Full CRUD on all users | Full access |
| **AGENT** | View all, update status/priority/assignee | View list only | Full access |
| **USER** | Create, view/edit own tickets only | No access | Comment on own tickets only |

### Middleware Chain

```typescript
// 1. authenticate — verifies JWT, attaches req.user
// 2. requireRole("ADMIN", "AGENT") — checks req.user.role is in allowed list
router.get("/api/users", authenticate, requireRole("ADMIN", "AGENT"), handler);
```

### Controller-Level Checks

Even after route-level gating, controllers enforce ownership:

```typescript
// USERs can only see their own tickets
if (req.user.role === "USER") {
  where.authorId = req.user.userId;
}
```

---

## Project Structure

```
it-ticket-system/
├── prisma/
│   └── schema.prisma          # Database schema (User, Ticket, Comment models)
├── public/                     # Built frontend assets (served by Express)
├── src/
│   ├── index.ts               # Express app entry point, route mounting, static serving
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClient singleton
│   │   └── jwt.ts             # JWT sign/verify utilities
│   ├── middleware/
│   │   └── auth.ts            # authenticate() and requireRole() middleware
│   ├── controllers/
│   │   ├── authController.ts  # Register, login (bcrypt + JWT)
│   │   ├── ticketController.ts # Ticket CRUD with ownership checks
│   │   └── commentController.ts # Comment create/list
│   ├── routes/
│   │   ├── authRoutes.ts      # POST /register, POST /login
│   │   ├── ticketRoutes.ts    # Ticket CRUD with RBAC gates
│   │   └── commentRoutes.ts   # Nested under /tickets/:ticketId/comments
│   └── prisma/
│       └── seed.ts            # Seed script (4 users, 4 tickets, 2 comments)
├── frontend/
│   ├── src/
│   │   ├── api.ts             # All API calls with JWT header injection
│   │   ├── App.tsx            # Router with protected/guest route guards
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Global styles and CSS custom properties
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Auth state, JWT storage, role helpers
│   │   ├── components/
│   │   │   └── Layout.tsx     # Header with nav, user badge, logout
│   │   └── pages/
│   │       ├── Login.tsx      # Login/Register tabs
│   │       ├── TicketList.tsx # Filterable ticket list with status/search
│   │       ├── TicketDetail.tsx # Ticket view, update form, comments
│   │       ├── NewTicket.tsx  # Create ticket form
│   │       └── Users.tsx      # User list with edit/delete modals
│   └── vite.config.ts         # Vite config (builds to ../public)
├── .env                       # Environment variables (not committed)
├── package.json
└── tsconfig.json
```

---

## Color Theme

The UI uses a **dark zinc + amber** palette:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#09090b` | Page background (zinc-950) |
| `--surface` | `#18181b` | Cards, rows, modals (zinc-900) |
| `--border` | `#27272a` | Borders, dividers (zinc-800) |
| `--accent` | `#f59e0b` | Primary accent — buttons, links, highlights (amber-500) |
| `--accent-hover` | `#d97706` | Button hover state (amber-600) |
| `--text` | `#ffffff` | Headings, key text |
| `--text-dim` | `#d4d4d8` | Body text (zinc-300) |
| `--text-muted` | `#a1a1aa` | Secondary text (zinc-400) |
| `--text-faint` | `#71717a` | Labels, timestamps (zinc-500) |
| `--danger` | `#ef4444` | Delete buttons, error states |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start backend with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript backend |
| `npm start` | Run compiled backend |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `cd frontend && npm run dev` | Start frontend dev server with HMR |
| `cd frontend && npm run build` | Build frontend to `public/` |

---

## License

MIT
