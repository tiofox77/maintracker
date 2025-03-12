import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle,
  X,
  Calendar,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { useMaintenanceTasks } from "@/lib/hooks";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  read: boolean;
  relatedId?: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const { tasks } = useMaintenanceTasks();

  // Generate notifications based on tasks
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Check for overdue tasks
    const today = new Date();
    const overdueTasks = tasks.filter((task) => {
      const dueDate = new Date(task.scheduled_date);
      return (
        dueDate < today &&
        task.status !== "completed" &&
        task.status !== "cancelled"
      );
    });

    overdueTasks.forEach((task) => {
      newNotifications.push({
        id: `overdue-${task.id}`,
        title: "Maintenance Overdue",
        message: `Task '${task.title}' for ${task.equipment?.name || "equipment"} is overdue.`,
        type: "error",
        timestamp: new Date(),
        read: false,
        relatedId: task.id,
      });
    });

    // Check for upcoming tasks (due in the next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.scheduled_date);
      return (
        dueDate > today &&
        dueDate <= threeDaysFromNow &&
        task.status === "scheduled"
      );
    });

    upcomingTasks.forEach((task) => {
      newNotifications.push({
        id: `upcoming-${task.id}`,
        title: "Upcoming Maintenance",
        message: `Task '${task.title}' for ${task.equipment?.name || "equipment"} is due soon.`,
        type: "warning",
        timestamp: new Date(),
        read: false,
        relatedId: task.id,
      });
    });

    // Sort notifications by timestamp (newest first)
    newNotifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    setNotifications(newNotifications);
    setUnreadCount(
      newNotifications.filter((notification) => !notification.read).length,
    );
  }, [tasks]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case "warning":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 relative ${notification.read ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {format(notification.timestamp, "MMM d, h:mm a")}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
              <Bell className="h-10 w-10 mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
