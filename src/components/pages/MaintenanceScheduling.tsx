import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  Repeat,
  History,
  Download,
} from "lucide-react";
import { Label } from "../ui/label";
import {
  useMaintenanceTasks,
  useEquipment,
  useLines,
  useAreas,
  useTaskStatusHistory,
  useUsers,
  useTasks,
} from "../../lib/hooks";
import {
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
} from "../../lib/api/maintenance";
import { toast } from "../../lib/utils/toast";
import TaskStatusHistoryTable from "../maintenance/TaskStatusHistoryTable";

// Define frequency types
type FrequencyType = "custom" | "weekly" | "monthly" | "yearly";

const MaintenanceScheduling = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [lineId, setLineId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("custom");
  const [customDays, setCustomDays] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [status, setStatus] = useState<
    "scheduled" | "in-progress" | "completed" | "cancelled" | "partial"
  >("scheduled");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [taskId, setTaskId] = useState("");
  const [type, setType] = useState<"predictive" | "corrective" | "conditional">(
    "corrective",
  );

  // Get maintenance tasks and equipment from hooks
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
    completeTask,
  } = useMaintenanceTasks();

  const { equipment, loading: equipmentLoading } = useEquipment();
  const { lines, loading: linesLoading } = useLines();
  const { areas, loading: areasLoading } = useAreas();
  const {
    statusHistory,
    loading: historyLoading,
    addStatusHistory,
    fetchTaskStatusHistory,
  } = useTaskStatusHistory();
  const { tasks: tasksList, loading: tasksListLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );

  // Calendar events for the year
  const [calendarEvents, setCalendarEvents] = useState<{
    [date: string]: MaintenanceTask[];
  }>({});

  // Generate calendar events for the entire year
  useEffect(() => {
    const events: { [date: string]: MaintenanceTask[] } = {};
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Process each task to generate recurring events
    tasks.forEach((task) => {
      if (!task.scheduled_date) return;

      const baseDate = new Date(task.scheduled_date);
      const frequency = task.frequency || "custom";
      const customDays = task.custom_days || 0;

      // Add the initial event
      const dateKey = format(baseDate, "yyyy-MM-dd");
      if (!events[dateKey]) events[dateKey] = [];
      events[dateKey].push(task);

      // Generate recurring events based on frequency
      if (frequency !== "custom" || customDays > 0) {
        let nextDate = new Date(baseDate);

        while (nextDate <= endOfYear) {
          // Calculate next occurrence based on frequency
          if (frequency === "weekly") {
            nextDate = addWeeks(nextDate, 1);
          } else if (frequency === "monthly") {
            nextDate = addMonths(nextDate, 1);
          } else if (frequency === "yearly") {
            nextDate = addYears(nextDate, 1);
          } else if (customDays > 0) {
            nextDate = addDays(nextDate, customDays);
          }

          // Stop if we've gone past the end of the year
          if (nextDate > endOfYear) break;

          // Add the recurring event
          const recurringDateKey = format(nextDate, "yyyy-MM-dd");
          if (!events[recurringDateKey]) events[recurringDateKey] = [];

          // Create a "virtual" recurring task
          const recurringTask = {
            ...task,
            id: `${task.id}-${recurringDateKey}`, // Create a unique ID for the recurring instance
            scheduled_date: nextDate.toISOString(),
            is_recurring_instance: true,
            original_task_id: task.id,
          };

          events[recurringDateKey].push(recurringTask);
        }
      }
    });

    setCalendarEvents(events);
  }, [tasks]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query, priority, and status
  const filteredTasks = tasks.filter((task) => {
    // Search filter - check if search query matches any of the task fields
    const matchesSearch =
      searchQuery === "" ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.equipment?.name &&
        task.equipment.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      getEquipmentName(task.equipment_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (task.category_id &&
        task.category_id.toLowerCase().includes(searchQuery.toLowerCase()));

    // Priority filter
    const matchesPriority =
      selectedPriority === "all" || task.priority === selectedPriority;

    // Status filter
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    // Return true only if all filters match
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Maintenance Task CRUD operations
  const handleAddTask = () => {
    setSelectedTask(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEditTask = (task: MaintenanceTask) => {
    // If this is a recurring instance, find the original task
    if (task.is_recurring_instance && task.original_task_id) {
      const originalTask = tasks.find((t) => t.id === task.original_task_id);
      if (originalTask) {
        task = originalTask;
      }
    }
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setEquipmentId(task.equipment_id);
    setLineId(task.category_id || "");
    setTaskId(task.task_id || "");
    setType(task.type || "corrective");

    // Get department ID from equipment
    const equipmentItem = equipment.find((e) => e.id === task.equipment_id);
    if (equipmentItem) {
      setAreaId(equipmentItem.department_id);
    } else {
      setAreaId("");
    }

    setScheduledDate(task.scheduled_date || "");
    setFrequency(task.frequency || "custom");
    setCustomDays(task.custom_days ? task.custom_days.toString() : "");
    setPriority(task.priority || "medium");
    setStatus(task.status || "scheduled");
    setAssignedTo(task.assigned_to || "");
    setNotes(task.notes || "");
    setModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await removeTask(taskToDelete);
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleCompleteTask = (id: string) => {
    setTaskToComplete(id);
    setActualDuration("");
    setNotes("");
    setCompleteDialogOpen(true);
  };

  const confirmCompleteTask = async () => {
    if (taskToComplete) {
      try {
        // Get the task being completed
        const task = tasks.find((t) => t.id === taskToComplete);
        if (!task) {
          toast.error("Task not found");
          return;
        }

        // Complete the current task
        await completeTask(taskToComplete, notes);

        // Add entry to task status history table
        await addStatusHistory({
          task_id: taskToComplete,
          status_date: new Date().toISOString(),
          status: "completed",
          notes: notes || null,
        });

        // If this is a recurring task, create the next occurrence
        if (
          task &&
          (task.frequency !== "custom" ||
            (task.frequency === "custom" && task.custom_days))
        ) {
          // Calculate the next date based on frequency
          let nextDate = new Date(task.scheduled_date);

          if (task.frequency === "weekly") {
            nextDate = addWeeks(nextDate, 1);
          } else if (task.frequency === "monthly") {
            nextDate = addMonths(nextDate, 1);
          } else if (task.frequency === "yearly") {
            nextDate = addYears(nextDate, 1);
          } else if (task.frequency === "custom" && task.custom_days) {
            nextDate = addDays(nextDate, task.custom_days);
          }

          // Create a new task for the next occurrence
          const newTask: MaintenanceTaskInsert = {
            title: task.title,
            description: task.description,
            equipment_id: task.equipment_id,
            category_id: task.category_id,
            scheduled_date: nextDate.toISOString(),
            frequency: task.frequency,
            custom_days: task.custom_days,
            priority: task.priority,
            status: "scheduled",
            assigned_to: task.assigned_to,
            notes: `Auto-generated from completed task ${task.id}`,
          };

          const createdTask = await addTask(newTask);

          // Add entry to task status history for the new scheduled task
          if (createdTask) {
            await addStatusHistory({
              task_id: createdTask.id,
              status_date: new Date().toISOString(),
              status: "scheduled",
              notes: `Scheduled as recurring task from ${task.id}`,
            });
          }

          toast.success("Task completed and next occurrence scheduled");
        } else {
          toast.success("Task completed successfully");
        }

        setCompleteDialogOpen(false);
        setTaskToComplete(null);
        setActualDuration("");
        setNotes("");
      } catch (error) {
        console.error("Error completing task:", error);
        toast.error("Failed to complete task");
      }
    } else {
      toast.error("Please provide completion notes");
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setEquipmentId("");
    setLineId("");
    setAreaId("");
    setScheduledDate("");
    setFrequency("custom");
    setCustomDays("");
    setPriority("medium");
    setStatus("scheduled");
    setAssignedTo("");
    setNotes("");
    setTaskId("");
    setType("corrective");
  };

  const validateForm = () => {
    if (!taskId) {
      toast.error("Task selection is required");
      return false;
    }
    if (!equipmentId) {
      toast.error("Equipment is required");
      return false;
    }
    if (!scheduledDate) {
      toast.error("Scheduled date is required");
      return false;
    }
    if (frequency === "custom" && !customDays) {
      toast.error("Custom days is required when frequency is custom");
      return false;
    }
    if (!type) {
      toast.error("Maintenance type is required");
      return false;
    }
    return true;
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (selectedTask) {
        // Update existing task
        const taskUpdate: MaintenanceTaskUpdate = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          category_id: lineId,
          task_id: taskId || null,
          type: type,
          scheduled_date: scheduledDate,
          frequency: frequency,
          custom_days:
            frequency === "custom" && customDays
              ? parseInt(customDays)
              : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
        };
        const updatedTask = await editTask(selectedTask.id, taskUpdate);

        // Add status history entry if status changed
        if (updatedTask && updatedTask.status !== selectedTask.status) {
          await addStatusHistory({
            task_id: selectedTask.id,
            status_date: new Date().toISOString(),
            status: updatedTask.status,
            notes: `Status changed from ${selectedTask.status} to ${updatedTask.status}`,
          });
        }
      } else {
        // Create new task
        const newTask: MaintenanceTaskInsert = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          category_id: lineId,
          task_id: taskId || null,
          type: type,
          scheduled_date: scheduledDate,
          frequency: frequency,
          custom_days:
            frequency === "custom" && customDays
              ? parseInt(customDays)
              : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
        };
        const createdTask = await addTask(newTask);

        // Add initial status history entry for new task
        if (createdTask) {
          await addStatusHistory({
            task_id: createdTask.id,
            status_date: new Date().toISOString(),
            status: status,
            notes: "Initial task creation",
          });
        }
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            High
          </Badge>
        );
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Cancelled
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Partial
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Helper function to get equipment name by ID
  const getEquipmentName = (equipmentId: string) => {
    const equip = equipment.find((e) => e.id === equipmentId);
    return equip ? equip.name : "Unknown Equipment";
  };

  // Helper function to get area name by ID
  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    return area ? area.name : "Unknown Area";
  };

  // Format date for display
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

  // Get frequency display text
  const getFrequencyText = (task: MaintenanceTask) => {
    if (!task.frequency || task.frequency === "custom") {
      return task.custom_days ? `Every ${task.custom_days} days` : "One-time";
    }

    switch (task.frequency) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return "One-time";
    }
  };

  // Generate calendar grid for the current month
  const generateCalendarGrid = () => {
    if (!selectedDate) return [];

    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start);

    // Create empty cells for days before the first day of the month
    const emptyCellsBefore = Array(startDay).fill(null);
    const allCells = [...emptyCellsBefore, ...days];

    // Create rows for the calendar (weeks)
    const rows = [];
    let cells = [];

    allCells.forEach((day, i) => {
      if (i > 0 && i % 7 === 0) {
        rows.push(cells);
        cells = [];
      }
      cells.push(day);
    });

    // Add remaining cells
    if (cells.length > 0) {
      // Fill in the rest of the row with empty cells
      while (cells.length < 7) {
        cells.push(null);
      }
      rows.push(cells);
    }

    return rows;
  };

  // Get task color based on priority
  const getTaskColor = (task: MaintenanceTask) => {
    switch (task.priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-400 text-white";
      case "medium":
        return "bg-green-500 text-white";
      case "low":
        return "bg-blue-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Render a calendar cell with tasks
  const renderCalendarCell = (day: Date | null) => {
    if (!day) {
      return <td className="border p-1 bg-gray-50"></td>;
    }

    const dateKey = format(day, "yyyy-MM-dd");
    const isToday = day.toDateString() === new Date().toDateString();
    const dayTasks = calendarEvents[dateKey] || [];

    return (
      <td
        className={`border p-1 relative ${isToday ? "bg-blue-50" : ""}`}
        onClick={() => setSelectedDate(day)}
      >
        <div className="font-medium text-sm mb-1">{format(day, "d")}</div>
        <div className="space-y-1">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`${getTaskColor(task)} text-xs p-1 rounded cursor-pointer truncate`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditTask(task);
              }}
              title={task.title}
            >
              {task.title}
            </div>
          ))}
        </div>
      </td>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Maintenance Scheduling"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Maintenance Scheduling</h2>
            </div>

            {/* Tasks List - Now at the top, full width */}
            <Card className="w-full mb-6">
              <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b">
                <div>
                  <CardTitle className="text-xl">Maintenance Tasks</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    List of all maintenance tasks registered in the system
                  </p>
                </div>
                <Button
                  onClick={handleAddTask}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search tasks..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedPriority}
                        onValueChange={setSelectedPriority}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tasks Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-10"
                            >
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading tasks...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : tasksError ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-6 text-red-500"
                            >
                              Error loading tasks. Please try again.
                            </TableCell>
                          </TableRow>
                        ) : filteredTasks.length > 0 ? (
                          filteredTasks.map((task) => (
                            <TableRow
                              key={task.id}
                              className={`${selectedDate && task.scheduled_date && new Date(task.scheduled_date).toDateString() === selectedDate.toDateString() ? "bg-yellow-50" : ""}`}
                            >
                              <TableCell className="font-medium">
                                {task.title}
                              </TableCell>
                              <TableCell>
                                {task.equipment
                                  ? task.equipment.name
                                  : getEquipmentName(task.equipment_id)}
                              </TableCell>
                              <TableCell>
                                {formatDate(task.scheduled_date)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {task.frequency !== "custom" && (
                                    <Repeat className="h-4 w-4 mr-1 text-gray-500" />
                                  )}
                                  {getFrequencyText(task)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getPriorityBadge(task.priority)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(task.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  {task.status !== "completed" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleCompleteTask(task.id)
                                      }
                                      title="Complete Task"
                                    >
                                      <CheckCircle
                                        size={16}
                                        className="text-green-500"
                                        title={
                                          task.frequency !== "custom" ||
                                          task.custom_days
                                            ? "Complete & Schedule Next"
                                            : "Complete Task"
                                        }
                                      />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTask(task)}
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      fetchTaskStatusHistory(task.id);
                                      setSelectedTask(task);
                                      setHistoryModalOpen(true);
                                    }}
                                    title="View History"
                                  >
                                    <History
                                      size={16}
                                      className="text-blue-500"
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      // Generate annual schedule report for this task
                                      const currentYear =
                                        new Date().getFullYear();
                                      const headers = [
                                        "Date",
                                        "Task",
                                        "Equipment",
                                        "Status",
                                      ];
                                      const csvRows = [headers];

                                      // Find all occurrences of this task in the calendar events
                                      Object.keys(calendarEvents).forEach(
                                        (dateKey) => {
                                          const yearFromKey =
                                            dateKey.split("-")[0];
                                          if (
                                            yearFromKey ===
                                            currentYear.toString()
                                          ) {
                                            calendarEvents[dateKey].forEach(
                                              (event) => {
                                                // Check if this is the same task or a recurring instance
                                                const isOriginalTask =
                                                  event.id === task.id;
                                                const isRecurringInstance =
                                                  event.original_task_id ===
                                                  task.id;

                                                if (
                                                  isOriginalTask ||
                                                  isRecurringInstance
                                                ) {
                                                  csvRows.push([
                                                    format(
                                                      new Date(
                                                        event.scheduled_date,
                                                      ),
                                                      "MMM d, yyyy",
                                                    ),
                                                    event.title,
                                                    event.equipment?.name ||
                                                      getEquipmentName(
                                                        event.equipment_id,
                                                      ),
                                                    event.status,
                                                  ]);
                                                }
                                              },
                                            );
                                          }
                                        },
                                      );

                                      // Create CSV content
                                      const csvContent = csvRows
                                        .map((row) => row.join(","))
                                        .join("\n");

                                      // Create a blob and download
                                      const blob = new Blob([csvContent], {
                                        type: "text/csv;charset=utf-8;",
                                      });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement("a");
                                      link.setAttribute("href", url);
                                      link.setAttribute(
                                        "download",
                                        `annual_schedule_${task.id}_${currentYear}.csv`,
                                      );
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);

                                      toast.success(
                                        `Annual schedule report for ${task.title} exported to Excel`,
                                      );
                                    }}
                                    title="Generate Annual Schedule Report"
                                  >
                                    <Download
                                      size={16}
                                      className="text-green-600"
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTask(task.id)}
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-6 text-gray-500"
                            >
                              No maintenance tasks found in the database.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Section - Now below tasks, full width */}
            <div className="w-full">
              <Card className="shadow-md">
                <CardHeader className="bg-gray-800 text-white p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 h-8 w-8 p-0"
                        onClick={() => {
                          const newDate = new Date(selectedDate || new Date());
                          newDate.setMonth(newDate.getMonth() - 1);
                          setSelectedDate(newDate);
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 h-8 w-8 p-0"
                        onClick={() => {
                          const newDate = new Date(selectedDate || new Date());
                          newDate.setMonth(newDate.getMonth() + 1);
                          setSelectedDate(newDate);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 px-3 py-1 text-xs"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        today
                      </Button>
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {selectedDate ? format(selectedDate, "MMMM yyyy") : ""}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Calendar Grid */}
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse min-w-full">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Sunday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Monday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Tuesday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Wednesday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Thursday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Friday
                          </th>
                          <th className="border p-2 bg-gray-100 text-gray-800">
                            Saturday
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateCalendarGrid().map((week, weekIndex) => (
                          <tr key={weekIndex} className="h-24">
                            {week.map((day, dayIndex) =>
                              renderCalendarCell(day),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tasks for Selected Date */}
                  <div className="p-4 border-t">
                    <h3 className="text-lg font-semibold mb-3">
                      {selectedDate
                        ? `Tasks for ${format(selectedDate, "MMMM d, yyyy")}`
                        : "Select a date to view tasks"}
                    </h3>

                    {selectedDate && (
                      <div className="space-y-3">
                        {calendarEvents[format(selectedDate, "yyyy-MM-dd")] ? (
                          calendarEvents[
                            format(selectedDate, "yyyy-MM-dd")
                          ].map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 bg-white rounded-md border hover:shadow-md transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-gray-500">
                                  {task.equipment?.name ||
                                    getEquipmentName(task.equipment_id)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPriorityBadge(task.priority)}
                                {getStatusBadge(task.status)}
                                <div className="flex space-x-1">
                                  {task.status !== "completed" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleCompleteTask(
                                          task.is_recurring_instance
                                            ? task.original_task_id
                                            : task.id,
                                        )
                                      }
                                    >
                                      <CheckCircle
                                        size={16}
                                        className="text-green-500"
                                      />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            No tasks scheduled for this date
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Task Status History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Task Status History</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? `History for task: ${selectedTask.title}`
                : "Task history"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {historyLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading history...</span>
              </div>
            ) : (
              <TaskStatusHistoryTable
                statusHistory={statusHistory}
                taskId={selectedTask?.id || ""}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Task Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Maintenance Task</DialogTitle>
            <DialogDescription>
              Enter completion notes for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-notes">Completion Notes</Label>
              <textarea
                id="completion-notes"
                rows={3}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Enter any notes about the completed work"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmCompleteTask}>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Scheduling Modal - Using the shared component */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Edit Maintenance Task" : "Schedule New Task"}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? "Update the maintenance task details below."
                : "Fill in the details to schedule a new maintenance task."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Task *</Label>
                  <Select
                    value={taskId}
                    onValueChange={(value) => {
                      setTaskId(value);
                      const selectedTask = tasksList.find(
                        (task) => task.id === value,
                      );
                      if (selectedTask) {
                        setTaskTitle(selectedTask.name);
                        setTaskDescription(selectedTask.description || "");
                      }
                    }}
                    required
                  >
                    <SelectTrigger id="task">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasksListLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading tasks...
                        </SelectItem>
                      ) : tasksList.length > 0 ? (
                        tasksList.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-tasks" disabled>
                          No tasks available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment *</Label>
                  <Select
                    value={equipmentId}
                    onValueChange={(value) => {
                      setEquipmentId(value);
                      const selectedEquipment = equipment.find(
                        (e) => e.id === value,
                      );
                      if (selectedEquipment) {
                        setAreaId(selectedEquipment.department_id);
                        setLineId(selectedEquipment.category_id || "");
                      }
                    }}
                    required
                  >
                    <SelectTrigger id="equipment">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading equipment...
                        </SelectItem>
                      ) : equipment.length > 0 ? (
                        equipment.map((equip) => (
                          <SelectItem key={equip.id} value={equip.id}>
                            {equip.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-equipment" disabled>
                          No equipment available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line">Line</Label>
                  <Select value={lineId} onValueChange={setLineId}>
                    <SelectTrigger id="line">
                      <SelectValue placeholder="Select line" />
                    </SelectTrigger>
                    <SelectContent>
                      {linesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading lines...
                        </SelectItem>
                      ) : lines.length > 0 ? (
                        lines.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            {line.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-lines" disabled>
                          No lines available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Select value={areaId} onValueChange={setAreaId}>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading areas...
                        </SelectItem>
                      ) : areas.length > 0 ? (
                        areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-areas" disabled>
                          No areas available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {frequency === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-days">Custom Days</Label>
                    <Input
                      id="custom-days"
                      type="number"
                      min="1"
                      placeholder="Enter days between occurrences"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(
                      value: "low" | "medium" | "high" | "critical",
                    ) => setPriority(value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={type}
                    onValueChange={(
                      value: "predictive" | "corrective" | "conditional",
                    ) => setType(value)}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="predictive">Predictive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="conditional">Conditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(
                      value:
                        | "scheduled"
                        | "in-progress"
                        | "completed"
                        | "cancelled"
                        | "partial",
                    ) => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned-to">Assigned To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger id="assigned-to">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter task description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedTask ? "Update Task" : "Schedule Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceScheduling;
