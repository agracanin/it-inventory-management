import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;