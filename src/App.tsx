import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Shell } from "./components/layout/Shell";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Login = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);

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
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          {!user ? (
            <Route path="*" element={<Login />} />
          ) : (
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
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
