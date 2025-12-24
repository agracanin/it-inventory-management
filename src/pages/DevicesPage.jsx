import { useEffect, useState } from "react";
import { normalizeStatus } from "../utils/deviceStatus";
import {
  findCatalogItemId,
  resolveDeviceCatalogFields,
} from "../utils/deviceCatalog";
import DeviceFilters from "../components/devices/DeviceFilters";
import DeviceTable from "../components/devices/DeviceTable";
import DeviceForm from "../components/devices/DeviceForm";

function DevicesPage({
  devices,
  users,
  locations,
  onAddDevice,
  onUpdateDevice,
  deviceTypes,
  deviceCatalog,
}) {
  // ADD DEVICE
  const [isAdding, setIsAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    id: "",
    serialNumber: "",
    type: "",
    make: "",
    model: "",
    location: "",
    notes: "",
    assignedToUserId: "",
    catalogItemId: "",
  });

  // FILTERS / SEARCH
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // EDIT DEVICE
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    serialNumber: "",
    type: "",
    make: "",
    model: "",
    location: "",
    notes: "",
    assignedToUserId: "",
    catalogItemId: "",
  });

  // Close edit when filters/search change
  useEffect(() => {
    setEditingDeviceId(null);
  }, [filterStatus, searchTerm]);

  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unassigned";
  };

  const totalDevices = devices.length;
  const deployedCount = devices.filter(
    (d) => normalizeStatus(d.status) === "deployed"
  ).length;
  const notDeployedCount = totalDevices - deployedCount;

  const filteredDevices = devices.filter((device) => {
    const status = normalizeStatus(device.status);
    const matchesStatus = filterStatus === "all" || status === filterStatus;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesStatus;

    const displayFields = resolveDeviceCatalogFields(device, deviceCatalog);
    const haystack = [
      device.id,
      device.serialNumber,
      displayFields.type,
      displayFields.make,
      displayFields.model,
      device.location,
      getUserName(device.assignedToUserId),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && haystack.includes(term);
  });

  // Handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "type") {
        next.make = "";
        next.model = "";
        next.catalogItemId = "";
      }

      if (name === "make") {
        next.model = "";
        next.catalogItemId = "";
      }

      if (name === "model") {
        next.catalogItemId = findCatalogItemId(
          deviceCatalog,
          next.type,
          next.make,
          value
        );
      }

      return next;
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "type") {
        next.make = "";
        next.model = "";
        next.catalogItemId = "";
      }

      if (name === "make") {
        next.model = "";
        next.catalogItemId = "";
      }

      if (name === "model") {
        next.catalogItemId = findCatalogItemId(
          deviceCatalog,
          next.type,
          next.make,
          value
        );
      }

      return next;
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    if (!addFormData.id.trim()) {
      alert("ID is required.");
      return;
    }

    onAddDevice({
      id: addFormData.id.trim(),
      serialNumber: addFormData.serialNumber.trim(),
      type: addFormData.type.trim(),
      make: addFormData.make.trim(),
      model: addFormData.model.trim(),
      location: addFormData.location.trim(),
      notes: addFormData.notes.trim(),
      assignedToUserId: addFormData.assignedToUserId.trim() || null,
      catalogItemId: addFormData.catalogItemId || null,
    });

    setAddFormData({
      id: "",
      serialNumber: "",
      type: "",
      make: "",
      model: "",
      location: "",
      notes: "",
      assignedToUserId: "",
      catalogItemId: "",
    });
    setIsAdding(false);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const startEditDevice = (device) => {
    const displayFields = resolveDeviceCatalogFields(device, deviceCatalog);
    const catalogItemId =
      device.catalogItemId ||
      findCatalogItemId(
        deviceCatalog,
        displayFields.type,
        displayFields.make,
        displayFields.model
      );

    setEditingDeviceId(device.id);
    setEditFormData({
      id: device.id,
      serialNumber: device.serialNumber || "",
      type: displayFields.type || "",
      make: displayFields.make || "",
      model: displayFields.model || "",
      location: device.location || "",
      notes: device.notes || "",
      assignedToUserId: device.assignedToUserId || "",
      catalogItemId,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (!editFormData.id.trim()) {
      alert("ID is required.");
      return;
    }

    onUpdateDevice(editingDeviceId, {
      id: editFormData.id.trim(),
      serialNumber: editFormData.serialNumber.trim(),
      type: editFormData.type.trim(),
      make: editFormData.make.trim(),
      model: editFormData.model.trim(),
      location: editFormData.location.trim(),
      notes: editFormData.notes.trim(),
      assignedToUserId: editFormData.assignedToUserId.trim() || null,
      catalogItemId: editFormData.catalogItemId || null,
    });

    setEditingDeviceId(null);
    setEditFormData({
      id: "",
      serialNumber: "",
      type: "",
      make: "",
      model: "",
      location: "",
      notes: "",
      assignedToUserId: "",
      catalogItemId: "",
    });
  };

  const handleEditCancel = () => {
    setEditingDeviceId(null);
  };

  return (
    <section>
      <h1>Devices</h1>
      <p>List of all inventory devices.</p>

      <div className="devices-summary">
        <span>Total: {totalDevices}</span>
        <span>Deployed: {deployedCount}</span>
        <span>Not deployed: {notDeployedCount}</span>
      </div>

      <div className="devices-actions">
        {!isAdding && (
          <button type="button" className="btn" onClick={() => setIsAdding(true)}>
            + Add device
          </button>
        )}
      </div>

      {isAdding && (
        <DeviceForm
          title={null}
          users={users}
          locations={locations}
          deviceTypes={deviceTypes}
          deviceCatalog={deviceCatalog}
          formData={addFormData}
          onChange={handleAddChange}
          onSubmit={handleAddSubmit}
          onCancel={handleAddCancel}
          submitLabel="Save device"
        />
      )}

      <DeviceFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <DeviceTable
        devices={filteredDevices}
        getUserName={getUserName}
        onEditClick={startEditDevice}
        deviceCatalog={deviceCatalog}
      />

      {editingDeviceId && (
        <DeviceForm
          title="Edit device"
          users={users}
          locations={locations}
          deviceTypes={deviceTypes}
          deviceCatalog={deviceCatalog}
          formData={editFormData}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          submitLabel="Save changes"
        />
      )}
    </section>
  );
}

export default DevicesPage;
