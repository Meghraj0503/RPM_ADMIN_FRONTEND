import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import AtRisk from './pages/AtRisk';
import Articles from './pages/Articles';
import ArticleEdit from './pages/ArticleEdit';
import ExportData from './pages/ExportData';
import './index.css';
//need to change later — now using real email+password login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
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
          <Route path="questionnaires" element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/new" element={<ArticleEdit />} />
          <Route path="articles/:id/edit" element={<ArticleEdit />} />
          <Route path="export" element={<ExportData />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
