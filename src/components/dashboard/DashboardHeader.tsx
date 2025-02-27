import React, { useState } from "react";
import { Search, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationCenter from "./NotificationCenter";
import { Link } from "react-router-dom";
import { useSupabase } from "../context/SupabaseProvider";

interface DashboardHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

const DashboardHeader = ({
  title = "Maintenance Dashboard",
  onMenuToggle = () => {},
}: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSupabase();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 w-full px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search equipment, tasks..."
            className="pl-10 w-full bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        <NotificationCenter />
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <Avatar>
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=maintenance"
              alt="User avatar"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500">Maintenance Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
