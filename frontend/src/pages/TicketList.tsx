import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets, type Ticket } from "../api";
import { useAuth } from "../context/AuthContext";

export default function TicketList() {
  const { isStaff } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTickets({
        status: status || undefined,
        q: q || undefined,
      });
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div>
      <div style={styles.topBar}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Tickets</h2>
        <Link to="/tickets/new" style={styles.newBtn}>+ New Ticket</Link>
      </div>

      <div style={styles.filters}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        {isStaff && (
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets..." style={styles.search} />
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : tickets.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>No tickets found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tickets.map((t) => (
            <Link key={t.id} to={`/tickets/${t.id}`} style={styles.row}>
              <div style={{ minWidth: 0 }}>
                <div style={styles.rowTitle}>{t.title}</div>
                <div style={styles.rowMeta}>
                  #{t.id} · {t.author.name} · {timeAgo(t.createdAt)} ·{" "}
                  {t._count?.comments ?? 0} comments
                </div>
              </div>
              <span className={`badge status-${t.status}`}>{t.status.replace("_", " ")}</span>
              <span className={`badge priority-${t.priority}`}>{t.priority}</span>
              <span style={styles.assignee}>
                {t.assignee ? `👤 ${t.assignee.name}` : "Unassigned"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles: Record<string, React.CSSProperties> = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  newBtn: { padding: "8px 16px", background: "var(--accent)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" },
  filters: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  select: { padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, minWidth: 140 },
  search: { padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, minWidth: 200 },
  searchBtn: { padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, cursor: "pointer" },
  error: { padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)" },
  empty: { textAlign: "center", padding: 48, color: "var(--text-faint)" },
  row: { display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: 16, padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none", color: "inherit", transition: "border-color .15s", boxShadow: "var(--card-shadow)" },
  rowTitle: { fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowMeta: { fontSize: 12, color: "var(--text-faint)", marginTop: 2 },
  assignee: { fontSize: 12, color: "var(--text-muted)", minWidth: 100, textAlign: "right" },
};
