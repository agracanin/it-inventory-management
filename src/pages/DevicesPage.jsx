// src/pages/DevicesPage.jsx
import { useState } from "react";

function DevicesPage({ devices, onAddDevice }) {
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

  const totalDevices = devices.length;
  const deployedCount = devices.filter(
    (device) => device.status === "deployed"
  ).length;
  const notDeployedCount = devices.filter(
    (device) => device.status === "not_deployed"
  ).length;

  const getStatusLabel = (status) =>
    status?.trim().toLowerCase() === "deployed"
      ? "Deployed"
      : "Not deployed";

  const getStatusClassName = (status) =>
    status?.trim().toLowerCase() === "deployed"
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

    // basic required fields; you can tweak this
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
      status: formData.status, // "deployed" or "not_deployed"
      location: formData.location.trim(),
      notes: formData.notes.trim(),
      assignedToUserId: formData.assignedToUserId.trim() || null,
    };

    onAddDevice(newDevice);

    // reset + close form
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
                placeholder="e.g. In office, Remote"
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

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Make / Model</th>
            <th>Status</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default DevicesPage;
