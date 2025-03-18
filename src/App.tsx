import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import MaintenanceScheduling from "./components/pages/MaintenanceScheduling";
import EquipmentManagement from "./components/pages/EquipmentManagement";
import CategoryDepartment from "./components/pages/CategoryDepartment";
import ReportsHistory from "./components/pages/ReportsHistory";
import Settings from "./components/pages/Settings";
import UserManagement from "./components/pages/UserManagement";
import RolePermissions from "./components/pages/RolePermissions";
import LoginForm from "./components/auth/LoginForm";
import { useSupabase } from "./components/context/SupabaseProvider";
import TaskManagement from "./components/pages/TaskManagement";
import TaskBasedMaintenance from "./components/pages/TaskBasedMaintenance";

// Supply Chain Routes
import MaterialRequests from "./components/pages/supplyChain/MaterialRequests";
import ProformaInvoices from "./components/pages/supplyChain/ProformaInvoices";
import SupplyChainDepartments from "./components/pages/supplyChain/Departments";

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
          {/* Tempo routes */}
          {import.meta.env.VITE_TEMPO && (
            <Routes>
              <Route path="/tempobook/*" />
            </Routes>
          )}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maintenance" element={<MaintenanceScheduling />} />
            <Route path="/equipment" element={<EquipmentManagement />} />
            <Route path="/categories" element={<CategoryDepartment />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route
              path="/task-maintenance"
              element={<TaskBasedMaintenance />}
            />
            <Route path="/reports" element={<ReportsHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/role-permissions" element={<RolePermissions />} />
            <Route path="/login" element={<Navigate to="/" />} />

            {/* Supply Chain Routes */}
            <Route
              path="/supply-chain/material-requests"
              element={<MaterialRequests />}
            />
            <Route
              path="/supply-chain/proforma-invoices"
              element={<ProformaInvoices />}
            />
            <Route
              path="/supply-chain/departments"
              element={<SupplyChainDepartments />}
            />
            {/* Add other supply chain routes as they are implemented */}
            <Route
              path="/supply-chain/shipments"
              element={<div>Shipment Tracking - Coming Soon</div>}
            />
            <Route
              path="/supply-chain/customs"
              element={<div>Customs Clearance - Coming Soon</div>}
            />
            <Route
              path="/supply-chain/port-processes"
              element={<div>Port Processes - Coming Soon</div>}
            />
            <Route
              path="/supply-chain/transport"
              element={<div>Transport - Coming Soon</div>}
            />
          </Routes>
        </>
      )}
    </Suspense>
  );
}

export default App;
