const API = "/api";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT" | "USER";
  createdAt?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: { id: number; name: string; email: string };
  assigneeId: number | null;
  assignee: { id: number; name: string; email: string } | null;
  _count?: { comments: number };
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  author: { id: number; name: string };
}

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, { ...opts, headers: authHeaders() });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

// Auth
export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// Tickets
export function getTickets(params?: { status?: string; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs}` : "";
  return request<Ticket[]>(`/tickets${suffix}`);
}

export function getTicket(id: number) {
  return request<Ticket>(`/tickets/${id}`);
}

export function createTicket(data: {
  title: string;
  description: string;
  priority?: string;
}) {
  return request<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTicket(
  id: number,
  data: Record<string, unknown>
) {
  return request<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteTicket(id: number) {
  return request<void>(`/tickets/${id}`, { method: "DELETE" });
}

// Comments
export function getComments(ticketId: number) {
  return request<Comment[]>(`/tickets/${ticketId}/comments`);
}

export function createComment(ticketId: number, content: string) {
  return request<Comment>(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// Users
export function getUsers() {
  return request<User[]>("/users");
}

export function getUser(id: number) {
  return request<User>(`/users/${id}`);
}

export function updateUser(id: number, data: { name?: string; email?: string; password?: string; role?: string }) {
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}
