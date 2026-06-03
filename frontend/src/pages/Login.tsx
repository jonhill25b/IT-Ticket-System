import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const { login: setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = isLogin ? login : register;
      const args = isLogin
        ? [email, password]
        : [name, email, password];
      const { token, user } = await (fn as any)(...args);
      setAuth(token, user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={styles.pageToggle}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>
          <span style={{ fontSize: 28 }}>🎫</span>{" "}
          <span style={{ color: "var(--text)" }}>IT</span>{" "}
          <span style={{ color: "var(--accent)" }}>Tickets</span>
        </h1>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Register
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.group}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                style={styles.input}
              />
            </div>
          )}
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={styles.input}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? <span className="spinner" /> : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 24,
    position: "relative",
  },
  pageToggle: {
    position: "absolute",
    top: 24,
    right: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 32,
    boxShadow: "var(--card-shadow)",
  },
  title: { textAlign: "center", marginBottom: 24, fontSize: 24, fontWeight: 700 },
  tabs: { display: "flex", marginBottom: 24, borderBottom: "1px solid var(--border)" },
  tab: {
    flex: 1,
    padding: 10,
    textAlign: "center",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    color: "var(--text-faint)",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
  },
  tabActive: { color: "var(--accent)", borderBottomColor: "var(--accent)" },
  group: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    color: "var(--text-muted)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
  },
  submit: {
    width: "100%",
    padding: "10px 16px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    background: "var(--danger-bg)",
    color: "var(--danger)",
    border: "1px solid var(--danger-border)",
  },
};
