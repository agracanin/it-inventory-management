import { useEffect, useState } from "react";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DevicesPage from "./pages/DevicesPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import UserDetailPage from "./pages/UserDetailPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import { initialDevices } from "./data/mockDevices.js";
import { initialUsers } from "./data/mockUsers.js";

const STORAGE_KEYS = {
  devices: "itInventoryDevices",
  users: "itInventoryUsers",
  departments: "itInventoryDepartments",
  locations: "itInventoryLocations",
};

const loadFromStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

function App() {
  const [devices, setDevices] = useState(() =>
    loadFromStorage(STORAGE_KEYS.devices, initialDevices)
  );
  const [users, setUsers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.users, initialUsers)
  );
  const [departments, setDepartments] = useState(() =>
    loadFromStorage(STORAGE_KEYS.departments, [
      "Underwriting",
      "Claims",
      "IT",
      "Finance",
    ])
  );
  const [locations, setLocations] = useState(() =>
    loadFromStorage(STORAGE_KEYS.locations, ["HQ", "Remote", "Branch"])
  );

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

  const handleAddUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleUpdateUser = (userId, updates) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    );
  };

  const handleAddDepartment = (department) => {
    setDepartments((prevDepartments) => [...prevDepartments, department]);
  };

  const handleRemoveDepartment = (department) => {
    setDepartments((prevDepartments) =>
      prevDepartments.filter((entry) => entry !== department)
    );
  };

  const handleAddLocation = (location) => {
    setLocations((prevLocations) => [...prevLocations, location]);
  };

  const handleRemoveLocation = (location) => {
    setLocations((prevLocations) =>
      prevLocations.filter((entry) => entry !== location)
    );
  };

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.devices, devices);
  }, [devices]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.departments, departments);
  }, [departments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.locations, locations);
  }, [locations]);

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
              locations={locations}
              users={users}
              onUpdateDevice={handleUpdateDevice}
            />
          }
        />
        <Route
          path="users"
          element={
            <UsersPage
              users={users}
              devices={devices}
              departments={departments}
              locations={locations}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
            />
          }
        />
        <Route
          path="users/:id"
          element={
            <UserDetailPage
              users={users}
              devices={devices}
              onUpdateDevice={handleUpdateDevice}
            />
          }
        />
        <Route
          path="settings"
          element={
            <SettingsPage
              departments={departments}
              locations={locations}
              onAddDepartment={handleAddDepartment}
              onRemoveDepartment={handleRemoveDepartment}
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
            />
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
