// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import DevicesPage from "./pages/DevicesPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <div>
      {/* Simple navbar */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "1px solid #ddd",
          marginBottom: "1rem",
        }}
      >
        <Link to="/">Dashboard</Link>
        <Link to="/devices">Devices</Link>
        <Link to="/users">Users</Link>
      </nav>

      {/* Page content */}
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
