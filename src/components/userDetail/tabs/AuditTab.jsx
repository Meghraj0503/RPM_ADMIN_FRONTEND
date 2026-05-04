import { useState } from "react";

const AUDIT_CATEGORIES = ["All Changes", "Personal Info", "Medical", "Lifestyle", "Program", "Device"];
const CATEGORY_COLORS  = {
  "Personal Info": { bg: "#E8F5FF", color: "#2D9EF0" },
  Medical:         { bg: "#FFF0F0", color: "#FF5C5C" },
  Lifestyle:       { bg: "#FFF8EC", color: "#FFB020" },
  Program:         { bg: "#E8FBF7", color: "#00C9A7" },
  Device:          { bg: "#FFF3E0", color: "#F97316" },
  Other:           { bg: "#F3F4F6", color: "#6B7280" },
};
const AUDIT_PAGE_SIZE = 20;

const formatAuditChanges = (log) => {
  const j = log.changes_json || {};
  const entries = [];
  Object.entries(j)
    .filter(([k]) => !["user_id", "admin_id"].includes(k))
    .forEach(([k, v]) => {
      if (v !== null && typeof v === "object" && ("old" in v || "new" in v)) {
        entries.push([k, v.old, v.new]);
      } else {
        entries.push([k, null, v]);
      }
    });
  return entries;
};

const formatActionLabel = (type) => {
  const m = {
    PROFILE_UPDATED:         "Profile updated",
    USER_CREATED:            "User created",
    ACTIVATED:               "Account activated",
    DEACTIVATED:             "Account deactivated",
    MEDICAL_PROFILE_UPDATED: "Medical profile updated",
    LIFESTYLE_UPDATED:       "Lifestyle updated",
    PROGRAM_CHANGED:         "Program changed",
    REMOVED_FROM_PROGRAM:    "Removed from program",
    DEVICE_ASSIGNED:         "Device assigned",
    DEVICE_REMOVED:          "Device removed",
  };
  return m[type] || type;
};

export default function AuditTab({ u, audit }) {
  const [auditCategory, setAuditCategory] = useState("All Changes");
  const [auditFrom,     setAuditFrom]     = useState("");
  const [auditTo,       setAuditTo]       = useState("");
  const [auditPage,     setAuditPage]     = useState(1);
  const [expandedAudit, setExpandedAudit] = useState({});

  const filteredAudit = audit.filter(a => {
    if (auditCategory !== "All Changes" && a.category !== auditCategory) return false;
    if (auditFrom && new Date(a.created_at) < new Date(auditFrom)) return false;
    if (auditTo) {
      const d = new Date(auditTo);
      d.setHours(23, 59, 59, 999);
      if (new Date(a.created_at) > d) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAudit.length / AUDIT_PAGE_SIZE);
  const pagedAudit = filteredAudit.slice(
    (auditPage - 1) * AUDIT_PAGE_SIZE,
    auditPage * AUDIT_PAGE_SIZE,
  );

  const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(l => {
      const key = new Date(l.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    });
    return groups;
  };
  const auditGroups = groupByDate(pagedAudit);

  return (
    <div>
      <div className="ud-audit-header">
        <h2 className="ud-section-title">History — {u?.name || "User"}</h2>
        <button
          className="ud-audit-export-btn"
          onClick={() => {
            const csv  = audit.map(a => `${a.created_at},${a.category},${a.action_type},${JSON.stringify(a.changes_json)}`).join("\n");
            const blob = new Blob([`Date,Category,Action,Details\n${csv}`], { type: "text/csv" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href = url; a.download = "audit_log.csv"; a.click();
          }}
        >
          ↑ Export Audit Log (CSV)
        </button>
      </div>

      <div className="ud-audit-filter-bar">
        <input
          type="date" value={auditFrom}
          onChange={e => { setAuditFrom(e.target.value); setAuditPage(1); }}
          className="ud-audit-date-input" placeholder="DD-MM-YYYY"
        />
        <span className="ud-audit-arrow">→</span>
        <input
          type="date" value={auditTo}
          onChange={e => { setAuditTo(e.target.value); setAuditPage(1); }}
          className="ud-audit-date-input" placeholder="DD-MM-YYYY"
        />
        <select
          value={auditCategory}
          onChange={e => { setAuditCategory(e.target.value); setAuditPage(1); }}
          className="ud-audit-select"
        >
          {AUDIT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="ud-audit-spacer" />
        {[7, 30, 90, "All Time"].map(d => (
          <button
            key={d}
            className="ud-audit-period-btn"
            onClick={() => {
              if (d === "All Time") { setAuditFrom(""); setAuditTo(""); }
              else {
                const from = new Date();
                from.setDate(from.getDate() - d);
                setAuditFrom(from.toISOString().split("T")[0]);
                setAuditTo("");
              }
              setAuditPage(1);
            }}
          >
            {d === 7 ? "07 Days" : d === 30 ? "30 Days" : d === 90 ? "90 Days" : "All Time"}
          </button>
        ))}
      </div>

      <div className="ud-audit-count">
        {filteredAudit.length} changes recorded · Showing{" "}
        {Math.min((auditPage - 1) * AUDIT_PAGE_SIZE + 1, filteredAudit.length)}–{Math.min(auditPage * AUDIT_PAGE_SIZE, filteredAudit.length)}
      </div>

      {filteredAudit.length === 0 ? (
        <div className="ud-audit-empty">No audit records found.</div>
      ) : (
        Object.entries(auditGroups).map(([date, logs]) => (
          <div key={date} className="ud-audit-group">
            <div className="ud-audit-group__header">
              <span className="ud-audit-group__date">{date}</span>
              <span className="ud-audit-group__count">{logs.length} change{logs.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="ud-audit-entries">
              {logs.map((log, li) => {
                const tag      = CATEGORY_COLORS[log.category] || CATEGORY_COLORS["Other"];
                const expanded = expandedAudit[log.id];
                const changes  = formatAuditChanges(log);
                const time     = new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                return (
                  <div key={log.id || li} className={li < logs.length - 1 ? "ud-audit-entry--bordered" : ""}>
                    <div
                      className="ud-audit-entry__row"
                      onClick={() => setExpandedAudit(p => ({ ...p, [log.id]: !p[log.id] }))}
                    >
                      <div className="ud-audit-entry__left">
                        {/* bg/color from CATEGORY_COLORS map — kept inline */}
                        <span className="ud-audit-category" style={{ background: tag.bg, color: tag.color }}>
                          {log.category || "Other"}
                        </span>
                        <span className="ud-audit-action">{formatActionLabel(log.action_type)}</span>
                      </div>
                      <div className="ud-audit-entry__right">
                        <span className="ud-audit-time">Admin {time}</span>
                        <span className="ud-audit-caret">{expanded ? "∧" : "∨"}</span>
                      </div>
                    </div>
                    {expanded && (
                      <div className="ud-audit-expand">
                        <div className="ud-audit-expand__title">Change Details</div>
                        <table className="ud-audit-changes-table">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Old Value</th>
                              <th>New Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {changes.length === 0 ? (
                              <tr><td colSpan={3} className="ac-empty">No details recorded</td></tr>
                            ) : (
                              changes.map(([k, oldV, newV], ci) => {
                                const fmt = v => (v == null || v === "" || (Array.isArray(v) && v.length === 0))
                                  ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
                                return (
                                  <tr key={ci}>
                                    <td className="ac-field">{k.replace(/_/g, " ")}</td>
                                    <td className="ac-old">{fmt(oldV)}</td>
                                    <td>{fmt(newV)}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                        <div className="ud-audit-footer">
                          Modified · Session ID: ADM-{log.admin_id} · {new Date(log.created_at).toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="ud-pagination">
          <button
            className="ud-pagination__nav-btn"
            onClick={() => setAuditPage(p => Math.max(1, p - 1))}
            disabled={auditPage === 1}
          >‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setAuditPage(p)}
              className={`ud-pagination__page ${auditPage === p ? "ud-pagination__page--active" : "ud-pagination__page--inactive"}`}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && (
            <span className="ud-pagination__ellipsis">... {totalPages}</span>
          )}
          <button
            className="ud-pagination__nav-btn"
            onClick={() => setAuditPage(p => Math.min(totalPages, p + 1))}
            disabled={auditPage === totalPages}
          >›</button>
        </div>
      )}
    </div>
  );
}
