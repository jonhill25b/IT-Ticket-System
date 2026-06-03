import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import NewTicket from "./pages/NewTicket";
import Users from "./pages/Users";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <GuestRoute><Login /></GuestRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="tickets/new" element={<NewTicket />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
