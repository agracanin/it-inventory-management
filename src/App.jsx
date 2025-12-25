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
  deviceTypes: "itInventoryDeviceTypes",
  deviceCatalog: "itInventoryDeviceCatalog",
};

const DEFAULT_DEPARTMENTS = [
  "IT",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
];
const DEFAULT_LOCATIONS = ["In office", "Remote", "Storage"];
const DEFAULT_DEVICE_TYPES = ["laptop", "desktop", "monitor", "docking_station"];

const deriveStatus = (device) => {
  const id = device.assignedToUserId;
  const isAssigned = id && id.trim() !== "";
  return isAssigned ? "deployed" : "not_deployed";
};

const buildSeedDevices = (devices) =>
  devices.map((device) => ({
    ...device,
    status: deriveStatus(device),
  }));

const normalizeIdValue = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createCatalogId = (type, make, model) => {
  const parts = [type, make, model].map(normalizeIdValue).filter(Boolean);
  return `catalog-${parts.join("-")}`;
};

const buildInitialDeviceCatalog = (devices) => {
  const seen = new Set();
  const catalog = [];

  devices.forEach((device) => {
    const type = device.type?.trim();
    const make = device.make?.trim();
    const model = device.model?.trim();

    if (!type || !make || !model) return;

    const id = createCatalogId(type, make, model);
    if (seen.has(id)) return;

    seen.add(id);
    catalog.push({ id, type, make, model });
  });

  return catalog;
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
  const [devices, setDevices] = useState(() => {
    const stored = loadFromStorage(
      STORAGE_KEYS.devices,
      buildSeedDevices(initialDevices)
    );
    return buildSeedDevices(stored);
  });
  const [deviceTypes, setDeviceTypes] = useState(() =>
    loadFromStorage(STORAGE_KEYS.deviceTypes, DEFAULT_DEVICE_TYPES)
  );
  const [deviceCatalog, setDeviceCatalog] = useState(() =>
    loadFromStorage(
      STORAGE_KEYS.deviceCatalog,
      buildInitialDeviceCatalog(initialDevices)
    )
  );
  const [users, setUsers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.users, initialUsers)
  );
  const [departments, setDepartments] = useState(() =>
    loadFromStorage(STORAGE_KEYS.departments, DEFAULT_DEPARTMENTS)
  );
  const [locations, setLocations] = useState(() =>
    loadFromStorage(STORAGE_KEYS.locations, DEFAULT_LOCATIONS)
  );

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

  const handleAddDeviceType = (type) => {
    setDeviceTypes((prevTypes) => [...prevTypes, type]);
  };

  const handleRemoveDeviceType = (type) => {
    setDeviceTypes((prevTypes) => prevTypes.filter((entry) => entry !== type));
  };

  const handleAddCatalogItem = ({ type, make, model }) => {
    setDeviceCatalog((prevCatalog) => {
      const baseId = createCatalogId(type, make, model);
      let id = baseId;
      let counter = 2;

      while (prevCatalog.some((item) => item.id === id)) {
        id = `${baseId}-${counter}`;
        counter += 1;
      }

      return [...prevCatalog, { id, type, make, model }];
    });
  };

  const handleRemoveCatalogItem = (id) => {
    setDeviceCatalog((prevCatalog) =>
      prevCatalog.filter((item) => item.id !== id)
    );
  };

  const handleResetLocalData = () => {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        window.localStorage.removeItem(key);
      });
    }

    setDevices(buildSeedDevices(initialDevices));
    setUsers(initialUsers);
    setDepartments(DEFAULT_DEPARTMENTS);
    setLocations(DEFAULT_LOCATIONS);
    setDeviceTypes(DEFAULT_DEVICE_TYPES);
    setDeviceCatalog(buildInitialDeviceCatalog(initialDevices));
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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.deviceTypes, deviceTypes);
  }, [deviceTypes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.deviceCatalog, deviceCatalog);
  }, [deviceCatalog]);

  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Layout />}>
        {/* index = "/" */}
        <Route
          index
          element={
            <DashboardPage
              devices={devices}
              users={users}
              locations={locations}
              deviceTypes={deviceTypes}
              deviceCatalog={deviceCatalog}
            />
          }
        />
        <Route
          path="/devices"
          element={
            <DevicesPage
              devices={devices}
              onAddDevice={handleAddDevice}
              locations={locations}
              users={users}
              onUpdateDevice={handleUpdateDevice}
              deviceTypes={deviceTypes}
              deviceCatalog={deviceCatalog}
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
              deviceCatalog={deviceCatalog}
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
              deviceTypes={deviceTypes}
              deviceCatalog={deviceCatalog}
              onAddDepartment={handleAddDepartment}
              onRemoveDepartment={handleRemoveDepartment}
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
              onAddDeviceType={handleAddDeviceType}
              onRemoveDeviceType={handleRemoveDeviceType}
              onAddCatalogItem={handleAddCatalogItem}
              onRemoveCatalogItem={handleRemoveCatalogItem}
              onResetLocalData={handleResetLocalData}
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


