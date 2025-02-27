import React, { useState } from "react";
import Sidebar from "./layout/Sidebar";
import DashboardHeader from "./dashboard/DashboardHeader";
import MaintenanceAlerts from "./dashboard/MaintenanceAlerts";
import QuickActions from "./dashboard/QuickActions";
import RecentActivity from "./dashboard/RecentActivity";
import MetricsOverview from "./dashboard/MetricsOverview";
import MaintenanceSchedulingModal from "./maintenance/MaintenanceSchedulingModal";
import EquipmentManagementModal from "./equipment/EquipmentManagementModal";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleScheduleMaintenance = () => {
    setMaintenanceModalOpen(true);
  };

  const handleAddEquipment = () => {
    setEquipmentModalOpen(true);
  };

  const handleNavigateToPage = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader onMenuToggle={handleToggleSidebar} />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            {/* Metrics Overview */}
            <MetricsOverview />

            {/* Alerts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaintenanceAlerts />
              <QuickActions
                onScheduleMaintenance={handleScheduleMaintenance}
                onAddEquipment={handleAddEquipment}
                onGenerateReport={() => handleNavigateToPage("/reports")}
                onManageCategories={() => handleNavigateToPage("/categories")}
              />
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* Modals */}
      <MaintenanceSchedulingModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
      />

      <EquipmentManagementModal
        open={equipmentModalOpen}
        onOpenChange={setEquipmentModalOpen}
      />
    </div>
  );
};

export default Home;
