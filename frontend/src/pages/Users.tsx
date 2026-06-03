import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser, type User } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const { isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isStaff) { navigate("/"); return; }
    fetchUsers();
  }, []);

  const openEdit = (u: User) => {
    setEditing(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditPassword("");
    setEditError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    try {
      const body: Record<string, string> = {};
      if (editName !== editing!.name) body.name = editName;
      if (editEmail !== editing!.email) body.email = editEmail;
      if (editRole !== editing!.role) body.role = editRole;
      if (editPassword) body.password = editPassword;
      await updateUser(editing!.id, body);
      closeEdit();
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    setDeleting(u.id);
    try {
      await deleteUser(u.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div style={{ padding: 48, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>All Users</h2>
      {users.map((u) => (
        <div key={u.id} style={styles.row}>
          <div>
            <div style={{ fontWeight: 500, color: "var(--text)" }}>{u.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{u.email}</div>
          </div>
          <span className={`role-tag role-${u.role}`}>{u.role}</span>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>ID: {u.id}</span>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            {u.createdAt ? timeAgo(u.createdAt) : ""}
          </span>
          {isAdmin && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => openEdit(u)}
                style={styles.editBtn}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(u)}
                disabled={deleting === u.id}
                style={styles.deleteBtn}
              >
                {deleting === u.id ? "..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Edit Modal */}
      {editing && (
        <div style={styles.overlay} onClick={closeEdit}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
              Edit User
            </h3>
            {editError && (
              <div style={{ ...styles.error, marginBottom: 16 }}>{editError}</div>
            )}
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="USER">USER</option>
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  style={styles.input}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" onClick={closeEdit} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
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
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto auto auto",
    alignItems: "center",
    gap: 16,
    padding: "12px 16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    marginBottom: 8,
  },
  editBtn: {
    padding: "4px 12px",
    background: "transparent",
    color: "var(--accent)",
    border: "1px solid var(--accent)",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "4px 12px",
    background: "transparent",
    color: "var(--danger)",
    border: "1px solid var(--danger)",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24,
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    width: "100%",
    maxWidth: 440,
    padding: 24,
  },
  formGroup: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    color: "var(--text-muted)",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
  },
  saveBtn: {
    padding: "8px 16px",
    background: "var(--accent)",
    color: "#000",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "8px 16px",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  },
  error: {
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.3)",
  },
};
