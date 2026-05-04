import { useState } from "react";
import { MdSwapHoriz, MdPersonRemove } from "react-icons/md";
import { PieChart, Pie, Cell } from "recharts";

export default function EnrollmentTab({ sub, qs, enrollmentHistory, onChangeProgram, onRemoveProgram }) {
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div>
      <h2 className="ud-section-title ud-section-title--mb">Program Enrollment</h2>

      <div className="ud-enrollment-card">
        {sub && sub.status === "Active" ? (
          <div className="ud-enrollment-split">
            <div className="ud-enrollment-left">
              <div className="ud-program-name-row">
                <span className="ud-program-dot"></span>
                <span className="ud-program-name">{sub.program_name || "Wellness Program 2025"}</span>
              </div>
              <div className="ud-enrollment-info-grid">
                {[
                  { label: "Enrollment Date", value: sub.start_date ? new Date(sub.start_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                  { label: "Enrolled by",     value: sub.enrolled_by || "System Auto" },
                  { label: "Duration",        value: sub.validity_days ? `${sub.validity_days} days Active` : "—" },
                  { label: "Role",            value: "Participant" },
                  { label: "Last Activity",   value: "Today at 11:32 am" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="ud-enrollment-info-label">{item.label}</div>
                    <div className="ud-enrollment-info-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ud-enrollment-right">
              <span className="ud-enrollment-badge">Active</span>
              <div className="ud-donut-wrap">
                <div className="ud-donut-label">Questionnaires</div>
                <div className="ud-donut-container">
                  <PieChart width={100} height={100}>
                    <Pie
                      data={[{ v: qs.length || 3 }, { v: Math.max(0, 10 - (qs.length || 3)) }]}
                      cx={45} cy={45} innerRadius={30} outerRadius={45}
                      startAngle={90} endAngle={-270} dataKey="v"
                    >
                      <Cell fill="#00C9A7" />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                  </PieChart>
                  <div className="ud-donut-center">
                    <div className="ud-donut-value">{qs.length || 3}</div>
                    <div className="ud-donut-sub">completed</div>
                  </div>
                </div>
              </div>
              <button onClick={onChangeProgram} className="ud-change-program-btn">
                <MdSwapHoriz size={18} /> Change Program
              </button>
              <button onClick={onRemoveProgram} className="ud-remove-program-btn">
                <MdPersonRemove size={18} /> Remove From Program
              </button>
            </div>
          </div>
        ) : (
          <div className="ud-enrollment-empty">
            <p>No program assigned.</p>
            <button className="ud-assign-program-btn" onClick={onChangeProgram}>
              Assign Program
            </button>
          </div>
        )}
      </div>

      <div className="ud-engagement-card">
        <h3 className="ud-engagement-card__title">Articles engagement metrics</h3>
        <div className="ud-engagement-split">
          <div className="ud-donut-wrap">
            <div className="ud-donut-label">Engagement activity</div>
            <div className="ud-donut-container">
              <PieChart width={120} height={120}>
                <Pie
                  data={[{ v: 3 }, { v: 7 }]}
                  cx={55} cy={55} innerRadius={35} outerRadius={55}
                  startAngle={90} endAngle={-270} dataKey="v"
                >
                  <Cell fill="#00C9A7" />
                  <Cell fill="#F3F4F6" />
                </Pie>
              </PieChart>
              <div className="ud-donut-center">
                <div className="ud-donut-value--lg">3</div>
                <div className="ud-donut-sub">completed</div>
              </div>
            </div>
          </div>
          <div className="ud-articles-list">
            <div className="ud-articles-list__title">Articles this week</div>
            {["Glycaemic load in Indian diets", "Breathing for anxiety relief", "HRV and late dinner"].map((title, i) => (
              <div key={i} className={`ud-article-item${i < 2 ? " ud-article-item--border" : ""}`}>
                <div className="ud-article-item__left">
                  <div className="ud-article-dot-wrap">
                    <span className="ud-article-dot"></span>
                  </div>
                  <span className="ud-article-title">{title}</span>
                </div>
                <div className="ud-article-item__right">
                  <span className="ud-article-read">Read</span>
                  <span className="ud-article-saved">Saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ud-history-card">
        <div
          className={`ud-history-header${historyOpen ? " ud-history-header--open" : ""}`}
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          <span className="ud-history-title">Enrollment History</span>
          <span className={`ud-history-caret${historyOpen ? " ud-history-caret--open" : ""}`}>⌃</span>
        </div>
        {historyOpen && (
          <div className="ud-history-body">
            <table className="ud-history-table">
              <thead>
                <tr>
                  {["Program", "Role", "Enrolled", "Remove", "Remove by"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollmentHistory.length === 0 ? (
                  <tr><td colSpan={5} className="ud-history-empty">No history yet</td></tr>
                ) : (
                  enrollmentHistory.map((log, i) => (
                    <tr key={i}>
                      <td>{log.program_name || "—"}</td>
                      <td>Participant</td>
                      <td>{log.created_at ? new Date(log.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                      <td>{log.action}</td>
                      <td>System Auto</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
