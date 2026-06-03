import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTicket } from "../api";

export default function NewTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ticket = await createTicket({ title, description, priority });
      navigate(`/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Link to="/" style={{ fontSize: 13, color: "var(--text-faint)" }}>← Back to tickets</Link>
      <div style={styles.card}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>New Ticket</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Title</label>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief summary of the issue" style={styles.input} />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Description</label>
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Detailed description..." style={styles.input} />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Priority</label>
            <select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.input}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link to="/" style={styles.cancelBtn}>Cancel</Link>
            <button type="submit" style={styles.submitBtn} disabled={loading}>{loading ? "Creating..." : "Create Ticket"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginTop: 16, boxShadow: "var(--card-shadow)" },
  group: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-muted)" },
  input: { width: "100%", padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14 },
  cancelBtn: { padding: "8px 16px", color: "var(--text-muted)", textDecoration: "none", fontSize: 14, border: "1px solid var(--border)", borderRadius: 8 },
  submitBtn: { padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  error: { padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)" },
};
