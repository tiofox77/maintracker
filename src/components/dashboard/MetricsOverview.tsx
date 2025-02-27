import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMaintenanceTasks, useEquipment } from "@/lib/hooks";
import { Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const MetricsOverview = () => {
  const { tasks, loading: tasksLoading } = useMaintenanceTasks();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const [metrics, setMetrics] = useState({
    totalEquipment: 0,
    equipmentInMaintenance: 0,
    equipmentOutOfService: 0,
    scheduledTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });

  useEffect(() => {
    if (!tasksLoading && !equipmentLoading) {
      // Calculate metrics
      const today = new Date();

      const scheduledTasks = tasks.filter(
        (task) => task.status === "scheduled",
      ).length;
      const overdueTasks = tasks.filter((task) => {
        const dueDate = new Date(task.scheduled_date);
        return (
          dueDate < today &&
          task.status !== "completed" &&
          task.status !== "cancelled"
        );
      }).length;
      const completedTasks = tasks.filter(
        (task) => task.status === "completed",
      ).length;
      const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress",
      ).length;

      const totalEquipment = equipment.length;
      const equipmentInMaintenance = equipment.filter(
        (equip) => equip.status === "maintenance",
      ).length;
      const equipmentOutOfService = equipment.filter(
        (equip) => equip.status === "out-of-service",
      ).length;

      setMetrics({
        totalEquipment,
        equipmentInMaintenance,
        equipmentOutOfService,
        scheduledTasks,
        overdueTasks,
        completedTasks,
        inProgressTasks,
      });
    }
  }, [tasks, equipment, tasksLoading, equipmentLoading]);

  const metricCards = [
    {
      title: "Total Equipment",
      value: metrics.totalEquipment,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Equipment in Maintenance",
      value: metrics.equipmentInMaintenance,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Equipment Out of Service",
      value: metrics.equipmentOutOfService,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Scheduled Tasks",
      value: metrics.scheduledTasks,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Overdue Tasks",
      value: metrics.overdueTasks,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Completed Tasks",
      value: metrics.completedTasks,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricCards.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className={`p-2 rounded-full ${metric.color} mb-2`}>
                {metric.icon}
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">
                {metric.title}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsOverview;
