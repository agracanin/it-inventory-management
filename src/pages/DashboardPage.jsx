import { Link } from "react-router-dom";
import { resolveDeviceCatalogFields } from "../utils/deviceCatalog";

const normalizeType = (value) => (value ?? "").trim().toLowerCase();

const getCatalogItem = (device, deviceCatalog) => {
  const fields = resolveDeviceCatalogFields(device, deviceCatalog);
  return {
    type: fields.type?.trim() || "",
    make: fields.make?.trim() || "",
    model: fields.model?.trim() || "",
  };
};

const getDeviceType = (device, deviceCatalog) => {
  const { type } = getCatalogItem(device, deviceCatalog);
  return normalizeType(type || device?.type) || "unknown";
};

const getLocationLabel = (device) => device?.location?.trim() || "Unknown";

const isAssigned = (device) => {
  const id = device?.assignedToUserId;
  return Boolean(id && id.trim() !== "");
};

const formatCountLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const getModelLabel = (device, deviceCatalog) => {
  const { make, model } = getCatalogItem(device, deviceCatalog);
  if (make && model) {
    return `${make} ${model}`;
  }
  if (make || model) {
    return `${make || model}`;
  }
  return "Unknown model";
};

const buildDeviceLabel = (device, deviceCatalog) => {
  const { type } = getCatalogItem(device, deviceCatalog);
  const typeLabel = type || device?.type || "Unknown type";
  return {
    typeLabel,
    modelLabel: getModelLabel(device, deviceCatalog),
  };
};

function DashboardPage({
  users = [],
  devices = [],
  locations = [],
  deviceTypes = [],
  deviceCatalog = [],
  activityLog = [],
}) {
  const totalDevices = devices.length;
  const deployedDevices = devices.filter(isAssigned).length;
  const notDeployedDevices = totalDevices - deployedDevices;
  const totalUsers = users.length;

  const unassignedInStorage = devices.filter(
    (device) => !isAssigned(device) && getLocationLabel(device) === "Storage"
  ).length;

  const userSummaries = users.map((user) => {
    const assignedDevices = devices.filter(
      (device) => device.assignedToUserId === user.id
    );

    let monitorCount = 0;
    let computerCount = 0;
    let laptopCount = 0;
    let dockCount = 0;

    assignedDevices.forEach((device) => {
      const type = getDeviceType(device, deviceCatalog);
      if (type === "monitor") monitorCount += 1;
      if (type === "laptop" || type === "desktop") computerCount += 1;
      if (type === "laptop") laptopCount += 1;
      if (type === "docking_station") dockCount += 1;
    });

    const missingComputer = computerCount < 1;
    const missingMonitorsCount = Math.max(0, 2 - monitorCount);
    const missingDock = laptopCount > 0 && dockCount < 1;

    const missingItems = [];
    if (missingComputer) missingItems.push("computer");
    if (missingMonitorsCount > 0) {
      missingItems.push(formatCountLabel(missingMonitorsCount, "monitor"));
    }
    if (missingDock) missingItems.push("dock");

    return {
      user,
      monitorCount,
      computerCount,
      dockCount,
      missingItems,
      missingComputer,
      missingMonitorsCount,
      missingDock,
    };
  });

  const usersMissingEquipment = userSummaries
    .filter((summary) => summary.missingItems.length > 0)
    .sort((a, b) => {
      if (a.missingComputer !== b.missingComputer) {
        return a.missingComputer ? -1 : 1;
      }
      if (a.missingMonitorsCount !== b.missingMonitorsCount) {
        return b.missingMonitorsCount - a.missingMonitorsCount;
      }
      if (a.missingDock !== b.missingDock) {
        return a.missingDock ? -1 : 1;
      }
      return a.user.name.localeCompare(b.user.name);
    });

  const fullyEquippedCount = Math.max(
    0,
    totalUsers - usersMissingEquipment.length
  );

  const floatingDevices = devices.filter(
    (device) => !isAssigned(device) && getLocationLabel(device) !== "Storage"
  );

  const locationList = Array.from(
    new Set([
      ...locations.map((location) => location.trim()).filter(Boolean),
      ...devices.map(getLocationLabel),
    ])
  );

  const devicesByLocation = locationList.map((location) => {
    const locationDevices = devices.filter(
      (device) => getLocationLabel(device) === location
    );
    const deployed = locationDevices.filter(isAssigned).length;
    return {
      location,
      total: locationDevices.length,
      deployed,
      notDeployed: locationDevices.length - deployed,
    };
  });

  const typeRows = [];
  const knownTypeSet = new Set();

  deviceTypes.forEach((type) => {
    const normalized = normalizeType(type);
    if (!normalized || knownTypeSet.has(normalized)) return;
    knownTypeSet.add(normalized);
    typeRows.push({ normalized, label: type });
  });

  devices.forEach((device) => {
    const normalized = getDeviceType(device, deviceCatalog);
    if (knownTypeSet.has(normalized)) return;
    knownTypeSet.add(normalized);
    const { type } = getCatalogItem(device, deviceCatalog);
    const label =
      normalized === "unknown" ? "Unknown" : type || device?.type || "Unknown";
    typeRows.push({ normalized, label });
  });

  const devicesByType = typeRows.map(({ normalized, label }) => {
    const count = devices.filter(
      (device) => getDeviceType(device, deviceCatalog) === normalized
    ).length;
    return { label, count };
  });

  const modelCounts = new Map();
  devices.forEach((device) => {
    const label = getModelLabel(device, deviceCatalog);
    modelCounts.set(label, (modelCounts.get(label) || 0) + 1);
  });

  const topModels = Array.from(modelCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 5);

  const recentActivity = Array.isArray(activityLog) ? activityLog.slice(0, 5) : [];

  const kpiCards = [
    { label: "Total devices", value: totalDevices },
    { label: "Deployed devices", value: deployedDevices },
    { label: "Not deployed devices", value: notDeployedDevices },
    { label: "Total users", value: totalUsers },
    {
      label: "Unassigned in storage",
      value: unassignedInStorage,
    },
    {
      label: "Users fully equipped",
      value: fullyEquippedCount,
      helper:
        totalUsers > 0
          ? `${usersMissingEquipment.length} need attention`
          : "No users yet",
    },
  ];

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Inventory Dashboard</h1>
          <p className="dashboard-muted">
            Overview of users and device assignments.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link className="btn btn-primary" to="/devices">
            Add device
          </Link>
          <Link className="btn btn-primary" to="/users">
            Add user
          </Link>
          <Link className="btn btn-secondary" to="/settings">
            Settings
          </Link>
        </div>
      </div>

      <div>
        <h2>Key metrics</h2>
        <div className="dashboard-kpis">
          {kpiCards.map((card) => (
            <div className="dashboard-card" key={card.label}>
              <span className="dashboard-card-label">{card.label}</span>
              <span className="dashboard-card-value">{card.value}</span>
              {card.helper && (
                <span className="dashboard-card-helper">{card.helper}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Attention needed</h2>
        <div className="dashboard-panels">
          <div className="dashboard-panel">
            <h3>Users missing equipment</h3>
            {usersMissingEquipment.length === 0 ? (
              <p className="dashboard-muted">
                All users have the required equipment.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Department</th>
                    <th>Missing items</th>
                    <th>Device counts</th>
                  </tr>
                </thead>
                <tbody>
                  {usersMissingEquipment.map((summary) => (
                    <tr key={summary.user.id}>
                      <td>{summary.user.name}</td>
                      <td>{summary.user.location || "Unknown"}</td>
                      <td>{summary.user.department || "Unknown"}</td>
                      <td>{summary.missingItems.join(", ")}</td>
                      <td>
                        {formatCountLabel(summary.monitorCount, "monitor")},{" "}
                        {formatCountLabel(summary.computerCount, "computer")},{" "}
                        {formatCountLabel(summary.dockCount, "dock")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>Devices needing assignment</h3>
            {floatingDevices.length === 0 ? (
              <p className="dashboard-muted">
                No unassigned devices outside of storage.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Type / Make / Model</th>
                    <th>Location</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {floatingDevices.map((device) => {
                    const label = buildDeviceLabel(device, deviceCatalog);
                    return (
                      <tr key={device.id}>
                        <td>{device.id}</td>
                        <td>
                          <div className="dashboard-device-label">
                            <span>{label.typeLabel}</span>
                            <span className="dashboard-muted">
                              {label.modelLabel}
                            </span>
                          </div>
                        </td>
                        <td>{getLocationLabel(device)}</td>
                        <td style={{ textAlign: "right" }}>
                          <Link className="btn btn-secondary" to="/devices">
                            Assign
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2>Breakdowns</h2>
        <div className="dashboard-breakdowns">
          <div className="dashboard-panel">
            <h3>Devices by location</h3>
            {devicesByLocation.length === 0 ? (
              <p className="dashboard-muted">No devices yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Total</th>
                    <th>Deployed</th>
                    <th>Not deployed</th>
                  </tr>
                </thead>
                <tbody>
                  {devicesByLocation.map((row) => (
                    <tr key={row.location}>
                      <td>{row.location}</td>
                      <td>{row.total}</td>
                      <td>{row.deployed}</td>
                      <td>{row.notDeployed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>Devices by type</h3>
            {devicesByType.length === 0 ? (
              <p className="dashboard-muted">No devices yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {devicesByType.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>Top models</h3>
            {topModels.length === 0 ? (
              <p className="dashboard-muted">No devices yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topModels.map((model) => (
                    <tr key={model.label}>
                      <td>{model.label}</td>
                      <td>{model.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2>Recent activity</h2>
        <div className="dashboard-panel">
          {recentActivity.length === 0 ? (
            <p className="dashboard-muted">
              Activity log coming soon. This will show assignments, edits, and
              inventory changes.
            </p>
          ) : (
            <ul className="dashboard-activity">
              {recentActivity.map((entry, index) => {
                const description =
                  entry.description ||
                  entry.action ||
                  entry.summary ||
                  "Activity updated.";
                const timestamp =
                  entry.timestamp || entry.time || entry.date || "";
                return (
                  <li className="dashboard-activity-item" key={entry.id || index}>
                    {timestamp && (
                      <span className="dashboard-muted">{timestamp}</span>
                    )}
                    <span>{description}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
