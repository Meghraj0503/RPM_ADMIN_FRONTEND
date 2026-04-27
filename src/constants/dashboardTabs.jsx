import {
  MdWarning, MdFavorite, MdDirectionsRun, MdAssignment,
  MdGroups, MdMenuBook, MdPersonSearch, MdBarChart,
} from 'react-icons/md';

export const TABS = [
  { id: 'health_alerts',  label: 'Critical Health Alerts',          icon: <MdWarning /> },
  { id: 'health_risk',    label: 'Health Risk Indicator',           icon: <MdFavorite /> },
  { id: 'physical',       label: 'Physical Activity Metrics',       icon: <MdDirectionsRun /> },
  { id: 'questionnaire',  label: 'Questionnaire Performance',       icon: <MdAssignment /> },
  { id: 'enrollment',     label: 'Program Enrollment & Engagement', icon: <MdGroups /> },
  { id: 'education',      label: 'Education Hub Engagement',        icon: <MdMenuBook /> },
  { id: 'at_risk',        label: 'At Risk User Monitoring',         icon: <MdPersonSearch /> },
  { id: 'dau',            label: 'Daily Active Users',              icon: <MdBarChart /> },
];
