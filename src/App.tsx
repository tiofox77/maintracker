import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import MaintenanceScheduling from "./components/pages/MaintenanceScheduling";
import EquipmentManagement from "./components/pages/EquipmentManagement";
import CategoryDepartment from "./components/pages/CategoryDepartment";
import ReportsHistory from "./components/pages/ReportsHistory";
import Settings from "./components/pages/Settings";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/maintenance" element={<MaintenanceScheduling />} />
        <Route path="/equipment" element={<EquipmentManagement />} />
        <Route path="/categories" element={<CategoryDepartment />} />
        <Route path="/reports" element={<ReportsHistory />} />
        <Route path="/settings" element={<Settings />} />
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </Suspense>
  );
}

export default App;
