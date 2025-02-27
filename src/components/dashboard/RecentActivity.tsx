import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaintenanceTasks, useEquipment } from "@/lib/hooks";
import { format, parseISO, isValid } from "date-fns";

interface Activity {
  id: string;
  title: string;
  equipment: string;
  date: string;
  status: string;
  type: "maintenance" | "equipment";
}

const RecentActivity = () => {
  const { tasks, loading: tasksLoading } = useMaintenanceTasks();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!tasksLoading && !equipmentLoading) {
      const newActivities: Activity[] = [];

      // Add recent maintenance tasks
      tasks
        .filter(
          (task) =>
            task.status === "completed" || task.status === "in-progress",
        )
        .slice(0, 5)
        .forEach((task) => {
          const equipmentItem = equipment.find(
            (e) => e.id === task.equipment_id,
          );
          const equipmentName = equipmentItem
            ? equipmentItem.name
            : "Unknown Equipment";
          const date = task.completed_date || task.scheduled_date;

          if (date) {
            newActivities.push({
              id: `task-${task.id}`,
              title: task.title,
              equipment: equipmentName,
              date: formatDate(date),
              status: task.status,
              type: "maintenance",
            });
          }
        });

      // Add recently updated equipment
      equipment
        .filter(
          (equip) =>
            equip.status === "maintenance" || equip.status === "out-of-service",
        )
        .slice(0, 5)
        .forEach((equip) => {
          newActivities.push({
            id: `equip-${equip.id}`,
            title: `${equip.name} status changed`,
            equipment: equip.name,
            date: formatDate(
              equip.last_maintenance || new Date().toISOString(),
            ),
            status: equip.status,
            type: "equipment",
          });
        });

      // Sort by date (newest first) and limit to 10
      newActivities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setActivities(newActivities.slice(0, 10));
    }
  }, [tasks, equipment, tasksLoading, equipmentLoading]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === "maintenance") {
      switch (status) {
        case "completed":
          return (
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          );
        case "in-progress":
          return (
            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
          );
        default:
          return <Badge>{status}</Badge>;
      }
    } else {
      switch (status) {
        case "maintenance":
          return (
            <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
          );
        case "out-of-service":
          return (
            <Badge className="bg-red-100 text-red-800">Out of Service</Badge>
          );
        default:
          return <Badge>{status}</Badge>;
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {tasksLoading || equipmentLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500">
                      {activity.equipment} • {activity.date}
                    </div>
                  </div>
                  <div>{getStatusBadge(activity.status, activity.type)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
