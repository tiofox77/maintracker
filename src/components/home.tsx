import React, { useState } from "react";
import DashboardHeader from "./dashboard/DashboardHeader";
import Sidebar from "./layout/Sidebar";
import MetricsOverview from "./dashboard/MetricsOverview";
import MaintenanceAlerts from "./dashboard/MaintenanceAlerts";
import QuickActions from "./dashboard/QuickActions";
import RecentActivity from "./dashboard/RecentActivity";

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Maintenance Dashboard"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* Metrics Overview */}
            <MetricsOverview />

            {/* Alerts and Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaintenanceAlerts />
              <QuickActions />
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
