import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
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
  useCategories,
  useDepartments,
  useTaskStatusHistory,
  useUsers,
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
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
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
  const { categories, loading: categoriesLoading } = useCategories();
  const { departments, loading: departmentsLoading } = useDepartments();
  const {
    statusHistory,
    loading: historyLoading,
    addStatusHistory,
    fetchTaskStatusHistory,
  } = useTaskStatusHistory();
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
    setCategoryId(task.category_id || "");

    // Get department ID from equipment
    const equipmentItem = equipment.find((e) => e.id === task.equipment_id);
    if (equipmentItem) {
      setDepartmentId(equipmentItem.department_id);
    } else {
      setDepartmentId("");
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
    setCategoryId("");
    setDepartmentId("");
    setScheduledDate("");
    setFrequency("custom");
    setCustomDays("");
    setPriority("medium");
    setStatus("scheduled");
    setAssignedTo("");
    setNotes("");
  };

  const validateForm = () => {
    if (!taskTitle) {
      toast.error("Task title is required");
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
          category_id: categoryId,
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
          category_id: categoryId,
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

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "Unknown Department";
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
                      {selectedDate
                        ? format(selectedDate, "MMMM yyyy")
                        : format(new Date(), "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 px-3 py-1 text-xs"
                      >
                        month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 px-3 py-1 text-xs"
                      >
                        week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 px-3 py-1 text-xs"
                      >
                        day
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 px-3 py-1 text-xs"
                      >
                        list
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Days of the week */}
                  <div className="grid grid-cols-7 bg-white">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <div
                          key={day}
                          className="text-center font-semibold py-2 text-gray-700 border-b border-gray-200"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Calendar grid */}
                  <div className="calendar-grid">
                    {selectedDate && (
                      <div className="grid grid-cols-7 auto-rows-fr">
                        {/* Generate dynamic calendar based on selected date */}
                        {(() => {
                          const currentDate = new Date(selectedDate);
                          const year = currentDate.getFullYear();
                          const month = currentDate.getMonth();

                          // First day of the month
                          const firstDay = new Date(year, month, 1);
                          // Last day of the month
                          const lastDay = new Date(year, month + 1, 0);

                          // Day of the week for the first day (0 = Sunday, 6 = Saturday)
                          const firstDayOfWeek = firstDay.getDay();

                          // Days from previous month to fill the beginning of the calendar
                          const prevMonthDays = [];
                          if (firstDayOfWeek > 0) {
                            const prevMonth = new Date(year, month, 0);
                            const prevMonthLastDay = prevMonth.getDate();

                            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                              const day = prevMonthLastDay - i;
                              const date = new Date(year, month - 1, day);
                              const dateKey = format(date, "yyyy-MM-dd");
                              const dayEvents = calendarEvents[dateKey] || [];

                              prevMonthDays.push(
                                <div
                                  key={`prev-${day}`}
                                  className="border p-2 bg-gray-50 text-gray-400 min-h-[100px]"
                                  onClick={() => setSelectedDate(date)}
                                >
                                  <div className="text-sm">{day}</div>
                                  {dayEvents.map((event, index) => (
                                    <div
                                      key={`prev-${day}-event-${index}`}
                                      className={`mt-1 text-xs ${event.status === "completed" ? "bg-green-500" : "bg-blue-500"} text-white p-1 rounded-sm cursor-pointer`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTask(event);
                                        setStatus(event.status || "scheduled");
                                        setStatusUpdateModalOpen(true);
                                      }}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                </div>,
                              );
                            }
                          }

                          // Days of the current month
                          const currentMonthDays = [];
                          for (let day = 1; day <= lastDay.getDate(); day++) {
                            const date = new Date(year, month, day);
                            const dateKey = format(date, "yyyy-MM-dd");
                            const dayEvents = calendarEvents[dateKey] || [];
                            const isToday =
                              format(date, "yyyy-MM-dd") ===
                              format(new Date(), "yyyy-MM-dd");
                            const isSelected =
                              selectedDate &&
                              format(date, "yyyy-MM-dd") ===
                                format(selectedDate, "yyyy-MM-dd");

                            currentMonthDays.push(
                              <div
                                key={`current-${day}`}
                                className={`border p-2 min-h-[100px] ${isToday ? "bg-blue-50" : ""} ${isSelected ? "bg-yellow-50" : ""}`}
                                onClick={() => setSelectedDate(date)}
                              >
                                <div className="text-sm font-medium">{day}</div>
                                {dayEvents.map((event, index) => (
                                  <div
                                    key={`current-${day}-event-${index}`}
                                    className={`mt-1 text-xs ${event.status === "completed" ? "bg-green-500" : event.priority === "critical" ? "bg-red-500" : event.priority === "high" ? "bg-orange-500" : "bg-blue-500"} text-white p-1 rounded-sm cursor-pointer`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(event);
                                      setStatus(event.status || "scheduled");
                                      setStatusUpdateModalOpen(true);
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                              </div>,
                            );
                          }

                          // Days from next month to fill the end of the calendar
                          const nextMonthDays = [];
                          const totalCells = 42; // 6 rows x 7 columns
                          const remainingCells =
                            totalCells -
                            (prevMonthDays.length + currentMonthDays.length);

                          for (let day = 1; day <= remainingCells; day++) {
                            const date = new Date(year, month + 1, day);
                            const dateKey = format(date, "yyyy-MM-dd");
                            const dayEvents = calendarEvents[dateKey] || [];

                            nextMonthDays.push(
                              <div
                                key={`next-${day}`}
                                className="border p-2 bg-gray-50 text-gray-400 min-h-[100px]"
                                onClick={() => setSelectedDate(date)}
                              >
                                <div className="text-sm">{day}</div>
                                {dayEvents.map((event, index) => (
                                  <div
                                    key={`next-${day}-event-${index}`}
                                    className={`mt-1 text-xs ${event.status === "completed" ? "bg-green-500" : "bg-blue-500"} text-white p-1 rounded-sm cursor-pointer`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(event);
                                      setStatus(event.status || "scheduled");
                                      setStatusUpdateModalOpen(true);
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                              </div>,
                            );
                          }

                          return [
                            ...prevMonthDays,
                            ...currentMonthDays,
                            ...nextMonthDays,
                          ];
                        })()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Details */}
              <div className="mt-6">
                <Card className="shadow-md">
                  <CardHeader className="bg-gray-100 border-b pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Date Details</CardTitle>
                      {selectedDate && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedDate(undefined)}
                        >
                          Clear selection
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    {selectedDate ? (
                      <div className="space-y-6">
                        <div className="bg-gray-100 p-3 rounded-md border text-center">
                          <h3 className="text-lg font-bold">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </h3>
                        </div>

                        {/* Tasks for the selected date */}
                        {calendarEvents[format(selectedDate, "yyyy-MM-dd")] &&
                        calendarEvents[format(selectedDate, "yyyy-MM-dd")]
                          .length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-semibold text-gray-700 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Scheduled tasks (
                                {
                                  calendarEvents[
                                    format(selectedDate, "yyyy-MM-dd")
                                  ].length
                                }
                                ):
                              </p>
                              <Button
                                size="sm"
                                onClick={handleAddTask}
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" /> New task
                              </Button>
                            </div>

                            <div className="bg-white rounded-md border overflow-hidden">
                              <ul className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                                {calendarEvents[
                                  format(selectedDate, "yyyy-MM-dd")
                                ].map((task, index) => (
                                  <li
                                    key={task.id}
                                    className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${task.status === "completed" ? "bg-green-50" : ""}`}
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setStatus(task.status || "scheduled");
                                      setStatusUpdateModalOpen(true);
                                    }}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div
                                        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${task.priority === "critical" ? "bg-red-500" : task.priority === "high" ? "bg-orange-500" : task.priority === "medium" ? "bg-blue-500" : "bg-gray-500"}`}
                                      ></div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                          {task.title}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                          <span className="truncate">
                                            {task.equipment?.name ||
                                              getEquipmentName(
                                                task.equipment_id,
                                              )}
                                          </span>
                                          <span className="mx-1">•</span>
                                          <span>{getFrequencyText(task)}</span>
                                        </div>
                                        <div className="flex mt-2 justify-between items-center">
                                          {getPriorityBadge(task.priority)}
                                          <div className="flex gap-1">
                                            {task.status !== "completed" && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleCompleteTask(task.id);
                                                }}
                                              >
                                                <CheckCircle
                                                  size={12}
                                                  className="mr-1"
                                                />
                                                {task.frequency !== "custom" ||
                                                task.custom_days
                                                  ? "Complete & Schedule Next"
                                                  : "Complete"}
                                              </Button>
                                            )}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 px-2 text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTask(task);
                                              }}
                                            >
                                              <Edit
                                                size={12}
                                                className="mr-1"
                                              />
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                fetchTaskStatusHistory(task.id);
                                                setSelectedTask(task);
                                                setHistoryModalOpen(true);
                                              }}
                                            >
                                              <History
                                                size={12}
                                                className="mr-1"
                                              />
                                              History
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-200">
                            <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 mb-4">
                              No tasks scheduled for this date
                            </p>
                            <Button onClick={handleAddTask}>
                              <Plus className="h-4 w-4 mr-1" /> Schedule
                              maintenance
                            </Button>
                          </div>
                        )}

                        {/* Task Status History for the selected date */}
                        {selectedDate && (
                          <div className="mt-6">
                            <TaskStatusHistoryTable
                              startDate={format(selectedDate, "yyyy-MM-dd")}
                              endDate={format(selectedDate, "yyyy-MM-dd")}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4 max-w-xs mx-auto">
                          Select a date in the calendar to view scheduled tasks
                        </p>
                        <Button onClick={() => setSelectedDate(new Date())}>
                          Select today
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Task Status History</DialogTitle>
            <DialogDescription>
              {selectedTask && (
                <div className="mt-2">
                  <p className="font-medium">{selectedTask.title}</p>
                  <p className="text-sm text-gray-500">
                    {selectedTask.equipment?.name ||
                      getEquipmentName(selectedTask.equipment_id)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export to Excel
                  if (!selectedTask) return;

                  // Create CSV content
                  const headers = ["Date", "Status", "Notes"];
                  const csvRows = [headers];

                  statusHistory.forEach((history) => {
                    csvRows.push([
                      format(
                        new Date(history.status_date),
                        "MMM d, yyyy h:mm a",
                      ),
                      history.status,
                      history.notes || "",
                    ]);
                  });

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
                    `task_history_${selectedTask.id}.csv`,
                  );
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  toast.success("History exported to Excel");
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Export to Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export to PDF (in a real app, you would use a library like jsPDF)
                  if (!selectedTask) return;

                  // For now, we'll just show a toast message
                  toast.success("History exported to PDF");

                  // In a real implementation, you would:
                  // 1. Create a PDF document
                  // 2. Add the task details and history table
                  // 3. Save the PDF file
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Export to PDF
              </Button>
            </div>

            {selectedTask && (
              <TaskStatusHistoryTable
                taskId={
                  selectedTask.is_recurring_instance &&
                  selectedTask.original_task_id
                    ? selectedTask.original_task_id
                    : selectedTask.id
                }
              />
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">
                Add New Status Update
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="history-status">Status</Label>
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
                    <SelectTrigger id="history-status">
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="history-notes">Notes</Label>
                  <div className="flex gap-2">
                    <Input
                      id="history-notes"
                      placeholder="Enter notes about this status update"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <Button
                      onClick={async () => {
                        if (!selectedTask || !notes) return;

                        try {
                          // Get the actual task ID (handle recurring instances)
                          let taskId = selectedTask.id;
                          if (
                            selectedTask.is_recurring_instance &&
                            selectedTask.original_task_id
                          ) {
                            taskId = selectedTask.original_task_id;
                          }

                          // Add entry to task status history
                          await addStatusHistory({
                            task_id: taskId,
                            status_date: new Date().toISOString(),
                            status: status,
                            notes: notes,
                          });

                          // Update the task status if needed
                          if (status !== selectedTask.status) {
                            await editTask(taskId, { status });
                          }

                          // Refresh history
                          await fetchTaskStatusHistory(taskId);

                          setNotes("");
                          toast.success("Status update added successfully");
                        } catch (error) {
                          console.error("Error adding status update:", error);
                          toast.error("Failed to add status update");
                        }
                      }}
                    >
                      Add Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Task Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask
                ? "Edit Maintenance Task"
                : "Schedule New Maintenance Task"}
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
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment *</Label>
                  <Select
                    value={equipmentId}
                    onValueChange={setEquipmentId}
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading departments...
                        </SelectItem>
                      ) : departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled>
                          No departments available
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
                  <Select
                    value={frequency}
                    onValueChange={(value: FrequencyType) =>
                      setFrequency(value)
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Days</SelectItem>
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
                      step="1"
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
                          Loading technicians...
                        </SelectItem>
                      ) : users.filter((user) => user.role === "technician")
                          .length > 0 ? (
                        users
                          .filter((user) => user.role === "technician")
                          .map((technician) => (
                            <SelectItem
                              key={technician.id}
                              value={technician.id}
                            >
                              {technician.first_name} {technician.last_name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-technicians" disabled>
                          No technicians available
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
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              maintenance task and remove it from our servers.
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
              {(() => {
                const task = taskToComplete
                  ? tasks.find((t) => t.id === taskToComplete)
                  : null;
                if (
                  task &&
                  (task.frequency !== "custom" ||
                    (task.frequency === "custom" && task.custom_days))
                ) {
                  return "Enter completion notes. A new task will be automatically scheduled based on the frequency.";
                }
                return "Enter any completion notes.";
              })()}
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
            <Button onClick={confirmCompleteTask}>
              {(() => {
                const task = taskToComplete
                  ? tasks.find((t) => t.id === taskToComplete)
                  : null;
                if (
                  task &&
                  (task.frequency !== "custom" ||
                    (task.frequency === "custom" && task.custom_days))
                ) {
                  return "Complete & Schedule Next";
                }
                return "Complete Task";
              })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog
        open={statusUpdateModalOpen}
        onOpenChange={setStatusUpdateModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>
              {selectedTask && (
                <div className="mt-2">
                  <p className="font-medium">{selectedTask.title}</p>
                  <p className="text-sm text-gray-500">
                    {selectedTask.equipment?.name ||
                      getEquipmentName(selectedTask.equipment_id)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-update">Status</Label>
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
                <SelectTrigger id="status-update">
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
              <Label htmlFor="status-notes">Status Notes</Label>
              <textarea
                id="status-notes"
                rows={3}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Enter notes about this status update"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="pt-2">
              {selectedTask && (
                <TaskStatusHistoryTable
                  taskId={
                    selectedTask.is_recurring_instance &&
                    selectedTask.original_task_id
                      ? selectedTask.original_task_id
                      : selectedTask.id
                  }
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStatusUpdateModalOpen(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedTask) return;

                try {
                  // Get the current status before updating
                  const currentStatus = selectedTask.status;

                  // Get the actual task ID (handle recurring instances)
                  let taskId = selectedTask.id;
                  if (
                    selectedTask.is_recurring_instance &&
                    selectedTask.original_task_id
                  ) {
                    taskId = selectedTask.original_task_id;
                  }

                  // Only update if status has changed
                  if (currentStatus !== status) {
                    // Update the task status
                    const updatedTask = await editTask(taskId, {
                      status,
                    });

                    // Add entry to task status history
                    await addStatusHistory({
                      task_id: taskId,
                      status_date: new Date().toISOString(),
                      status: status,
                      notes:
                        notes ||
                        `Status changed from ${currentStatus} to ${status}`,
                    });

                    // If status is completed and task is recurring, handle like complete task
                    if (
                      status === "completed" &&
                      (selectedTask.frequency !== "custom" ||
                        (selectedTask.frequency === "custom" &&
                          selectedTask.custom_days))
                    ) {
                      // Set the task to complete and open the complete dialog
                      setTaskToComplete(taskId);
                      setStatusUpdateModalOpen(false);
                      setCompleteDialogOpen(true);
                      return;
                    }

                    toast.success("Task status updated successfully");
                  } else if (notes) {
                    // If status hasn't changed but notes were added, just add a history entry
                    await addStatusHistory({
                      task_id: taskId,
                      status_date: new Date().toISOString(),
                      status: status,
                      notes: notes,
                    });
                    toast.success("Status notes added successfully");
                  } else {
                    toast.info("No changes were made");
                  }

                  setStatusUpdateModalOpen(false);
                  setNotes("");
                } catch (error) {
                  console.error("Error updating task status:", error);
                  toast.error("Failed to update task status");
                }
              }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceScheduling;
