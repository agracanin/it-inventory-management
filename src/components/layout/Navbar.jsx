import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Dashboard</Link>
      <Link to="/devices">Devices</Link>
      <Link to="/users">Users</Link>
    </nav>
  );
}

export default Navbar;