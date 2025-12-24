import { Link, useParams } from "react-router-dom";
import { resolveDeviceCatalogFields } from "../utils/deviceCatalog";

function UserDetailPage({ users, devices, deviceCatalog, onUpdateDevice }) {
  const { id } = useParams();
  const user = users.find((entry) => entry.id === id);

  if (!user) {
    return (
      <section>
        <h1>User not found</h1>
        <p>We couldn't find a user with that ID.</p>
        <Link className="btn btn-secondary" to="/users">
          Back to users
        </Link>
      </section>
    );
  }

  const assignedDevices = devices.filter(
    (device) => device.assignedToUserId === user.id
  );

  return (
    <section>
      <h1>{user.name}</h1>
      <p>User profile and assigned equipment.</p>

      <div className="users-summary">
        <span>Department: {user.department}</span>
        <span>Location: {user.location}</span>
        <span>Devices assigned: {assignedDevices.length}</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Make / Model</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assignedDevices.map((device) => {
            const displayFields = resolveDeviceCatalogFields(
              device,
              deviceCatalog
            );

            return (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{displayFields.type}</td>
                <td>
                  {displayFields.make} {displayFields.model}
                </td>
                <td>{device.location}</td>
                <td style={{ textAlign: "right" }}>
                  {onUpdateDevice && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        onUpdateDevice(device.id, { assignedToUserId: null })
                      }
                    >
                      Unassign
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {assignedDevices.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No devices assigned to this user.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default UserDetailPage;
