import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <span style={{ color: "#fff", fontWeight: 700 }}>🎫 IT</span>
          <span style={{ color: "var(--accent)" }}> Tickets</span>
        </Link>
        <nav style={styles.nav}>
          <Link to="/" className="nav-btn">🎫 Tickets</Link>
          {isStaff && (
            <Link to="/users" className="nav-btn">👥 Users</Link>
          )}
          <Link to="/tickets/new" className="nav-btn-primary">+ New Ticket</Link>
          <div style={styles.userInfo}>
            <span>{user?.name}</span>
            <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={{ flex: 1, padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "rgba(9,9,11,0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.5px",
    color: "var(--text)",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--text-muted)",
    marginLeft: 8,
    paddingLeft: 8,
    borderLeft: "1px solid var(--border)",
  },
  logoutBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
  },
};
