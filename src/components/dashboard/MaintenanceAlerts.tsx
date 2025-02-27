import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMaintenanceTasks, useEquipment } from "@/lib/hooks";
import { format, parseISO, isValid, isBefore, addDays } from "date-fns";
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { MaintenanceSchedulingModal } from "../maintenance/MaintenanceSchedulingModal";

interface Alert {
  id: string;
  title: string;
  equipment: string;
  date: string;
  type: "overdue" | "upcoming" | "today";
  taskId: string;
}

const MaintenanceAlerts = () => {
  const { tasks, loading: tasksLoading, completeTask } = useMaintenanceTasks();
  const { equipment } = useEquipment();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!tasksLoading) {
      const today = new Date();
      const threeDaysFromNow = addDays(today, 3);
      const newAlerts: Alert[] = [];

      // Filter for relevant tasks
      tasks
        .filter(
          (task) => task.status !== "completed" && task.status !== "cancelled",
        )
        .forEach((task) => {
          const dueDate = parseISO(task.scheduled_date);
          if (!isValid(dueDate)) return;

          const equipmentItem = equipment.find(
            (e) => e.id === task.equipment_id,
          );
          const equipmentName = equipmentItem
            ? equipmentItem.name
            : "Unknown Equipment";

          // Check if task is overdue
          if (isBefore(dueDate, today)) {
            newAlerts.push({
              id: `overdue-${task.id}`,
              title: task.title,
              equipment: equipmentName,
              date: format(dueDate, "MMM d, yyyy"),
              type: "overdue",
              taskId: task.id,
            });
          }
          // Check if task is due today
          else if (dueDate.toDateString() === today.toDateString()) {
            newAlerts.push({
              id: `today-${task.id}`,
              title: task.title,
              equipment: equipmentName,
              date: "Today",
              type: "today",
              taskId: task.id,
            });
          }
          // Check if task is upcoming (within 3 days)
          else if (isBefore(dueDate, threeDaysFromNow)) {
            newAlerts.push({
              id: `upcoming-${task.id}`,
              title: task.title,
              equipment: equipmentName,
              date: format(dueDate, "MMM d, yyyy"),
              type: "upcoming",
              taskId: task.id,
            });
          }
        });

      // Sort alerts by priority: overdue first, then today, then upcoming
      newAlerts.sort((a, b) => {
        const priorityOrder = { overdue: 0, today: 1, upcoming: 2 };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });

      setAlerts(newAlerts);
    }
  }, [tasks, equipment, tasksLoading]);

  const handleCompleteTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "today":
        return <Badge className="bg-yellow-100 text-yellow-800">Today</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${alert.type === "overdue" ? "border-red-200 bg-red-50" : alert.type === "today" ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-gray-500">
                        {alert.equipment} • {alert.date}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getAlertBadge(alert.type)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCompleteTask(alert.taskId)}
                        title="Complete Task"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">No maintenance alerts</p>
              <p className="text-sm text-gray-400">
                All scheduled tasks are on track
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Task Modal */}
      <MaintenanceSchedulingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskId={selectedTaskId}
        mode="complete"
      />
    </>
  );
};

export default MaintenanceAlerts;
