export default function QuestionnairesTab({ qs }) {
  return (
    <div>
      <h2 className="ud-section-title ud-section-title--mb">Questionnaires</h2>
      <div className="ud-qs-card">
        {qs.length === 0 ? (
          <p className="ud-qs-empty">No questionnaire submissions yet.</p>
        ) : (
          <table className="ud-qs-table">
            <thead>
              <tr>
                {["#", "Submitted", "Status", "Total Score"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qs.map((q, i) => (
                <tr key={q.id} className="ud-qs-row">
                  <td className="qs-num">{i + 1}</td>
                  <td>{q.completed_at ? new Date(q.completed_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    <span className={`ud-qs-status ${q.status === "Completed" ? "ud-qs-status--completed" : "ud-qs-status--pending"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="qs-score">{q.overall_score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
