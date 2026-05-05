import {
  MdPerson,
  MdFavorite,
  MdDirectionsRun,
  MdSchool,
  MdDevices,
  MdAssignment,
  MdHistory,
  MdFitnessCenter,
} from "react-icons/md";

const TABS = [
  { key: "personal",       label: "Personal Information", icon: MdPerson },
  { key: "health",         label: "Health Profile",       icon: MdFavorite },
  { key: "lifestyle",      label: "Lifestyle Details",    icon: MdDirectionsRun },
  { key: "enrollment",     label: "Program Enrollment",   icon: MdSchool },
  { key: "devices",        label: "Device Assignment",    icon: MdDevices },
  { key: "questionnaires", label: "Questionnaires",       icon: MdAssignment },
  { key: "training",       label: "Training Progress",    icon: MdFitnessCenter },
  { key: "audit",          label: "Audit Trail",          icon: MdHistory },
];

export default function UserDetailTabs({ activeTab, onTabChange }) {
  return (
    <div className="dashboard-tabs">
      {TABS.map(tab => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            <div className="tab-icon"><Icon size={16} /></div>
            <span>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}
