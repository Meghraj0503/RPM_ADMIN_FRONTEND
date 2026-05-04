import { useEffect, useState } from "react";
import { getUsers, exportData } from "../api/admin";
import { MdFileDownload } from "react-icons/md";
import UsersFilterBar from "../components/users/UsersFilterBar";
import UsersTable from "../components/users/UsersTable";
import "./style.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [program, setProgram] = useState("");
  const [activityStatus, setActivityStatus] = useState("");
  const [qStatus, setQStatus] = useState("");
  const [enrollStatus, setEnrollStatus] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    getUsers({
      search,
      page,
      limit: 8,
      activity_status: activityStatus,
      q_status: qStatus,
      program,
      enroll_status: enrollStatus,
    })
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page, activityStatus, qStatus, program, enrollStatus]);

  const handleExport = async (format) => {
    try {
      const payload = { ids: Array.from(selectedIds), format };
      const res = await exportData("users", payload);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Users_Export_${new Date().getTime()}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("Export failed");
    }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(users.map((u) => u.id)));
    else setSelectedIds(new Set());
  };

  return (
    <div>
      <div className="users-page-header">
        <h1 className="users-title">Users</h1>
        <div className="users-header-actions">
          <button
            onClick={() => handleExport("csv")}
            className="btn-export-pill btnExportLine"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.4405 8.90039C20.0405 9.21039 21.5105 11.0604 21.5105 15.1104V15.2404C21.5105 19.7104 19.7205 21.5004 15.2505 21.5004H8.74047C4.27047 21.5004 2.48047 19.7104 2.48047 15.2404V15.1104C2.48047 11.0904 3.93047 9.24039 7.47047 8.91039"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15.0001V3.62012"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.3484 5.85L11.9984 2.5L8.64844 5.85"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="btn-export-pill btnExportLine"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.4405 8.90039C20.0405 9.21039 21.5105 11.0604 21.5105 15.1104V15.2404C21.5105 19.7104 19.7205 21.5004 15.2505 21.5004H8.74047C4.27047 21.5004 2.48047 19.7104 2.48047 15.2404V15.1104C2.48047 11.0904 3.93047 9.24039 7.47047 8.91039"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15.0001V3.62012"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.3484 5.85L11.9984 2.5L8.64844 5.85"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="users-card userCardWrap">
        <UsersFilterBar
          search={search}
          setSearch={setSearch}
          program={program}
          setProgram={setProgram}
          activityStatus={activityStatus}
          setActivityStatus={setActivityStatus}
          qStatus={qStatus}
          setQStatus={setQStatus}
          enrollStatus={enrollStatus}
          setEnrollStatus={setEnrollStatus}
          resetPage={() => setPage(1)}
        />

        <UsersTable
          users={users}
          loading={loading}
          selectedIds={selectedIds}
          toggleAll={toggleAll}
          toggleSelection={toggleSelection}
        />

        <div className="users-pagination">
          <div className="users-pagination__inner">
            <button
              className="users-pagination__btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.32813 0.445259L0.443919 5.61081L5.32812 10.7764"
                  stroke="black"
                  strokeWidth="0.890065"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="users-pagination__current">{page}</span>
            <button
              className="users-pagination__btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={users.length < 8}
            >
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.445312 0.445259L5.32952 5.61081L0.445312 10.7764"
                  stroke="black"
                  strokeWidth="0.890065"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
