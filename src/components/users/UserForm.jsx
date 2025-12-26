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

function UserForm({
  title,
  departments,
  locations,
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  idDisabled = false,
}) {
  return (
    <form className="device-form" onSubmit={onSubmit}>
      {title && <h2>{title}</h2>}

      <div className="device-form-row">
        <label>
          ID{idDisabled ? "" : "*"}
          <input
            name="id"
            value={formData.id}
            onChange={onChange}
            placeholder={idDisabled ? undefined : "e.g. user-4"}
            required={!idDisabled}
            disabled={idDisabled}
          />
        </label>
        <label>
          Name*
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
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
            value={formData.department}
            onChange={onChange}
          >
            {renderOptions(departments, formData.department, "Select a department")}
          </select>
        </label>
        <label>
          Location
          <select name="location" value={formData.location} onChange={onChange}>
            {renderOptions(locations, formData.location, "Select a location")}
          </select>
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

export default UserForm;
