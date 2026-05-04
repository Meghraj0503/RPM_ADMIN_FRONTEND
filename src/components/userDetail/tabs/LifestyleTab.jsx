import { MdEdit, MdEmojiFoodBeverage, MdLocalBar, MdSmokingRooms } from "react-icons/md";

export default function LifestyleTab({ u, openLifeModal }) {
  return (
    <div>
      <div className="ud-section-header">
        <h2 className="ud-section-title">Lifestyle Details</h2>
        <button onClick={openLifeModal} className="ud-icon-btn"><MdEdit /></button>
      </div>

      <div className="ud-lifestyle-card">
        <div className="ud-lifestyle-field">
          <div className="ud-lifestyle-label">Diet Type</div>
          <div className="ud-diet-badge">
            <div className="ud-diet-badge__icon">
              <MdEmojiFoodBeverage color="#00C9A7" size={12} />
            </div>
            <span className="ud-diet-badge__text">
              {u.user_lifestyle?.diet_type || "None"}
            </span>
          </div>
        </div>

        <div className="ud-lifestyle-field">
          <div className="ud-lifestyle-label">Physical activity level</div>
          <div className="ud-lifestyle-value">
            {u.user_lifestyle?.physical_activity_level || "—"}
          </div>
        </div>

        <div className="ud-habit-row">
          <div className="ud-habit-item">
            <div className="ud-habit-item__icon"><MdLocalBar color="#00C9A7" size={14} /></div>
            <div>
              <div className="ud-habit-item__label">Alcohol</div>
              <div className="ud-habit-item__value">{u.user_lifestyle?.alcohol_consumption || "—"}</div>
            </div>
          </div>
          <div className="ud-habit-item">
            <div className="ud-habit-item__icon"><MdSmokingRooms color="#00C9A7" size={14} /></div>
            <div>
              <div className="ud-habit-item__label">Smoking</div>
              <div className="ud-habit-item__value">{u.user_lifestyle?.smoking_status || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
