function DeviceForm({
  title,
  users,
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}) {
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
          <input
            name="type"
            value={formData.type}
            onChange={onChange}
            placeholder="e.g. laptop, monitor"
          />
        </label>

        <label>
          Make
          <input
            name="make"
            value={formData.make}
            onChange={onChange}
            placeholder="e.g. Dell"
          />
        </label>

        <label>
          Model
          <input
            name="model"
            value={formData.model}
            onChange={onChange}
            placeholder="e.g. Latitude 5520"
          />
        </label>
      </div>

      <div className="device-form-row">
        <label>
          Location
          <input
            name="location"
            value={formData.location}
            onChange={onChange}
            placeholder="e.g. HQ, Remote"
          />
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