import { MdDirectionsRun } from "react-icons/md";

export default function PersonalTab({ u, profile, age, toggleStatus }) {
  return (
    <div>
      <div className="ud-section-header">
        <h2 className="ud-section-title">Personal Information</h2>
      </div>

      <div className="ud-info-grid-4">
        {[
          { label: "Name",          value: u.name },
          { label: "Phone",         value: u.phone_number },
          { label: "Gender",        value: profile.gender },
          { label: "Email ID",      value: u.email },
          {
            label: "Date of Birth",
            value: profile.date_of_birth
              ? new Date(profile.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : undefined,
          },
          { label: "Age", value: `${age} years` },
        ].map(f => (
          <div key={f.label}>
            <div className="ud-field-label">{f.label}</div>
            <div className="ud-field-value">{f.value || "—"}</div>
          </div>
        ))}
      </div>

      <div className="ud-info-grid-3">
        {[
          { label: "BMI",    value: profile.bmi,    unit: "",                   note: "Normal weight" },
          { label: "Height", value: profile.height, unit: profile?.height_unit, note: "Normal height" },
          { label: "Weight", value: profile.weight, unit: profile?.weight_unit, note: "Normal weight" },
        ].map(card => (
          <div key={card.label} className="ud-stat-card">
            <div className="ud-stat-card__left">
              <div className="ud-stat-card__icon"><MdDirectionsRun /></div>
              <div>
                <div className="ud-stat-card__label">{card.label}</div>
                <div className="ud-stat-card__value">
                  {card.value || "—"}
                  {card.unit && <span className="ud-stat-card__unit"> {card.unit}</span>}
                </div>
              </div>
            </div>
            <div className="ud-stat-card__note">{card.note}</div>
          </div>
        ))}
      </div>

      <div className="ud-account-box">
        <div className="ud-account-box__label">Account Status</div>
        <div className="ud-account-box__header">
          <h3 className={`ud-account-box__heading ${u.is_active ? "ud-account-box__heading--active" : "ud-account-box__heading--inactive"}`}>
            {u.is_active ? "Account Active" : "Account Deactivated"}
          </h3>
          <span className={`ud-status-badge ${u.is_active ? "ud-status-badge--active" : "ud-status-badge--inactive"}`}>
            <span className="ud-status-badge__dot"></span>
            {u.is_active ? "Active" : "Deactivated"}
          </span>
        </div>
        <p className="ud-account-box__desc">
          This user can log in to the AAYU mobile app and access their health program.
        </p>
        <button
          onClick={() => toggleStatus(!u.is_active)}
          className={`ud-toggle-btn ${u.is_active ? "ud-toggle-btn--deactivate" : "ud-toggle-btn--reactivate"}`}
        >
          <span className="ud-toggle-btn__dot"></span>
          {u.is_active ? "Deactivate Account" : "Reactivate Account"}
        </button>
      </div>
    </div>
  );
}
