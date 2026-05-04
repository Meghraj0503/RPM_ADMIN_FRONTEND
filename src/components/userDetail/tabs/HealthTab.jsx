import { MdEdit } from "react-icons/md";
import VitalsSection from "../../VitalsSection";

export default function HealthTab({ u, vitals, days, setDays, profile, handleEditClick }) {
  return (
    <div>
      <div className="ud-section-header">
        <h2 className="ud-section-title">Health Profile</h2>
        <button className="ud-icon-btn"><MdEdit /></button>
      </div>

      <div className="ud-vitals-section">
        <div className="ud-section-header ud-section-header--mb-sm">
          <h3 className="ud-section-title--sm">Vitals</h3>
          <div className="ud-days-toggle">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`ud-days-btn ${days === d ? "ud-days-btn--active" : "ud-days-btn--inactive"}`}
              >
                {d < 10 ? `0${d}` : d} Days
              </button>
            ))}
          </div>
        </div>
        <VitalsSection vitals={vitals} days={days} bmi={profile.bmi} />
      </div>

      <div className="ud-health-cards">
        <div className="ud-health-card">
          <div className="ud-section-header">
            <h3 className="ud-section-title--sm">Medical Conditions</h3>
            <button onClick={() => handleEditClick("conditions")} className="ud-icon-btn"><MdEdit /></button>
          </div>
          <div className="ud-tag-list">
            {(u.user_medical_conditions || []).map((c, i) => (
              <span key={i} className="ud-tag ud-tag--condition">{c.condition_name}</span>
            ))}
          </div>
        </div>

        <div className="ud-health-card">
          <div className="ud-section-header">
            <h3 className="ud-section-title--sm">Medications</h3>
            <button onClick={() => handleEditClick("medications")} className="ud-icon-btn"><MdEdit /></button>
          </div>
          <div className="ud-tag-list">
            {(u.user_medications || []).map((m, i) => (
              <span key={i} className="ud-tag ud-tag--medication">{m.medication_name}</span>
            ))}
          </div>
        </div>

        <div className="ud-health-card">
          <div className="ud-section-header">
            <h3 className="ud-section-title--sm">Allergies</h3>
            <button onClick={() => handleEditClick("allergies")} className="ud-icon-btn"><MdEdit /></button>
          </div>
          <div className="ud-tag-list">
            {(u.user_allergies || []).map((a, i) => (
              <span key={i} className="ud-tag ud-tag--allergy">{a.allergy_name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
