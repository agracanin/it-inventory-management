function UsersPage({ users, devices }) {
  const totalUsers=users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  const getDeviceCountForUser = (userId) => 
    devices.filter((device) => device.assignedToUserId === userId).length;


  return (
    <section>
      <h1>Users</h1>
      <p>List of users and their assigned equipment.</p>

      <div className="users-summary">
        <span>Total users: {totalUsers}</span>
        <span>Active users: {activeUsers}</span>
        <span>Inactive: {totalUsers - activeUsers}</span>
      </div>


      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Location</th>
            <th>Status</th>
            <th>Assigned Devices</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const deviceCount = getDeviceCountForUser(user.id);

            return (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>{user.location}</td>
                <td>{user.status === "active" ? "Active" : "Inactive"}</td>
                <td>{deviceCount}</td>
              </tr>
            );
          }
            )
          }
        </tbody>
      </table>
    </section>
  );
}

export default UsersPage;
