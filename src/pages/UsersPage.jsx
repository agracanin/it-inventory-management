import { useState } from "react";
import { Link } from "react-router-dom";

const renderOptions = (options, currentValue, placeholder) => (
  <>
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
    {currentValue && !options.includes(currentValue) && (
      <option value={currentValue} disabled>
        {currentValue} (retired)
      </option>
    )}
  </>
);

function UsersPage({
  users,
  devices,
  departments,
  locations,
  onAddUser,
  onUpdateUser,
}) {
  const totalUsers = users.length;
  const [isAdding, setIsAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    id: "",
    name: "",
    department: "",
    location: "",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    department: "",
    location: "",
  });

  const getDeviceCountForUser = (userId) =>
    devices.filter((device) => device.assignedToUserId === userId).length;

  const handleAddChange = (event) => {
    const { name, value } = event.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (event) => {
    event.preventDefault();
    const id = addFormData.id.trim();
    const name = addFormData.name.trim();

    if (!id) {
      alert("User ID is required.");
      return;
    }

    if (!name) {
      alert("Name is required.");
      return;
    }

    if (users.some((user) => user.id === id)) {
      alert("That user ID already exists.");
      return;
    }

    onAddUser({
      id,
      name,
      department: addFormData.department.trim(),
      location: addFormData.location.trim(),
    });

    setAddFormData({
      id: "",
      name: "",
      department: "",
      location: "",
    });
    setIsAdding(false);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditFormData({
      id: user.id,
      name: user.name || "",
      department: user.department || "",
      location: user.location || "",
    });
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const name = editFormData.name.trim();

    if (!name) {
      alert("Name is required.");
      return;
    }

    onUpdateUser(editingUserId, {
      name,
      department: editFormData.department.trim(),
      location: editFormData.location.trim(),
    });

    setEditingUserId(null);
    setEditFormData({
      id: "",
      name: "",
      department: "",
      location: "",
    });
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
  };

  return (
    <section>
      <h1>Users</h1>
      <p>List of users and their assigned equipment.</p>

      <div className="users-summary">
        <span>Total users: {totalUsers}</span>
      </div>

      <div className="devices-actions">
        {!isAdding && (
          <button type="button" className="btn" onClick={() => setIsAdding(true)}>
            + Add user
          </button>
        )}
      </div>

      {isAdding && (
        <form className="device-form" onSubmit={handleAddSubmit}>
          <h2>New user</h2>

          <div className="device-form-row">
            <label>
              ID*
              <input
                name="id"
                value={addFormData.id}
                onChange={handleAddChange}
                placeholder="e.g. user-4"
                required
              />
            </label>
            <label>
              Name*
              <input
                name="name"
                value={addFormData.name}
                onChange={handleAddChange}
                placeholder="e.g. Alex Johnson"
                required
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Department
              <select
                name="department"
                value={addFormData.department}
                onChange={handleAddChange}
              >
                {renderOptions(departments, addFormData.department, "Select a department")}
              </select>
            </label>
            <label>
              Location
              <select
                name="location"
                value={addFormData.location}
                onChange={handleAddChange}
              >
                {renderOptions(locations, addFormData.location, "Select a location")}
              </select>
            </label>
          </div>

          <div className="device-form-actions">
            <button type="submit" className="btn btn-primary">
              Save user
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleAddCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Location</th>
            <th>Devices assigned</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const deviceCount = getDeviceCountForUser(user.id);

            return (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.department}</td>
                <td>{user.location}</td>
                <td>{deviceCount}</td>
                <td style={{ textAlign: "right" }}>
                  {onUpdateUser && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => startEditUser(user)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>
                  )}
                  <Link className="btn btn-secondary" to={`/users/${user.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editingUserId && (
        <form className="device-form" onSubmit={handleEditSubmit}>
          <h2>Edit user</h2>

          <div className="device-form-row">
            <label>
              ID
              <input name="id" value={editFormData.id} disabled />
            </label>
            <label>
              Name*
              <input
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                required
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Department
              <select
                name="department"
                value={editFormData.department}
                onChange={handleEditChange}
              >
                {renderOptions(
                  departments,
                  editFormData.department,
                  "Select a department"
                )}
              </select>
            </label>
            <label>
              Location
              <select
                name="location"
                value={editFormData.location}
                onChange={handleEditChange}
              >
                {renderOptions(locations, editFormData.location, "Select a location")}
              </select>
            </label>
          </div>

          <div className="device-form-actions">
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleEditCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default UsersPage;
