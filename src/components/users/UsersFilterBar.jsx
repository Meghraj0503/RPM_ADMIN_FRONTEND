import { MdSearch } from "react-icons/md";

const PROGRAM_OPTS = [
  { value: "", label: "Program" },
  { value: "wellness2025", label: "Wellness 2025" },
  { value: "diabetes", label: "Diabetes Management" },
  { value: "heart", label: "Heart Health" },
  { value: "postop", label: "Post-Op Recovery" },
];
const ACTIVITY_OPTS = [
  { value: "", label: "Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const Q_OPTS = [
  { value: "", label: "Q-Status" },
  { value: "Completed", label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
];
const ENROLL_OPTS = [
  { value: "", label: "Enrollment Status" },
  { value: "enrolled", label: "Enrolled" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped Out" },
];

export default function UsersFilterBar({
  search,
  setSearch,
  program,
  setProgram,
  activityStatus,
  setActivityStatus,
  qStatus,
  setQStatus,
  enrollStatus,
  setEnrollStatus,
  resetPage,
}) {
  return (
    <div className="users-filter-bar">
      <div className="users-search-wrap">
        <input
          className="users-search-input"
          placeholder="Search name, Phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.58464 17.5003C13.9569 17.5003 17.5013 13.9559 17.5013 9.58366C17.5013 5.2114 13.9569 1.66699 9.58464 1.66699C5.21238 1.66699 1.66797 5.2114 1.66797 9.58366C1.66797 13.9559 5.21238 17.5003 9.58464 17.5003Z"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.3346 18.3337L16.668 16.667"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="selectWrap">
        <select
          className="users-filter-select"
          value={program}
          onChange={(e) => {
            setProgram(e.target.value);
            resetPage();
          }}
        >
          {PROGRAM_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.7764 0.445313L5.61087 5.32952L0.445312 0.445312"
            stroke="black"
            strokeWidth="0.890065"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="selectWrap">
        <select
          className="users-filter-select"
          value={activityStatus}
          onChange={(e) => {
            setActivityStatus(e.target.value);
            resetPage();
          }}
        >
          {ACTIVITY_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.7764 0.445313L5.61087 5.32952L0.445312 0.445312"
            stroke="black"
            strokeWidth="0.890065"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="selectWrap">
        <select
          className="users-filter-select"
          value={qStatus}
          onChange={(e) => {
            setQStatus(e.target.value);
            resetPage();
          }}
        >
          {Q_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.7764 0.445313L5.61087 5.32952L0.445312 0.445312"
            stroke="black"
            strokeWidth="0.890065"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="selectWrap">
        <select
          className="users-filter-select"
          value={enrollStatus}
          onChange={(e) => {
            setEnrollStatus(e.target.value);
            resetPage();
          }}
        >
          {ENROLL_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.7764 0.445313L5.61087 5.32952L0.445312 0.445312"
            stroke="black"
            strokeWidth="0.890065"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
