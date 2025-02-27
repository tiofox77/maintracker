import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock } from "lucide-react";

interface MaintenanceTask {
  id: string;
  equipmentName: string;
  department: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "upcoming" | "overdue";
}

interface MaintenanceAlertsProps {
  tasks?: MaintenanceTask[];
  title?: string;
}

const MaintenanceAlerts = ({
  tasks = [
    {
      id: "1",
      equipmentName: "HVAC System",
      department: "Facilities",
      dueDate: "2023-06-15",
      priority: "high",
      status: "overdue",
    },
    {
      id: "2",
      equipmentName: "CNC Machine #3",
      department: "Manufacturing",
      dueDate: "2023-06-18",
      priority: "medium",
      status: "upcoming",
    },
    {
      id: "3",
      equipmentName: "Conveyor Belt A",
      department: "Logistics",
      dueDate: "2023-06-20",
      priority: "high",
      status: "upcoming",
    },
    {
      id: "4",
      equipmentName: "Server Rack B",
      department: "IT",
      dueDate: "2023-06-14",
      priority: "medium",
      status: "overdue",
    },
    {
      id: "5",
      equipmentName: "Forklift #2",
      department: "Warehouse",
      dueDate: "2023-06-22",
      priority: "low",
      status: "upcoming",
    },
  ],
  title = "Maintenance Alerts",
}: MaintenanceAlertsProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  // Separate overdue and upcoming tasks
  const overdueTasks = tasks.filter((task) => task.status === "overdue");
  const upcomingTasks = tasks.filter((task) => task.status === "upcoming");

  return (
    <Card className="h-full bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[340px] overflow-y-auto">
          {overdueTasks.length > 0 && (
            <div className="px-6 py-2 bg-red-50">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Overdue Tasks ({overdueTasks.length})
              </h4>
            </div>
          )}
          {overdueTasks.map((task) => (
            <div key={task.id} className="border-b p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {task.equipmentName}
                  </h4>
                  <p className="text-sm text-gray-500">{task.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusIcon(task.status)}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <Clock className="h-4 w-4" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            </div>
          ))}

          {upcomingTasks.length > 0 && (
            <div className="px-6 py-2 bg-amber-50">
              <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Upcoming Tasks ({upcomingTasks.length})
              </h4>
            </div>
          )}
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="border-b p-4 hover:bg-gray-50 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {task.equipmentName}
                  </h4>
                  <p className="text-sm text-gray-500">{task.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusIcon(task.status)}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No maintenance tasks scheduled</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceAlerts;
