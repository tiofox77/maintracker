import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
  CheckCircle,
  Wrench,
  AlertCircle,
  Settings,
  RefreshCw,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "completed" | "update" | "alert" | "system";
  title: string;
  description: string;
  timestamp: Date;
  equipment?: string;
  user?: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

const RecentActivity = ({
  activities = [
    {
      id: "1",
      type: "completed",
      title: "Maintenance Completed",
      description: "Regular maintenance completed on CNC Machine #3",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      equipment: "CNC Machine #3",
      user: "John Smith",
    },
    {
      id: "2",
      type: "update",
      title: "Equipment Updated",
      description: "Firmware updated on Assembly Line Conveyor",
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      equipment: "Assembly Line Conveyor",
      user: "Maria Rodriguez",
    },
    {
      id: "3",
      type: "alert",
      title: "Maintenance Overdue",
      description:
        "Scheduled maintenance for Packaging Robot is overdue by 3 days",
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      equipment: "Packaging Robot",
    },
    {
      id: "4",
      type: "system",
      title: "System Update",
      description:
        "Maintenance schedule recalculated for all equipment in Assembly department",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: "5",
      type: "completed",
      title: "Maintenance Completed",
      description: "Emergency repair completed on Hydraulic Press",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      equipment: "Hydraulic Press",
      user: "Alex Johnson",
    },
  ],
  maxItems = 10,
}: RecentActivityProps) => {
  // Limit the number of activities to display
  const displayedActivities = activities.slice(0, maxItems);

  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "update":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get the appropriate badge color based on activity type
  const getActivityBadge = (type: ActivityItem["type"]) => {
    switch (type) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "update":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Update
          </Badge>
        );
      case "alert":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Alert
          </Badge>
        );
      case "system":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            System
          </Badge>
        );
      default:
        return <Badge>Other</Badge>;
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.title}</h4>
                      <span className="text-xs text-gray-500">
                        {format(activity.timestamp, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {getActivityBadge(activity.type)}
                      {activity.equipment && (
                        <Badge variant="outline" className="text-xs">
                          {activity.equipment}
                        </Badge>
                      )}
                      {activity.user && (
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          By: {activity.user}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {index < displayedActivities.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
