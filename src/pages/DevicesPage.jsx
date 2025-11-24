// src/pages/DevicesPage.jsx
import { useState, useEffect } from "react";

function DevicesPage({ devices, users, onAddDevice, onUpdateDevice }) {
  // ADD DEVICE FORM
  const [isAdding, setIsAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    id: "",
    serialNumber: "",
    type: "",
    make: "",
    model: "",
    location: "",
    notes: "",
    assignedToUserId: "",
  });

  // FILTERS / SEARCH
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "deployed" | "not_deployed"
  const [searchTerm, setSearchTerm] = useState("");

  // EDIT DEVICE FORM
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    serialNumber: "",
    type: "",
    make: "",
    model: "",
    location: "",
    notes: "",
    assignedToUserId: "",
  });

  useEffect(() => {
    // Whenever filters/search change, close the edit form
    setEditingDeviceId(null);
  }, [filterStatus, searchTerm]);


  // ---------- HELPERS ----------

  function normalizeStatus(status) {
    const s = status?.trim().toLowerCase();
    return s === "deployed" ? "deployed" : "not_deployed";
  }

  const getStatusLabel = (status) =>
    normalizeStatus(status) === "deployed" ? "Deployed" : "Not deployed";

  const getStatusClassName = (status) =>
    normalizeStatus(status) === "deployed"
      ? "status-badge status-badge--deployed"
      : "status-badge status-badge--not-deployed";

  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unassigned";
  };

  const totalDevices = devices.length;
  const deployedCount = devices.filter(
    (device) => normalizeStatus(device.status) === "deployed"
  ).length;
  const notDeployedCount = totalDevices - deployedCount;

  // ---------- ADD DEVICE ----------

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    if (!addFormData.id.trim()) {
      alert("ID is required.");
      return;
    }

    const newDevice = {
      id: addFormData.id.trim(),
      serialNumber: addFormData.serialNumber.trim(),
      type: addFormData.type.trim(),
      make: addFormData.make.trim(),
      model: addFormData.model.trim(),
      location: addFormData.location.trim(),
      notes: addFormData.notes.trim(),
      assignedToUserId: addFormData.assignedToUserId.trim() || null,
    };

    onAddDevice(newDevice);

    setAddFormData({
      id: "",
      serialNumber: "",
      type: "",
      make: "",
      model: "",
      location: "",
      notes: "",
      assignedToUserId: "",
    });
    setIsAdding(false);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  // ---------- EDIT DEVICE ----------

  const startEditDevice = (device) => {
    setEditingDeviceId(device.id);
    setEditFormData({
      id: device.id,
      serialNumber: device.serialNumber || "",
      type: device.type || "",
      make: device.make || "",
      model: device.model || "",
      location: device.location || "",
      notes: device.notes || "",
      assignedToUserId: device.assignedToUserId || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (!editFormData.id.trim()) {
      alert("ID is required.");
      return;
    }

    onUpdateDevice(editingDeviceId, {
      id: editFormData.id.trim(),
      serialNumber: editFormData.serialNumber.trim(),
      type: editFormData.type.trim(),
      make: editFormData.make.trim(),
      model: editFormData.model.trim(),
      location: editFormData.location.trim(),
      notes: editFormData.notes.trim(),
      assignedToUserId: editFormData.assignedToUserId.trim() || null,
    });

    setEditingDeviceId(null);
    setEditFormData({
      id: "",
      serialNumber: "",
      type: "",
      make: "",
      model: "",
      location: "",
      notes: "",
      assignedToUserId: "",
    });
  };

  const handleEditCancel = () => {
    setEditingDeviceId(null);
  };

  // ---------- FILTER + SEARCH ----------

  const filteredDevices = devices.filter((device) => {
    const status = normalizeStatus(device.status);
    const matchesStatus =
      filterStatus === "all" || status === filterStatus;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesStatus;

    const haystack = [
      device.id,
      device.serialNumber,
      device.type,
      device.make,
      device.model,
      device.location,
      getUserName(device.assignedToUserId),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(term);

    return matchesStatus && matchesSearch;
  });

  // ---------- RENDER ----------

  return (
    <section>
      <h1>Devices</h1>
      <p>List of all inventory devices.</p>

      <div className="devices-summary">
        <span>Total: {totalDevices}</span>
        <span>Deployed: {deployedCount}</span>
        <span>Not deployed: {notDeployedCount}</span>
      </div>

      {/* ADD DEVICE BUTTON */}
      <div className="devices-actions">
        {!isAdding && (
          <button
            type="button"
            className="btn"
            onClick={() => setIsAdding(true)}
          >
            + Add device
          </button>
        )}
      </div>

      {/* ADD DEVICE FORM */}
      {isAdding && (
        <form className="device-form" onSubmit={handleAddSubmit}>
          <div className="device-form-row">
            <label>
              ID*
              <input
                name="id"
                value={addFormData.id}
                onChange={handleAddChange}
                placeholder="e.g. PC-1002"
                required
              />
            </label>
            <label>
              Serial number
              <input
                name="serialNumber"
                value={addFormData.serialNumber}
                onChange={handleAddChange}
                placeholder="e.g. SN123456"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Type
              <input
                name="type"
                value={addFormData.type}
                onChange={handleAddChange}
                placeholder="e.g. laptop, monitor"
              />
            </label>
            <label>
              Make
              <input
                name="make"
                value={addFormData.make}
                onChange={handleAddChange}
                placeholder="e.g. Dell"
              />
            </label>
            <label>
              Model
              <input
                name="model"
                value={addFormData.model}
                onChange={handleAddChange}
                placeholder="e.g. Latitude 5520"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Location
              <input
                name="location"
                value={addFormData.location}
                onChange={handleAddChange}
                placeholder="e.g. HQ, Remote"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Assigned to (user)
              <select
                name="assignedToUserId"
                value={addFormData.assignedToUserId}
                onChange={handleAddChange}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Notes
              <textarea
                name="notes"
                value={addFormData.notes}
                onChange={handleAddChange}
                rows={2}
                placeholder="Any extra details..."
              />
            </label>
          </div>

          <div className="device-form-actions">
            <button type="submit" className="btn btn-primary">
              Save device
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* FILTERS + SEARCH */}
      <div className="devices-filters">
        <div className="devices-filter-status">
          <button
            type="button"
            className={
              filterStatus === "all" ? "chip chip--active" : "chip"
            }
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            type="button"
            className={
              filterStatus === "deployed" ? "chip chip--active" : "chip"
            }
            onClick={() => setFilterStatus("deployed")}
          >
            Deployed
          </button>
          <button
            type="button"
            className={
              filterStatus === "not_deployed"
                ? "chip chip--active"
                : "chip"
            }
            onClick={() => setFilterStatus("not_deployed")}
          >
            Not deployed
          </button>
        </div>

        <div className="devices-search">
          <input
            type="text"
            placeholder="Search by ID, serial, type, make, model, location, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DEVICES TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Make / Model</th>
            <th>Status</th>
            <th>Location</th>
            <th>Assigned To</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.map((device) => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.type}</td>
              <td>
                {device.make} {device.model}
              </td>
              <td>
                <span className={getStatusClassName(device.status)}>
                  {getStatusLabel(device.status)}
                </span>
              </td>
              <td>{device.location}</td>
              <td>{getUserName(device.assignedToUserId)}</td>
              <td style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => startEditDevice(device)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {filteredDevices.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No devices match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* EDIT DEVICE FORM */}
      {editingDeviceId && (
        <form className="device-form" onSubmit={handleEditSubmit}>
          <h2>Edit device</h2>

          <div className="device-form-row">
            <label>
              ID*
              <input
                name="id"
                value={editFormData.id}
                onChange={handleEditChange}
                required
              />
            </label>
            <label>
              Serial number
              <input
                name="serialNumber"
                value={editFormData.serialNumber}
                onChange={handleEditChange}
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Type
              <input
                name="type"
                value={editFormData.type}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Make
              <input
                name="make"
                value={editFormData.make}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Model
              <input
                name="model"
                value={editFormData.model}
                onChange={handleEditChange}
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Location
              <input
                name="location"
                value={editFormData.location}
                onChange={handleEditChange}
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Assigned to (user)
              <select
                name="assignedToUserId"
                value={editFormData.assignedToUserId}
                onChange={handleEditChange}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Notes
              <textarea
                name="notes"
                value={editFormData.notes}
                onChange={handleEditChange}
                rows={2}
              />
            </label>
          </div>

          <div className="device-form-actions">
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default DevicesPage;
