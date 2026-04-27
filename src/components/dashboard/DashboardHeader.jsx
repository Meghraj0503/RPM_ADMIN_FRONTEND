import { MdDownload } from 'react-icons/md';

export default function DashboardHeader({ onExport }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>Cohort Dashboard</h1>
        <p className="sub">Wellness 90 · AI Program · Live · Updated 2 min ago</p>
      </div>
      <div className="page-header-right">
        <div className="filter-select">Program : All ▾</div>
        <div className="filter-select">Period : Last 7 days ▾</div>
        <div className="filter-select">Enrolled cohorts ▾</div>
        <button className="btn-export" onClick={onExport}><MdDownload /> Export</button>
      </div>
    </div>
  );
}
