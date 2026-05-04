export default function DevicesTab({
  deviceList,
  showAssignForm, setShowAssignForm,
  deviceForm, setDeviceForm,
  deviceSaving,
  handleAssignDevice,
  handleRemoveDevice,
}) {
  return (
    <div>
      <div className="ud-device-header">
        <h2>Wearable Device Assignment</h2>
        <p>Manage smartwatch connections for automatic health data sync</p>
      </div>

      <div className="ud-device-panel">
        {!showAssignForm && deviceList.length === 0 && (
          <div className="ud-empty-state">
            <div className="ud-empty-state__icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="20" y="18" width="24" height="28" rx="6" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                <rect x="24" y="12" width="16" height="8"  rx="2" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                <rect x="24" y="44" width="16" height="8"  rx="2" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                <circle cx="32" cy="32" r="6" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                <line x1="32" y1="28" x2="32" y2="32" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="32" y1="32" x2="35" y2="32" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ud-empty-state__title">No device assigned</div>
            <p className="ud-empty-state__desc">
              Assign a Fastrack or Titan smartwatch to<br />enable automatic health data sync.
            </p>
            <button onClick={() => setShowAssignForm(true)} className="ud-assign-btn">
              + Assign Device
            </button>
          </div>
        )}

        {!showAssignForm && deviceList.length > 0 && (
          <div>
            {deviceList.map(d => (
              <div key={d.id} className="ud-device-item">
                <div className="ud-device-item__left">
                  <div className="ud-device-icon">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                      <rect x="20" y="18" width="24" height="28" rx="6" stroke="#00C9A7" strokeWidth="2.5" fill="none"/>
                      <circle cx="32" cy="32" r="5" stroke="#00C9A7" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ud-device-name">{d.nickname || d.device_name || "Smartwatch"}</div>
                    <div className="ud-device-mac">{d.mac_address}</div>
                    {d.assigned_at && (
                      <div className="ud-device-assigned">
                        Assigned {new Date(d.assigned_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => handleRemoveDevice(d.id)} className="ud-device-remove-btn">
                  Remove
                </button>
              </div>
            ))}
            <button onClick={() => setShowAssignForm(true)} className="ud-assign-another-btn">
              + Assign Another Device
            </button>
          </div>
        )}

        {showAssignForm && (
          <div>
            <h3 className="ud-device-form-title">Assign New Device</h3>
            <div className="ud-device-form-grid">
              <div>
                <label className="ud-device-form-label">
                  Device Serial Number <span className="ud-device-form-req">*</span>
                </label>
                <input
                  type="text"
                  value={deviceForm.mac_address}
                  onChange={e => setDeviceForm(f => ({ ...f, mac_address: e.target.value }))}
                  placeholder="Enter device serial number"
                  className="ud-device-form-input"
                />
                <div className="ud-device-form-hint">
                  Supported device series: Fastrack · TITAN · FSI · Optimus · Reflex
                </div>
              </div>
              <div>
                <label className="ud-device-form-label">Device Nickname (Optional)</label>
                <input
                  type="text"
                  value={deviceForm.nickname}
                  onChange={e => setDeviceForm(f => ({ ...f, nickname: e.target.value }))}
                  placeholder="e.g. My Watch"
                  className="ud-device-form-input"
                />
              </div>
            </div>
            <div className="ud-device-form-actions">
              <button onClick={handleAssignDevice} disabled={deviceSaving} className="ud-device-save-btn">
                {deviceSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => { setShowAssignForm(false); setDeviceForm({ mac_address: "", nickname: "" }); }}
                className="ud-device-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
