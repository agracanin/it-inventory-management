import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/common/Modal";
import UserForm from "../components/users/UserForm";

function UsersPage({
  users,
  devices,
  departments,
  locations,
  onAddUser,
  onUpdateUser,
}) {
  const totalUsers = users.length;
  const [addFormData, setAddFormData] = useState({
    id: "",
    name: "",
    department: "",
    location: "",
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    department: "",
    location: "",
  });
  const [modalMode, setModalMode] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);

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
    setModalMode(null);
  };

  const handleAddCancel = () => {
    setModalMode(null);
  };

  const startEditUser = (user) => {
    setModalMode("edit");
    setActiveUserId(user.id);
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

    onUpdateUser(activeUserId, {
      name,
      department: editFormData.department.trim(),
      location: editFormData.location.trim(),
    });

    setModalMode(null);
    setActiveUserId(null);
    setEditFormData({
      id: "",
      name: "",
      department: "",
      location: "",
    });
  };

  const handleEditCancel = () => {
    setModalMode(null);
    setActiveUserId(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setActiveUserId(null);
    setAddFormData({
      id: "",
      name: "",
      department: "",
      location: "",
    });
  };

  return (
    <section>
      <h1>Users</h1>
      <p>List of users and their assigned equipment.</p>

      <div className="users-summary">
        <span>Total users: {totalUsers}</span>
      </div>

      <div className="devices-actions">
        <button type="button" className="btn" onClick={openAddModal}>
          + Add user
        </button>
      </div>

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

      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        title={modalMode === "edit" ? "Edit user" : "Add user"}
        onClose={modalMode === "edit" ? handleEditCancel : handleAddCancel}
      >
        {modalMode === "add" && (
          <UserForm
            title={null}
            departments={departments}
            locations={locations}
            formData={addFormData}
            onChange={handleAddChange}
            onSubmit={handleAddSubmit}
            onCancel={handleAddCancel}
            submitLabel="Save user"
          />
        )}
        {modalMode === "edit" && (
          <UserForm
            title={null}
            departments={departments}
            locations={locations}
            formData={editFormData}
            onChange={handleEditChange}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            submitLabel="Save changes"
            idDisabled
          />
        )}
      </Modal>
    </section>
  );
}

export default UsersPage;
