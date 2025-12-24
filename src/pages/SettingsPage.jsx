import { useState } from "react";

const normalizeValue = (value) => value.trim().toLowerCase();

function SettingsPage({
  departments,
  locations,
  onAddDepartment,
  onRemoveDepartment,
  onAddLocation,
  onRemoveLocation,
}) {
  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAddDepartment = (event) => {
    event.preventDefault();
    const value = newDepartment.trim();
    if (!value) return;

    if (departments.some((entry) => normalizeValue(entry) === normalizeValue(value))) {
      alert("That department already exists.");
      return;
    }

    onAddDepartment(value);
    setNewDepartment("");
  };

  const handleAddLocation = (event) => {
    event.preventDefault();
    const value = newLocation.trim();
    if (!value) return;

    if (locations.some((entry) => normalizeValue(entry) === normalizeValue(value))) {
      alert("That location already exists.");
      return;
    }

    onAddLocation(value);
    setNewLocation("");
  };

  return (
    <section>
      <h1>Settings</h1>
      <p>Manage department and location options for users and devices.</p>

      <div className="settings-grid">
        <div className="settings-card">
          <h2>Departments</h2>
          <p className="settings-note">
            Removing a department keeps existing assignments but prevents new
            selections.
          </p>

          <form className="settings-form" onSubmit={handleAddDepartment}>
            <label>
              New department
              <input
                name="department"
                value={newDepartment}
                onChange={(event) => setNewDepartment(event.target.value)}
                placeholder="e.g. Operations"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Add department
            </button>
          </form>

          <ul className="settings-list">
            {departments.map((department) => (
              <li key={department} className="settings-list-item">
                <span>{department}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onRemoveDepartment(department)}
                >
                  Remove
                </button>
              </li>
            ))}
            {departments.length === 0 && (
              <li className="settings-list-item">No departments added.</li>
            )}
          </ul>
        </div>

        <div className="settings-card">
          <h2>Locations</h2>
          <p className="settings-note">
            Removing a location keeps existing assignments but prevents new
            selections.
          </p>

          <form className="settings-form" onSubmit={handleAddLocation}>
            <label>
              New location
              <input
                name="location"
                value={newLocation}
                onChange={(event) => setNewLocation(event.target.value)}
                placeholder="e.g. West Office"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Add location
            </button>
          </form>

          <ul className="settings-list">
            {locations.map((location) => (
              <li key={location} className="settings-list-item">
                <span>{location}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onRemoveLocation(location)}
                >
                  Remove
                </button>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="settings-list-item">No locations added.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
