import { useState } from "react";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DevicesPage from "./pages/DevicesPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import { initialDevices } from "./data/mockDevices.js";
import { initialUsers } from "./data/mockUsers.js";


function App() {

  const [devices, setDevices] = useState(initialDevices);
  const [users, setUsers] = useState(initialUsers);


  const deriveStatus = (device) => {
    const id = device.assignedToUserId;
    const isAssigned = id && id.trim() !== "";
    return isAssigned ? "deployed" : "not_deployed";
  };

  const handleAddDevice = (newDevice) => {
    setDevices((prevDevices) => [
      ...prevDevices,
      {
        ...newDevice,
        status: deriveStatus(newDevice),
      },
    ]);
  };
  
  const handleUpdateDevice = (deviceId, updates) => {
    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        if (device.id !== deviceId) return device;

        const next = { ...device, ...updates };

        return {
          ...next,
          status: deriveStatus(next),
        };
      })
    );
  };



  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Layout />}>
        {/* index = "/" */}
        <Route index element={<DashboardPage />} />
        <Route
          path="/devices"
          element={
          <DevicesPage
              devices={devices}
              onAddDevice={handleAddDevice}
              users={users}
              onUpdateDevice={handleUpdateDevice}
            />}
        />
        <Route path="users" element={<UsersPage users={users} devices={devices} />} />
        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;