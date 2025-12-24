function DeviceForm({
  title,
  users,
  locations,
  deviceTypes,
  deviceCatalog,
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const availableMakes = Array.from(
    new Set(
      (deviceCatalog || [])
        .filter((entry) => entry.type === formData.type)
        .map((entry) => entry.make)
        .filter(Boolean)
    )
  );

  const availableModels = Array.from(
    new Set(
      (deviceCatalog || [])
        .filter(
          (entry) =>
            entry.type === formData.type && entry.make === formData.make
        )
        .map((entry) => entry.model)
        .filter(Boolean)
    )
  );

  return (
    <form className="device-form" onSubmit={onSubmit}>
      {title && <h2>{title}</h2>}

      <div className="device-form-row">
        <label>
          ID*
          <input
            name="id"
            value={formData.id}
            onChange={onChange}
            placeholder="e.g. PC-1002"
            required
          />
        </label>

        <label>
          Serial number
          <input
            name="serialNumber"
            value={formData.serialNumber}
            onChange={onChange}
            placeholder="e.g. SN123456"
          />
        </label>
      </div>

      <div className="device-form-row">
        <label>
          Type
          <select name="type" value={formData.type} onChange={onChange}>
            <option value="">Select a type</option>
            {(deviceTypes || []).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            {formData.type && !(deviceTypes || []).includes(formData.type) && (
              <option value={formData.type} disabled>
                {formData.type} (retired)
              </option>
            )}
          </select>
        </label>

        <label>
          Make
          <select
            name="make"
            value={formData.make}
            onChange={onChange}
            disabled={!formData.type}
          >
            <option value="">Select a make</option>
            {availableMakes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
            {formData.make && !availableMakes.includes(formData.make) && (
              <option value={formData.make} disabled>
                {formData.make} (retired)
              </option>
            )}
          </select>
        </label>

        <label>
          Model
          <select
            name="model"
            value={formData.model}
            onChange={onChange}
            disabled={!formData.type || !formData.make}
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            {formData.model && !availableModels.includes(formData.model) && (
              <option value={formData.model} disabled>
                {formData.model} (retired)
              </option>
            )}
          </select>
        </label>
      </div>

      <div className="device-form-row">
        <label>
          Location
          <select
            name="location"
            value={formData.location}
            onChange={onChange}
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
            {formData.location && !locations.includes(formData.location) && (
              <option value={formData.location} disabled>
                {formData.location} (retired)
              </option>
            )}
          </select>
        </label>
      </div>

      <div className="device-form-row">
        <label>
          Assigned to (user)
          <select
            name="assignedToUserId"
            value={formData.assignedToUserId}
            onChange={onChange}
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
            value={formData.notes}
            onChange={onChange}
            rows={2}
            placeholder="Any extra details..."
          />
        </label>
      </div>

      <div className="device-form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DeviceForm;
