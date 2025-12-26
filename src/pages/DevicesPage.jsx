import { useState } from "react";
import { normalizeStatus } from "../utils/deviceStatus";
import {
  findCatalogItemId,
  resolveDeviceCatalogFields,
} from "../utils/deviceCatalog";
import DeviceFilters from "../components/devices/DeviceFilters";
import DeviceTable from "../components/devices/DeviceTable";
import DeviceForm from "../components/devices/DeviceForm";
import Modal from "../components/common/Modal";

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

  // MODAL
  const [modalMode, setModalMode] = useState(null);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

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
    setModalMode(null);
  };

  const handleAddCancel = () => {
    setModalMode(null);
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

    setModalMode("edit");
    setActiveDeviceId(device.id);
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

    onUpdateDevice(activeDeviceId, {
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

    setModalMode(null);
    setActiveDeviceId(null);
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
    setModalMode(null);
    setActiveDeviceId(null);
  };

  const openAddModal = () => {
    setModalMode("add");
    setActiveDeviceId(null);
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
        <button type="button" className="btn" onClick={openAddModal}>
          + Add device
        </button>
      </div>

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

      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        title={modalMode === "edit" ? "Edit device" : "Add device"}
        onClose={modalMode === "edit" ? handleEditCancel : handleAddCancel}
      >
        {modalMode === "add" && (
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
        {modalMode === "edit" && (
          <DeviceForm
            title={null}
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
      </Modal>
    </section>
  );
}

export default DevicesPage;
