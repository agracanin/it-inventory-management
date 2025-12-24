import { Link } from "react-router-dom";

function UsersPage({ users, devices }) {
  const totalUsers = users.length;

  const getDeviceCountForUser = (userId) =>
    devices.filter((device) => device.assignedToUserId === userId).length;

  return (
    <section>
      <h1>Users</h1>
      <p>List of users and their assigned equipment.</p>

      <div className="users-summary">
        <span>Total users: {totalUsers}</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Location</th>
            <th>Devices assigned</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const deviceCount = getDeviceCountForUser(user.id);

            return (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.department}</td>
                <td>{user.location}</td>
                <td>{deviceCount}</td>
                <td style={{ textAlign: "right" }}>
                  <Link className="btn btn-secondary" to={`/users/${user.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default UsersPage;
