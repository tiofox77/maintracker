import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import MaintenanceScheduling from "./components/pages/MaintenanceScheduling";
import EquipmentManagement from "./components/pages/EquipmentManagement";
import CategoryDepartment from "./components/pages/CategoryDepartment";
import ReportsHistory from "./components/pages/ReportsHistory";
import Settings from "./components/pages/Settings";
import UserManagement from "./components/pages/UserManagement";
import LoginForm from "./components/auth/LoginForm";
import { useSupabase } from "./components/context/SupabaseProvider";
import routes from "tempo-routes";

function App() {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maintenance" element={<MaintenanceScheduling />} />
            <Route path="/equipment" element={<EquipmentManagement />} />
            <Route path="/categories" element={<CategoryDepartment />} />
            <Route path="/reports" element={<ReportsHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/login" element={<Navigate to="/" />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      )}
    </Suspense>
  );
}

export default App;
