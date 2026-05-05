import { useState } from "react";
import { getSubmissionDetail } from "../../../api/admin";

export default function QuestionnairesTab({ qs }) {
  const [activeQsId, setActiveQsId] = useState(null);
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleSelect = (q) => {
    if (q.status !== "Completed") return;
    if (activeQsId === q.id) {
      setActiveQsId(null);
      setDetail(null);
      return;
    }
    setActiveQsId(q.id);
    setDetail(null);
    setDetailLoading(true);
    getSubmissionDetail(q.id)
      .then(r => setDetail(r.data))
      .catch(() => setDetail({ error: true }))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div>
      <div className="ud-section-header">
        <h2 className="ud-section-title">Questionnaires</h2>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{qs.length} total</span>
      </div>

      <div className="ud-qs-layout">

        {/* ── Left: list ── */}
        <div className="ud-qs-list">
          {qs.length === 0 ? (
            <div className="ud-empty-state">
              <div className="ud-empty-state__title">No questionnaire assignments yet</div>
            </div>
          ) : (
            qs.map((q) => {
              const isCompleted = q.status === "Completed";
              const title    = q.questionnaire_template?.title || "Questionnaire";
              const category = q.questionnaire_template?.category || "";
              const score    = q.overall_score ?? q.scores?.overall_score ?? null;
              const isActive = q.id === activeQsId;

              return (
                <div
                  key={q.id}
                  className={`ud-qs-item${isActive ? " ud-qs-item--selected" : ""}${isCompleted ? " ud-qs-item--clickable" : ""}`}
                  onClick={() => handleSelect(q)}
                >
                  <div className={`ud-qs-item__icon${isCompleted ? " ud-qs-item__icon--done" : ""}`}>
                    {isCompleted ? "✓" : "📋"}
                  </div>

                  <div className="ud-qs-item__info">
                    <div className="ud-qs-item__title">{title}</div>
                    <div className="ud-qs-item__meta">
                      {category && (
                        <span className="ud-tag ud-tag--medication">{category}</span>
                      )}
                      {q.completed_at && (
                        <span>{new Date(q.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                      {!isCompleted && q.scheduled_for && (
                        <span>Due: {new Date(q.scheduled_for).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>

                  <div className="ud-qs-item__right">
                    <span className={`ud-qs-status${isCompleted ? " ud-qs-status--completed" : " ud-qs-status--pending"}`}>
                      {q.status}
                    </span>
                    {isCompleted && score !== null && (
                      <div className="ud-qs-item__score">{Number(score).toFixed(1)} pts</div>
                    )}
                    {isCompleted && <div className="ud-qs-item__hint">View responses →</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Right: detail panel ── */}
        {activeQsId !== null && (
          <div className="ud-qs-detail">

            <div className="ud-qs-detail__header">
              <div>
                <div className="ud-qs-detail__title">
                  {detail?.questionnaire?.title || "Loading…"}
                </div>
                {detail?.questionnaire?.category && (
                  <span className="ud-tag ud-tag--medication" style={{ marginTop: 4, display: "inline-block" }}>
                    {detail.questionnaire.category}
                  </span>
                )}
              </div>
              <button
                className="ud-qs-detail__close"
                onClick={() => { setActiveQsId(null); setDetail(null); }}
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="ud-qs-detail__loading">Loading responses…</div>
            ) : detail?.error ? (
              <div className="ud-qs-detail__error">Failed to load responses.</div>
            ) : detail && (
              <div className="ud-qs-detail__body">

                {/* Score summary */}
                <div className="ud-qs-detail__scores">
                  <div>
                    <div className="ud-field-label">Score</div>
                    <div className="ud-qs-detail__score-val">
                      {detail.overall_score != null ? Number(detail.overall_score).toFixed(1) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="ud-field-label">Answered</div>
                    <div className="ud-qs-detail__score-val ud-qs-detail__score-val--dark">
                      {detail.answered}/{detail.total_questions}
                    </div>
                  </div>
                  {detail.domain_scores && Object.keys(detail.domain_scores).length > 0 && (
                    <div style={{ flex: 1 }}>
                      <div className="ud-field-label">Domains</div>
                      <div className="ud-qs-detail__domains">
                        {Object.entries(detail.domain_scores).slice(0, 4).map(([k, v]) => (
                          <span key={k} className="ud-qs-domain-pill">
                            {k}: {typeof v === "number" ? v.toFixed(0) : v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Questions + answers */}
                <div className="ud-qs-answers">
                  {(detail.answers || []).map((a, idx) => (
                    <div key={a.question_id} className="ud-qs-answer">

                      <div className="ud-qs-answer__q">
                        <span className="ud-qs-answer__num">Q{idx + 1}</span>
                        <div>
                          <div className="ud-qs-answer__text">{a.question_text}</div>
                          <span className="ud-qs-answer__type">{a.question_type}</span>
                        </div>
                      </div>

                      <div className="ud-qs-answer__val">
                        {a.answer.display === null ? (
                          <span className="ud-qs-answer__empty">Not answered</span>
                        ) : a.question_type === "Rating" ? (
                          <div className="ud-qs-rating">
                            {[1, 2, 3, 4, 5].map(s => (
                              <span key={s} className={`ud-qs-star${s <= Number(a.answer.display) ? " ud-qs-star--filled" : ""}`}>★</span>
                            ))}
                            <span className="ud-qs-rating__label">{a.answer.display}/5</span>
                          </div>
                        ) : a.question_type === "Checkboxes" ? (
                          <div className="ud-qs-pills">
                            {(Array.isArray(a.answer.display) ? a.answer.display : [a.answer.display]).map((val, vi) => (
                              <span key={vi} className="ud-qs-check-pill">✓ {val}</span>
                            ))}
                          </div>
                        ) : a.question_type === "Multiple choice" || a.question_type === "Dropdown" ? (
                          <div className="ud-qs-mcq-answer">
                            <span className="ud-qs-mcq-dot" />
                            <span>{a.answer.display}</span>
                          </div>
                        ) : (
                          <div className="ud-qs-text-answer">{a.answer.display}</div>
                        )}

                        {["Multiple choice", "Checkboxes", "Dropdown"].includes(a.question_type) &&
                          Array.isArray(a.options) && a.options.length > 0 && (
                          <div className="ud-qs-options">
                            {a.options.map((opt, oi) => {
                              const label = typeof opt === "object" ? (opt.label || opt.text || String(opt)) : String(opt);
                              const chosen = Array.isArray(a.answer.display)
                                ? a.answer.display.includes(label)
                                : String(a.answer.display) === label;
                              return (
                                <span key={oi} className={`ud-qs-option${chosen ? " ud-qs-option--chosen" : ""}`}>
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
