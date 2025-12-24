const normalizeValue = (value) => (value ?? "").trim().toLowerCase();

export const resolveDeviceCatalogFields = (device, deviceCatalog = []) => {
  const fallback = {
    type: device?.type || "",
    make: device?.make || "",
    model: device?.model || "",
  };

  if (!device?.catalogItemId) {
    return fallback;
  }

  const entry = deviceCatalog.find((item) => item.id === device.catalogItemId);
  if (!entry) {
    return fallback;
  }

  return {
    type: entry.type ?? fallback.type,
    make: entry.make ?? fallback.make,
    model: entry.model ?? fallback.model,
  };
};

export const findCatalogItemId = (deviceCatalog = [], type, make, model) => {
  const match = deviceCatalog.find(
    (item) =>
      normalizeValue(item.type) === normalizeValue(type) &&
      normalizeValue(item.make) === normalizeValue(make) &&
      normalizeValue(item.model) === normalizeValue(model)
  );

  return match ? match.id : "";
};
