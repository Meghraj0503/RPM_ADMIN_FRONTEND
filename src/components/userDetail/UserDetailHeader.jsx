import { MdArrowBack, MdFileDownload, MdDeleteOutline } from "react-icons/md";

export default function UserDetailHeader({ u, onBack, onViewHistory, inHeader = false }) {
  return (
    <>
      <div className={`ud-header${inHeader ? " ud-header--in-topbar" : ""}`}>
        <div className="ud-header-left">
          <button className="ud-back-btn" onClick={onBack}>
            <MdArrowBack />
          </button>
          <div>
            <div className="ud-name-row">
              <h1 className="ud-name">{u.name || "Unknown"}</h1>
              <span
                className={`ud-status-badge ${u.is_active ? "ud-status-badge--active" : "ud-status-badge--inactive"}`}
              >
                <span className="ud-status-badge__dot"></span>
                {u.is_active ? "Account Active" : "Inactive"}
              </span>
            </div>
            <div className="ud-user-id">User ID : {u.id}</div>
          </div>
        </div>
        <div className="ud-header-right">
          <button className="ud-icon-btn">
            <MdFileDownload />
          </button>
          <button className="ud-icon-btn">
            <MdDeleteOutline />
          </button>
          <button className="ud-history-btn" onClick={onViewHistory}>
            View History
          </button>
        </div>
      </div>
    </>
  );
}
