import { MdAccessTime, MdRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const getLastActiveDetails = (dateStr) => {
  if (!dateStr) return { text: "-", bg: "#F3F4F6", color: "#6B7280" };
  const date = new Date(dateStr);
  const diffHours = (new Date() - date) / (1000 * 60 * 60);
  if (diffHours < 24) return { text: "Today", bg: "#FFF0F0", color: "#FF5C5C" };
  if (diffHours < 48)
    return { text: "1 hr ago", bg: "#EFF6FF", color: "#3B82F6" };
  return {
    text: `${Math.floor(diffHours / 24)} days ago`,
    bg: "#F3F4F6",
    color: "#6B7280",
  };
};

const getQStatusFmt = (userQs) => {
  if (!userQs || userQs.length === 0) return { text: "0/0", color: "#9CA3AF" };
  const completed = userQs.filter((q) => q.status === "Completed").length;
  const total = userQs.length;
  if (completed === total)
    return { text: `${completed}/${total}`, color: "#00C9A7" };
  if (completed === 0) return { text: `0/${total}`, color: "#FF5C5C" };
  return { text: `${completed}/${total}`, color: "#FFB020" };
};

export default function UsersTable({
  users,
  loading,
  selectedIds,
  toggleAll,
  toggleSelection,
}) {
  const navigate = useNavigate();

  return (
    <table className="users-table">
      <thead>
        <tr className="ut-head-row">
          <th className="ut-th ut-th--checkbox">
            <input
              type="checkbox"
              onChange={toggleAll}
              className="ut-checkbox"
            />
          </th>
          <th className="ut-th">Name</th>
          <th className="ut-th">Phone</th>
          <th className="ut-th">Program</th>
          <th className="ut-th">Enrolled</th>
          <th className="ut-th ut-th--center">Last Active</th>
          <th className="ut-th ut-th--center">Q-Status</th>
          <th className="ut-th ut-th--center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={8}>
              <div className="full-center">
                <div className="spinner" />
              </div>
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={8} className="ut-empty-cell">
              No users found
            </td>
          </tr>
        ) : (
          users.map((u) => {
            const act = getLastActiveDetails(u.last_login_at);
            const qs = getQStatusFmt(u.user_questionnaires);
            return (
              <tr key={u.id} className="ut-row">
                <td className="ut-td">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={() => toggleSelection(u.id)}
                    className="ut-checkbox"
                  />
                </td>
                <td className="ut-td ut-td--name">
                  {u.name || "Unknown User"}
                </td>
                <td className="ut-td ut-td--muted">{u.phone_number}</td>
                <td className="ut-td ut-td--muted">Wellness 2025</td>
                <td className="ut-td ut-td--muted">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="ut-td ut-td--center">
                  {/* bg and color are programmatically computed — kept inline */}
                  <span
                    className="last-active-badge"
                    style={{ background: act.bg, color: act.color }}
                  >
                    <MdAccessTime size={14} /> {act.text}
                  </span>
                </td>
                <td className="ut-td ut-td--center" style={{ color: qs.color }}>
                  {/* color is programmatically computed — kept inline */}
                  <span className="q-status-inner">{qs.text}</span>
                </td>
                <td className="ut-td ut-td--center">
                  <button
                    className="btn btnView"
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.9823 9.99993C12.9823 11.6499 11.649 12.9833 9.99896 12.9833C8.34896 12.9833 7.01562 11.6499 7.01562 9.99993C7.01562 8.34993 8.34896 7.0166 9.99896 7.0166C11.649 7.0166 12.9823 8.34993 12.9823 9.99993Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.0018 16.8913C12.9435 16.8913 15.6852 15.1579 17.5935 12.1579C18.3435 10.9829 18.3435 9.00794 17.5935 7.83294C15.6852 4.83294 12.9435 3.09961 10.0018 3.09961C7.06016 3.09961 4.31849 4.83294 2.41016 7.83294C1.66016 9.00794 1.66016 10.9829 2.41016 12.1579C4.31849 15.1579 7.06016 16.8913 10.0018 16.8913Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
