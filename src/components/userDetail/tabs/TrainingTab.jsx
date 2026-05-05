import { useEffect, useState } from "react";
import { getUserTrainingProgress } from "../../../api/admin";

export default function TrainingTab({ userId }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading]   = useState(true);

 useEffect(() => {
  let isMounted = true;

  getUserTrainingProgress(userId)
    .then(r => {
      if (isMounted) setProgress(r.data || []);
    })
    .catch(() => {})
    .finally(() => {
      if (isMounted) setLoading(false);
    });

  return () => {
    isMounted = false;
  };
}, [userId]);

  return (
    <div>
      <div className="ud-section-header">
        <h2 className="ud-section-title">Training Progress</h2>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {progress.length} module{progress.length !== 1 ? "s" : ""} started
        </span>
      </div>

      {loading && (
        <div className="ud-qs-detail__loading">Loading training data…</div>
      )}

      {!loading && progress.length === 0 && (
        <div className="ud-empty-state">
          <div className="ud-empty-state__icon" style={{ fontSize: 36 }}>🎓</div>
          <div className="ud-empty-state__title">No training activity yet</div>
          <p className="ud-empty-state__desc">This user hasn&apos;t started any training modules.</p>
        </div>
      )}

      {!loading && progress.length > 0 && (
        <div className="ud-training-list">
          {progress.map(mod => {
            const pct    = mod.completion_pct || 0;
            const isDone = pct >= 100;
            const lastAct = mod.last_activity
              ? new Date(mod.last_activity).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—";

            return (
              <div key={mod.id} className="ud-training-item">

                <div className="ud-training-thumb">
                  {mod.thumbnail_url
                    ? <img src={mod.thumbnail_url} alt="" />
                    : <span>🎓</span>
                  }
                </div>

                <div className="ud-training-info">
                  <div className="ud-training-title">{mod.title}</div>
                  <div className="ud-training-meta">
                    {(mod.categories || []).map(c => c.name).join(", ") || "Uncategorized"}
                    {" · "}Last active: {lastAct}
                  </div>
                  <div className="ud-training-progress-row">
                    <div className="ud-training-bar">
                      <div
                        className={`ud-training-bar__fill${isDone ? " ud-training-bar__fill--done" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`ud-training-pct${isDone ? " ud-training-pct--done" : ""}`}>{pct}%</span>
                  </div>
                </div>

                <div className="ud-training-stats">
                  <div className="ud-training-sessions">{mod.completed_sessions} / {mod.total_sessions}</div>
                  <div className="ud-field-label">sessions</div>
                  {isDone && (
                    <span className="ud-qs-status ud-qs-status--completed" style={{ marginTop: 6, display: "inline-block" }}>
                      ✓ Completed
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
