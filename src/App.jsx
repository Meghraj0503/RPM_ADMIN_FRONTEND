import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeaderProvider } from './contexts/HeaderContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import AtRisk from './pages/AtRisk';
import Articles from './pages/Articles';
import ArticleEdit from './pages/ArticleEdit';
import ExportData from './pages/ExportData';
import Questionnaires from './pages/Questionnaires';
import QuestionnaireBuilder from './pages/QuestionnaireBuilder';
import QuestionnaireAssign from './pages/QuestionnaireAssign';
import TrainingManagement from './pages/TrainingManagement';
import TrainingCreate from './pages/TrainingCreate';
import './index.css';
import './styles/main.css';
import './styles/device.css';
//need to change later — now using real email+password login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <HeaderProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="at-risk" element={<AtRisk />} />
          <Route path="questionnaires" element={<Questionnaires />} />
          <Route path="questionnaires/new" element={<QuestionnaireBuilder />} />
          <Route path="questionnaires/:id/edit" element={<QuestionnaireBuilder />} />
          <Route path="questionnaires/:id/assign" element={<QuestionnaireAssign />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/new" element={<ArticleEdit />} />
          <Route path="articles/:id/edit" element={<ArticleEdit />} />
          <Route path="export" element={<ExportData />} />
          <Route path="training" element={<TrainingManagement />} />
          <Route path="training/new" element={<TrainingCreate />} />
          <Route path="training/:id" element={<TrainingCreate />} />
          <Route path="training/:id/edit" element={<TrainingCreate />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </HeaderProvider>
  );
}
