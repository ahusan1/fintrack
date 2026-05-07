import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Shell } from "./components/layout/Shell";
import { InstallPWA } from "./components/InstallPWA";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";

import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { AdminShell } from "./components/layout/AdminShell";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminTransactions } from "./pages/admin/AdminTransactions";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminReports } from "./pages/admin/AdminReports";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <InstallPWA />
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Shell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={<Dashboard activeTab="dashboard" />}
              />
              <Route
                path="transactions"
                element={<Dashboard activeTab="transactions" />}
              />
              <Route
                path="analytics"
                element={<Dashboard activeTab="analytics" />}
              />
              <Route
                path="profile"
                element={<Dashboard activeTab="profile" />}
              />
            </Route>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
