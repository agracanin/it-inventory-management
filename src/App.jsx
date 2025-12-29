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
import { resolveDeviceCatalogFields } from "./utils/deviceCatalog.js";

const STORAGE_KEYS = {
  devices: "itInventoryDevices",
  users: "itInventoryUsers",
  departments: "itInventoryDepartments",
  locations: "itInventoryLocations",
  deviceTypes: "itInventoryDeviceTypes",
  deviceCatalog: "itInventoryDeviceCatalog",
  activity: "itInventoryActivity",
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

const createActivityId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `activity-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const createActivityEntry = ({
  action,
  entityType,
  entityId,
  summary,
  meta = {},
}) => ({
  id: createActivityId(),
  ts: new Date().toISOString(),
  action,
  entityType,
  entityId,
  summary,
  meta,
});

const normalizeAssignmentId = (value) => {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
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
  const [activityLog, setActivityLog] = useState(() =>
    loadFromStorage(STORAGE_KEYS.activity, [])
  );

  const getDeviceLabel = (device) => {
    const fields = resolveDeviceCatalogFields(device, deviceCatalog);
    const details = [fields.type, fields.make, fields.model]
      .filter(Boolean)
      .join(" ");
    return details ? `${device.id} (${details})` : device.id;
  };

  const getUserLabel = (userId) => {
    const user = users.find((entry) => entry.id === userId);
    if (user?.name) return user.name;
    return userId || "Unknown user";
  };

  const appendActivity = (entry) => {
    setActivityLog((prev) => [entry, ...prev]);
  };

  const handleAddDevice = (newDevice) => {
    const deviceWithStatus = {
      ...newDevice,
      status: deriveStatus(newDevice),
    };

    setDevices((prevDevices) => [...prevDevices, deviceWithStatus]);

    const deviceLabel = getDeviceLabel(deviceWithStatus);
    appendActivity(
      createActivityEntry({
        action: "DEVICE_CREATED",
        entityType: "device",
        entityId: deviceWithStatus.id,
        summary: `Device ${deviceLabel} added.`,
        meta: { deviceId: deviceWithStatus.id },
      })
    );

    const assignedUserId = normalizeAssignmentId(
      deviceWithStatus.assignedToUserId
    );
    if (assignedUserId) {
      const userLabel = getUserLabel(assignedUserId);
      appendActivity(
        createActivityEntry({
          action: "DEVICE_ASSIGNED",
          entityType: "device",
          entityId: deviceWithStatus.id,
          summary: `Assigned device ${deviceLabel} to ${userLabel}.`,
          meta: {
            deviceId: deviceWithStatus.id,
            userId: assignedUserId,
            userName: userLabel,
          },
        })
      );
    }
  };

  const handleUpdateDevice = (deviceId, updates) => {
    const previousDevice = devices.find((device) => device.id === deviceId);
    const nextDevice = previousDevice
      ? { ...previousDevice, ...updates }
      : { id: deviceId, ...updates };
    const nextWithStatus = {
      ...nextDevice,
      status: deriveStatus(nextDevice),
    };

    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        if (device.id !== deviceId) return device;

        return nextWithStatus;
      })
    );

    if (!previousDevice) return;

    const previousAssigned = normalizeAssignmentId(
      previousDevice.assignedToUserId
    );
    const nextAssigned = normalizeAssignmentId(nextWithStatus.assignedToUserId);
    const deviceLabel = getDeviceLabel(nextWithStatus);

    if (previousAssigned && previousAssigned !== nextAssigned) {
      const userLabel = getUserLabel(previousAssigned);
      appendActivity(
        createActivityEntry({
          action: "DEVICE_UNASSIGNED",
          entityType: "device",
          entityId: nextWithStatus.id,
          summary: `Unassigned device ${deviceLabel} from ${userLabel}.`,
          meta: {
            deviceId: nextWithStatus.id,
            userId: previousAssigned,
            userName: userLabel,
          },
        })
      );
    }

    if (nextAssigned && previousAssigned !== nextAssigned) {
      const userLabel = getUserLabel(nextAssigned);
      appendActivity(
        createActivityEntry({
          action: "DEVICE_ASSIGNED",
          entityType: "device",
          entityId: nextWithStatus.id,
          summary: `Assigned device ${deviceLabel} to ${userLabel}.`,
          meta: {
            deviceId: nextWithStatus.id,
            userId: nextAssigned,
            userName: userLabel,
          },
        })
      );
    }

    const updatedFields = Object.keys(updates).filter((key) => {
      if (key === "assignedToUserId") return false;
      if (key === "status") return false;
      return updates[key] !== previousDevice[key];
    });

    if (updatedFields.length > 0) {
      appendActivity(
        createActivityEntry({
          action: "DEVICE_UPDATED",
          entityType: "device",
          entityId: nextWithStatus.id,
          summary: `Device ${deviceLabel} updated.`,
          meta: { deviceId: nextWithStatus.id, fields: updatedFields },
        })
      );
    }
  };

  const handleAddUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);

    appendActivity(
      createActivityEntry({
        action: "USER_CREATED",
        entityType: "user",
        entityId: newUser.id,
        summary: `User ${newUser.name} (${newUser.id}) added.`,
        meta: { userId: newUser.id },
      })
    );
  };

  const handleUpdateUser = (userId, updates) => {
    const previousUser = users.find((user) => user.id === userId);
    const nextUser = previousUser
      ? { ...previousUser, ...updates }
      : { id: userId, ...updates };

    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? nextUser : user))
    );

    const displayName = nextUser.name || userId;
    appendActivity(
      createActivityEntry({
        action: "USER_UPDATED",
        entityType: "user",
        entityId: userId,
        summary: `User ${displayName} updated.`,
        meta: { userId },
      })
    );
  };

  const handleAddDepartment = (department) => {
    setDepartments((prevDepartments) => [...prevDepartments, department]);

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "departments",
        summary: `Added department: ${department}.`,
        meta: { list: "departments", change: "added", value: department },
      })
    );
  };

  const handleRemoveDepartment = (department) => {
    setDepartments((prevDepartments) =>
      prevDepartments.filter((entry) => entry !== department)
    );

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "departments",
        summary: `Removed department: ${department}.`,
        meta: { list: "departments", change: "removed", value: department },
      })
    );
  };

  const handleAddLocation = (location) => {
    setLocations((prevLocations) => [...prevLocations, location]);

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "locations",
        summary: `Added location: ${location}.`,
        meta: { list: "locations", change: "added", value: location },
      })
    );
  };

  const handleRemoveLocation = (location) => {
    setLocations((prevLocations) =>
      prevLocations.filter((entry) => entry !== location)
    );

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "locations",
        summary: `Removed location: ${location}.`,
        meta: { list: "locations", change: "removed", value: location },
      })
    );
  };

  const handleAddDeviceType = (type) => {
    setDeviceTypes((prevTypes) => [...prevTypes, type]);

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "deviceTypes",
        summary: `Added device type: ${type}.`,
        meta: { list: "deviceTypes", change: "added", value: type },
      })
    );
  };

  const handleRemoveDeviceType = (type) => {
    setDeviceTypes((prevTypes) => prevTypes.filter((entry) => entry !== type));

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "deviceTypes",
        summary: `Removed device type: ${type}.`,
        meta: { list: "deviceTypes", change: "removed", value: type },
      })
    );
  };

  const handleAddCatalogItem = ({ type, make, model }) => {
    const baseId = createCatalogId(type, make, model);
    let nextId = baseId;
    let counter = 2;

    while (deviceCatalog.some((item) => item.id === nextId)) {
      nextId = `${baseId}-${counter}`;
      counter += 1;
    }

    setDeviceCatalog((prevCatalog) => {
      return [...prevCatalog, { id: nextId, type, make, model }];
    });

    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "deviceCatalog",
        summary: `Added catalog item: ${type} ${make} ${model}.`,
        meta: {
          list: "deviceCatalog",
          change: "added",
          value: { id: nextId, type, make, model },
        },
      })
    );
  };

  const handleRemoveCatalogItem = (id) => {
    const entry = deviceCatalog.find((item) => item.id === id);
    setDeviceCatalog((prevCatalog) =>
      prevCatalog.filter((item) => item.id !== id)
    );

    const label = entry
      ? `${entry.type} ${entry.make} ${entry.model}`
      : "catalog entry";
    appendActivity(
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "deviceCatalog",
        summary: `Removed catalog item: ${label}.`,
        meta: { list: "deviceCatalog", change: "removed", value: entry ?? { id } },
      })
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
    setActivityLog([
      createActivityEntry({
        action: "SETTINGS_UPDATED",
        entityType: "settings",
        entityId: "localData",
        summary: "Local data reset to defaults.",
        meta: { scope: "all" },
      }),
    ]);
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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activity, activityLog);
  }, [activityLog]);

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
              activityLog={activityLog}
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
              activityLog={activityLog}
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


