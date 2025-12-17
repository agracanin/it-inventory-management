export function normalizeStatus(status) {
  const s = status?.trim().toLowerCase();
  return s === "deployed" ? "deployed" : "not_deployed";
}

export function getStatusLabel(status) {
  return normalizeStatus(status) === "deployed" ? "Deployed" : "Not deployed";
}

export function getStatusClassName(status) {
  return normalizeStatus(status) === "deployed"
    ? "status-badge status-badge--deployed"
    : "status-badge status-badge--not-deployed";
}