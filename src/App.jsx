import { useState } from "react";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DevicesPage from "./pages/DevicesPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import { initialDevices } from "./data/mockDevices.js";


function App() {

  const [devices, setDevices] = useState(initialDevices);

  const handleAddDevice = (newDevice) => {
    setDevices((prevDevices) => [...prevDevices, newDevice]);
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
            />}
        />
        <Route path="users" element={<UsersPage />} />
        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;