// src/components/layout/Navbar.jsx
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          "navbar__link" + (isActive ? " navbar__link--active" : "")
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/devices"
        className={({ isActive }) =>
          "navbar__link" + (isActive ? " navbar__link--active" : "")
        }
      >
        Devices
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          "navbar__link" + (isActive ? " navbar__link--active" : "")
        }
      >
        Users
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          "navbar__link" + (isActive ? " navbar__link--active" : "")
        }
      >
        Settings
      </NavLink>
    </nav>
  );
}

export default Navbar;
