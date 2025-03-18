import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "../dashboard/DashboardHeader";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
