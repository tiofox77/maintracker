import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Wrench,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useSupabase } from "../context/SupabaseProvider";
import { toast } from "../../lib/utils/toast";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const location = useLocation();
  const { signOut } = useSupabase();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Maintenance Scheduling",
      path: "/maintenance",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Equipment Management",
      path: "/equipment",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      name: "Category & Department",
      path: "/categories",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      name: "Reports & History",
      path: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "User Management",
      path: "/users",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "h-full bg-background border-r border-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Maintenance MS</h1>
          </div>
        )}
        {isCollapsed && (
          <ClipboardList className="h-6 w-6 text-primary mx-auto" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={isCollapsed ? "mx-auto" : ""}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-2">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isCollapsed && "justify-center",
                      )}
                      onClick={(e) => {
                        // Force navigation to refresh the page if needed
                        if (
                          item.path === "/settings" &&
                          location.pathname === "/settings"
                        ) {
                          e.preventDefault();
                          window.location.href = item.path;
                        }
                      }}
                    >
                      {item.icon}
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-3 text-sm text-muted-foreground",
            isCollapsed && "justify-center",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">MS</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="font-medium">Maintenance System</p>
              <p className="text-xs">Admin</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await signOut();
                toast.success("Logged out successfully");
              } catch (error) {
                console.error("Logout error:", error);
                toast.error("Failed to log out");
              }
            }}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
