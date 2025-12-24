import { useState } from "react";

const normalizeValue = (value) => value.trim().toLowerCase();

function SettingsPage({
  departments,
  locations,
  deviceTypes,
  deviceCatalog,
  onAddDepartment,
  onRemoveDepartment,
  onAddLocation,
  onRemoveLocation,
  onAddDeviceType,
  onRemoveDeviceType,
  onAddCatalogItem,
  onRemoveCatalogItem,
}) {
  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("");
  const [newCatalogType, setNewCatalogType] = useState("");
  const [newCatalogMake, setNewCatalogMake] = useState("");
  const [newCatalogModel, setNewCatalogModel] = useState("");

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

  const handleAddDeviceType = (event) => {
    event.preventDefault();
    const value = newDeviceType.trim();
    if (!value) return;

    if (deviceTypes.some((entry) => normalizeValue(entry) === normalizeValue(value))) {
      alert("That device type already exists.");
      return;
    }

    onAddDeviceType(value);
    setNewDeviceType("");
  };

  const handleAddCatalogItem = (event) => {
    event.preventDefault();
    const type = newCatalogType.trim();
    const make = newCatalogMake.trim();
    const model = newCatalogModel.trim();

    if (!type) {
      alert("Device type is required.");
      return;
    }

    if (!make) {
      alert("Make is required.");
      return;
    }

    if (!model) {
      alert("Model is required.");
      return;
    }

    const exists = deviceCatalog.some(
      (entry) =>
        normalizeValue(entry.type) === normalizeValue(type) &&
        normalizeValue(entry.make) === normalizeValue(make) &&
        normalizeValue(entry.model) === normalizeValue(model)
    );

    if (exists) {
      alert("That catalog entry already exists.");
      return;
    }

    onAddCatalogItem({ type, make, model });
    setNewCatalogType("");
    setNewCatalogMake("");
    setNewCatalogModel("");
  };

  return (
    <section>
      <h1>Settings</h1>
      <p>Manage department, location, and device catalog options.</p>

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

        <div className="settings-card">
          <h2>Device types</h2>
          <p className="settings-note">
            Removing a device type keeps existing assignments but prevents new
            selections.
          </p>

          <form className="settings-form" onSubmit={handleAddDeviceType}>
            <label>
              New device type
              <input
                name="deviceType"
                value={newDeviceType}
                onChange={(event) => setNewDeviceType(event.target.value)}
                placeholder="e.g. laptop"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Add device type
            </button>
          </form>

          <ul className="settings-list">
            {deviceTypes.map((type) => (
              <li key={type} className="settings-list-item">
                <span>{type}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onRemoveDeviceType(type)}
                >
                  Remove
                </button>
              </li>
            ))}
            {deviceTypes.length === 0 && (
              <li className="settings-list-item">No device types added.</li>
            )}
          </ul>
        </div>

        <div className="settings-card">
          <h2>Device catalog</h2>
          <p className="settings-note">
            Add models to power the cascading device selection menus.
          </p>

          <form className="settings-form" onSubmit={handleAddCatalogItem}>
            <label>
              Type
              <select
                name="catalogType"
                value={newCatalogType}
                onChange={(event) => setNewCatalogType(event.target.value)}
              >
                <option value="">Select a type</option>
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Make
              <input
                name="catalogMake"
                value={newCatalogMake}
                onChange={(event) => setNewCatalogMake(event.target.value)}
                placeholder="e.g. Dell"
              />
            </label>
            <label>
              Model
              <input
                name="catalogModel"
                value={newCatalogModel}
                onChange={(event) => setNewCatalogModel(event.target.value)}
                placeholder="e.g. Latitude 5520"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Add catalog entry
            </button>
          </form>

          <ul className="settings-list">
            {deviceCatalog.map((entry) => (
              <li key={entry.id} className="settings-list-item">
                <span>
                  {entry.type} · {entry.make} · {entry.model}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onRemoveCatalogItem(entry.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {deviceCatalog.length === 0 && (
              <li className="settings-list-item">No catalog entries added.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
