function DeviceFilters({ filterStatus, setFilterStatus, searchTerm, setSearchTerm }) {
  return (
    <div className="devices-filters">
      <div className="devices-filter-status">
        <button
          type="button"
          className={filterStatus === "all" ? "chip chip--active" : "chip"}
          onClick={() => setFilterStatus("all")}
        >
          All
        </button>

        <button
          type="button"
          className={filterStatus === "deployed" ? "chip chip--active" : "chip"}
          onClick={() => setFilterStatus("deployed")}
        >
          Deployed
        </button>

        <button
          type="button"
          className={filterStatus === "not_deployed" ? "chip chip--active" : "chip"}
          onClick={() => setFilterStatus("not_deployed")}
        >
          Not deployed
        </button>
      </div>

      <div className="devices-search">
        <input
          type="text"
          placeholder="Search by ID, serial, type, make, model, location, user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DeviceFilters;