import React, { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
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
} from "lucide-react";
import { Label } from "../ui/label";
import {
  useMaintenanceTasks,
  useEquipment,
  useCategories,
  useDepartments,
} from "../../lib/hooks";
import {
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
} from "../../lib/api/maintenance";
import { toast } from "../../lib/utils/toast";

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
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [status, setStatus] = useState<
    "scheduled" | "in-progress" | "completed" | "cancelled" | "partial"
  >("scheduled");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

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

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query, selected date, priority, and status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.equipment &&
        task.equipment.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (task.category_id &&
        task.category_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const taskDate = task.scheduled_date ? new Date(task.scheduled_date) : null;
    const matchesDate =
      selectedDate && taskDate
        ? taskDate.toDateString() === selectedDate.toDateString()
        : true;

    const matchesPriority =
      selectedPriority === "all" || task.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    return matchesSearch && matchesDate && matchesPriority && matchesStatus;
  });

  // Maintenance Task CRUD operations
  const handleAddTask = () => {
    setSelectedTask(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEditTask = (task: MaintenanceTask) => {
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
    setEstimatedDuration(
      task.estimated_duration ? task.estimated_duration.toString() : "",
    );
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
    if (taskToComplete && actualDuration) {
      try {
        await completeTask(taskToComplete, parseFloat(actualDuration), notes);
        setCompleteDialogOpen(false);
        setTaskToComplete(null);
        setActualDuration("");
        setNotes("");
      } catch (error) {
        console.error("Error completing task:", error);
      }
    } else {
      toast.error("Please enter the actual duration");
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setEquipmentId("");
    setCategoryId("");
    setDepartmentId("");
    setScheduledDate("");
    setEstimatedDuration("");
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
          estimated_duration: estimatedDuration
            ? parseFloat(estimatedDuration)
            : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
          // Department is not directly stored in maintenance_tasks but can be used for reference
        };
        await editTask(selectedTask.id, taskUpdate);
      } else {
        // Create new task
        const newTask: MaintenanceTaskInsert = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          category_id: categoryId,
          scheduled_date: scheduledDate,
          estimated_duration: estimatedDuration
            ? parseFloat(estimatedDuration)
            : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
          // Department is not directly stored in maintenance_tasks but can be used for reference
        };
        await addTask(newTask);
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
              <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
              <Button onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  {selectedDate && (
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium">
                        Selected: {format(selectedDate, "PPP")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Maintenance Tasks</CardTitle>
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
                            <SelectItem value="all">All Priorities</SelectItem>
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
                            <SelectItem value="all">All Statuses</SelectItem>
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
                            <TableHead>Duration</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
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
                              <TableRow key={task.id}>
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
                                  {task.estimated_duration
                                    ? `${task.estimated_duration} hrs`
                                    : "N/A"}
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
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteTask(task.id)}
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
                                No maintenance tasks found matching your
                                criteria.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
                  <Label htmlFor="estimated-duration">
                    Estimated Duration (hours)
                  </Label>
                  <Input
                    id="estimated-duration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Enter estimated hours"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
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
                  <Input
                    id="assigned-to"
                    placeholder="Enter technician ID"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
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
              Enter the actual duration and any completion notes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actual-duration">Actual Duration (hours) *</Label>
              <Input
                id="actual-duration"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Enter actual hours spent"
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
                required
              />
            </div>
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
            <Button onClick={confirmCompleteTask}>Complete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceScheduling;
