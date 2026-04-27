import { useEffect, useState } from "react";
import {
  MdWarning,
  MdDirectionsRun,
  MdAssignment,
  MdGroups,
  MdMenuBook,
  MdPersonSearch,
  MdBarChart,
} from "react-icons/md";
import { getCohortDashboard, getAtRiskUsers, exportData } from "../api/admin";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStatCards from "../components/dashboard/DashboardStatCards";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import CriticalHealthAlertsCard from "../components/dashboard/CriticalHealthAlertsCard";
import HealthRiskCard from "../components/dashboard/HealthRiskCard";
import PhysicalActivityMetrics from "../components/dashboard/PhysicalActivityMetrics";
import QuestionnairePerformance from "../components/dashboard/QuestionnairePerformance";
import ProgramEnrollment from "../components/dashboard/ProgramEnrollment";
import EducationHub from "../components/dashboard/EducationHub";
import AtRiskMonitoring from "../components/dashboard/AtRiskMonitoring";
import DailyActiveUsers from "../components/dashboard/DailyActiveUsers";
import "./style.css";

const TABS = [
  { id: "health_alerts", label: "Critical Health Alerts", icon: <MdWarning /> },
  { id: "physical", label: "Physical Activity Metrics", icon: <MdDirectionsRun /> },
  { id: "questionnaire", label: "Questionnaire Performance", icon: <MdAssignment /> },
  { id: "enrollment", label: "Program Enrollment & Engagement", icon: <MdGroups /> },
  { id: "education", label: "Education Hub Engagement", icon: <MdMenuBook /> },
  { id: "at_risk", label: "At Risk User Monitoring", icon: <MdPersonSearch /> },
  { id: "dau", label: "Daily Active Users", icon: <MdBarChart /> },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("health_alerts");
  const [stats, setStats] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCohortDashboard(), getAtRiskUsers()])
      .then(([d, a]) => {
        setStats(d.data);
        setAtRisk(a.data.at_risk_users || []);
      })
      .catch((e) => console.error("Dashboard Data Error", e))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportData("vitals");
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "vitals_export.csv";
      a.click();
    } catch {
      alert("Export failed");
    }
  };

  return (
    <div>
      <DashboardHeader onExport={handleExport} />
      <DashboardStatCards stats={stats?.top_level} trends={stats?.top_level_trends} />
      <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <div className="full-center">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {(activeTab === "health_alerts" || activeTab === "health_risk") && (
            <div className="two-col-grid">
              <CriticalHealthAlertsCard data={stats?.critical_alerts} />
              <HealthRiskCard
                data={stats?.health_risk}
                alertActive={stats?.top_level?.active_alerts}
              />
            </div>
          )}
          {activeTab === "physical" && (
            <PhysicalActivityMetrics data={stats?.physical_activity} topStats={stats?.top_level} />
          )}
          {activeTab === "questionnaire" && (
            <QuestionnairePerformance data={stats?.questionnaires || {}} />
          )}
          {activeTab === "enrollment" && (
            <ProgramEnrollment
              data={stats?.enrollment}
              topStats={stats?.top_level}
            />
          )}
          {activeTab === "education" && (
            <EducationHub data={stats?.education} />
          )}
          {activeTab === "at_risk" && (
            <AtRiskMonitoring
              list={atRisk}
              breakdown={stats?.at_risk_breakdown}
            />
          )}
          {activeTab === "dau" && (
            <DailyActiveUsers dauTrend={stats?.dau_trend || []} />
          )}
        </>
      )}
    </div>
  );
}
