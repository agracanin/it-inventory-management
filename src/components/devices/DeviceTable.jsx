import { getStatusClassName, getStatusLabel } from "../../utils/deviceStatus";
import { resolveDeviceCatalogFields } from "../../utils/deviceCatalog";

function DeviceTable({ devices, getUserName, onEditClick, deviceCatalog }) {
  return (
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
        {devices.map((device) => {
          const displayFields = resolveDeviceCatalogFields(device, deviceCatalog);

          return (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{displayFields.type}</td>
              <td>
                {displayFields.make} {displayFields.model}
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
                  onClick={() => onEditClick(device)}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}

        {devices.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: "center" }}>
              No devices match your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default DeviceTable;
