export default function DashboardTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="dashboard-tabs">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`tab-item ${activeTab === t.id ? 'active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <div className="tab-icon">{t.icon}</div>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
