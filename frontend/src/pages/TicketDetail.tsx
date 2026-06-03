import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTicket, updateTicket, deleteTicket, createComment, getUsers, type Ticket, type User } from "../api";
import { useAuth } from "../context/AuthContext";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isStaff, isAdmin } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const canEdit = isStaff || ticket?.authorId === user?.id;

  const fetch = async () => {
    setLoading(true);
    try {
      const t = await getTicket(Number(id));
      setTicket(t);
      setStatus(t.status);
      setPriority(t.priority);
      setDescription(t.description);
      setAssigneeId(t.assigneeId?.toString() || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    if (isStaff) getUsers().then(setUsers).catch(() => {});
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: Record<string, unknown> = { description };
      if (isStaff) { body.status = status; body.priority = priority; body.assigneeId = assigneeId ? parseInt(assigneeId) : null; }
      await updateTicket(Number(id), body);
      fetch();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket permanently?")) return;
    try { await deleteTicket(Number(id)); navigate("/"); }
    catch (err: any) { alert(err.message); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try { await createComment(Number(id), comment); setComment(""); fetch(); }
    catch (err: any) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: 48, textAlign: "center" }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 8, border: "1px solid var(--danger-border)" }}>{error}</div>;
  if (!ticket) return null;

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: "var(--text-faint)" }}>← Back to tickets</Link>
      <div style={{ marginTop: 16 }}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>{ticket.title}</h1>
            <div style={styles.meta}>Opened by {ticket.author.name} · {timeAgo(ticket.createdAt)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={`badge status-${ticket.status}`}>{ticket.status.replace("_", " ")}</span>
            <span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span>
          </div>
        </div>

        <div style={styles.card}>
          <p style={styles.desc}>{ticket.description}</p>
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 12 }}>
            {ticket.assignee ? <>Assigned to <strong style={{ color: "var(--text-dim)" }}>{ticket.assignee.name}</strong></> : "Unassigned"}
          </div>
        </div>

        {canEdit && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Update Ticket</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {isStaff && (
                  <>
                    <div>
                      <label style={styles.label}>Status</label>
                      <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Priority</label>
                      <select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.input}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={styles.label}>Assignee</label>
                      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={styles.input}>
                        <option value="">— Unassigned —</option>
                        {users.map((u) => (<option key={u.id} value={u.id}>{u.name} ({u.email})</option>))}
                      </select>
                    </div>
                  </>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Description</label>
                  <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={styles.input} />
                </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {isAdmin && (<button type="button" onClick={handleDelete} style={styles.deleteBtn}>🗑 Delete</button>)}
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Comments ({ticket.comments?.length ?? 0})</h3>
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((c) => (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: "var(--text)" }}>{c.author.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{timeAgo(c.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)" }}>{c.content}</p>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-faint)" }}>No comments yet</p>
          )}
          <form onSubmit={handleComment} style={{ marginTop: 12 }}>
            <textarea name="content" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." rows={3} style={styles.input} />
            <button type="submit" style={{ ...styles.saveBtn, marginTop: 8 }}>Post Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  meta: { fontSize: 13, color: "var(--text-faint)", marginTop: 4 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "var(--card-shadow)" },
  desc: { color: "var(--text-dim)", whiteSpace: "pre-wrap" },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-faint)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  label: { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-muted)" },
  input: { width: "100%", padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14 },
  saveBtn: { padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  deleteBtn: { padding: "8px 16px", background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, fontSize: 14, cursor: "pointer" },
  comment: { padding: 12, background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 },
  commentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
};
