import { useState } from "react";

function DevicesPage({ devices, users, onAddDevice, onUpdateDevice }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    serialNumber: "",
    type: "",
    make: "",
    model: "",
    status: "deployed",
    location: "",
    notes: "",
    assignedToUserId: "",
  });

  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  // filter + search state
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "deployed" | "not_deployed"
  const [searchTerm, setSearchTerm] = useState("");

  const totalDevices = devices.length;
  const deployedCount = devices.filter(
    (device) => normalizeStatus(device.status) === "deployed"
  ).length;
  const notDeployedCount = devices.filter(
    (device) => normalizeStatus(device.status) === "not_deployed"
  ).length;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.id.trim()) {
      alert("ID is required.");
      return;
    }

    const newDevice = {
      id: formData.id.trim(),
      serialNumber: formData.serialNumber.trim(),
      type: formData.type.trim(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      status: formData.status, // "deployed" | "not_deployed"
      location: formData.location.trim(),
      notes: formData.notes.trim(),
      assignedToUserId: formData.assignedToUserId.trim() || null,
    };

    onAddDevice(newDevice);

    setFormData({
      id: "",
      serialNumber: "",
      type: "",
      make: "",
      model: "",
      status: "deployed",
      location: "",
      notes: "",
      assignedToUserId: "",
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  // apply filters + search
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
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <section>
      <h1>Devices</h1>
      <p>List of all inventory devices.</p>

      <div className="devices-summary">
        <span>Total: {totalDevices}</span>
        <span>Deployed: {deployedCount}</span>
        <span>Not deployed: {notDeployedCount}</span>
      </div>

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

      {isAdding && (
        <form className="device-form" onSubmit={handleSubmit}>
          <div className="device-form-row">
            <label>
              ID*
              <input
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. PC-1002"
                required
              />
            </label>
            <label>
              Serial number
              <input
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g. SN123456"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Type
              <input
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g. laptop, monitor"
              />
            </label>
            <label>
              Make
              <input
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g. Dell"
              />
            </label>
            <label>
              Model
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Latitude 5520"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Status
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="deployed">Deployed</option>
                <option value="not_deployed">Not deployed</option>
              </select>
            </label>
            <label>
              Location
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. HQ, Remote"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Assigned to (user ID)
              <input
                name="assignedToUserId"
                value={formData.assignedToUserId}
                onChange={handleChange}
                placeholder="e.g. U-001"
              />
            </label>
          </div>

          <div className="device-form-row">
            <label>
              Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
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
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}


      {/* Device search */}
      <div className="devices-filters">
        <div className="devices-filter-status">
          <button
            type="button"
            className={
              filterStatus === "all"
                ? "chip chip--active"
                : "chip"
            }
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            type="button"
            className={
              filterStatus === "deployed"
                ? "chip chip--active"
                : "chip"
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
            placeholder="Search by ID, serial, type, make, model, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Make / Model</th>
            <th>Status</th>
            <th>Location</th>
            <th>Assigned to</th>
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
              <td>
                <select
                  value={device.assignedToUserId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    onUpdateDevice(device.id, {
                      assignedToUserId: value || null
                    });
                  }}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department})
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {filteredDevices.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No devices match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default DevicesPage;
