import React, { useState, useEffect } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
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
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import {
  useMaintenanceTasks,
  useEquipment,
  useCategories,
  useDepartments,
  useTasks,
} from "../../lib/hooks";
import {
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
} from "../../lib/api/maintenance";
import { toast } from "../../lib/utils/toast";
import { format, parseISO, isValid } from "date-fns";

const TaskBasedMaintenance = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [type, setType] = useState<"predictive" | "corrective" | "conditional">(
    "corrective",
  );
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const {
    tasks: maintenanceTasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    editTask,
    removeTask,
  } = useMaintenanceTasks();

  const { equipment, loading: equipmentLoading } = useEquipment();
  const { categories: areas, loading: areasLoading } = useCategories();
  const { departments, loading: departmentsLoading } = useDepartments();
  const { tasks, loading: tasksListLoading } = useTasks();

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query and type
  const filteredTasks = maintenanceTasks.filter((task) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.equipment?.name &&
        task.equipment.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type filter
    const matchesType = selectedType === "all" || task.type === selectedType;

    // Return true only if all filters match
    return matchesSearch && matchesType;
  });

  // Task CRUD operations
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
    setAreaId(task.area_id || "");

    // Get department ID from equipment
    const equipmentItem = equipment.find((e) => e.id === task.equipment_id);
    if (equipmentItem) {
      setDepartmentId(equipmentItem.department_id);
    } else {
      setDepartmentId("");
    }

    setScheduledDate(task.scheduled_date || "");
    setType(task.type || "corrective");
    setSelectedTaskId(""); // Reset selected task
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

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setEquipmentId("");
    setAreaId("");
    setDepartmentId("");
    setScheduledDate("");
    setType("corrective");
    setSelectedTaskId("");
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
      setLoading(true);

      if (selectedTask) {
        // Update existing task
        const taskUpdate: MaintenanceTaskUpdate = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          area_id: areaId,
          scheduled_date: scheduledDate,
          type: type,
          notes: notes,
        };
        await editTask(selectedTask.id, taskUpdate);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const newTask: MaintenanceTaskInsert = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          area_id: areaId,
          scheduled_date: scheduledDate,
          type: type,
          priority: "medium",
          status: "scheduled",
          notes: notes,
        };
        await addTask(newTask);
        toast.success("Task created successfully");
      }

      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  // Handle equipment selection to auto-select its area and department
  const handleEquipmentChange = (value: string) => {
    setEquipmentId(value);
    const selectedEquipment = equipment.find((e) => e.id === value);
    if (selectedEquipment) {
      setAreaId(selectedEquipment.category_id || "");
      setDepartmentId(selectedEquipment.department_id);
    }
  };

  // Handle task selection to populate form
  const handleTaskSelection = (taskId: string) => {
    setSelectedTaskId(taskId);
    const selectedTask = tasks.find((t) => t.id === taskId);
    if (selectedTask) {
      setTaskTitle(selectedTask.name);
      setTaskDescription(selectedTask.description || "");
    }
  };

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "predictive":
        return <Badge className="bg-blue-100 text-blue-800">Predictive</Badge>;
      case "corrective":
        return <Badge className="bg-red-100 text-red-800">Corrective</Badge>;
      case "conditional":
        return (
          <Badge className="bg-purple-100 text-purple-800">Conditional</Badge>
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
          title="Task-Based Maintenance"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Task-Based Maintenance</h2>
              <Button onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" /> Add New Task
              </Button>
            </div>

            {/* Tasks List */}
            <Card className="w-full">
              <CardHeader className="bg-gray-50 border-b">
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
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="predictive">Predictive</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
                          <SelectItem value="conditional">
                            Conditional
                          </SelectItem>
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
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
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
                              colSpan={6}
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
                              <TableCell>{getTypeBadge(task.type)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    task.status === "completed"
                                      ? "outline"
                                      : "secondary"
                                  }
                                >
                                  {task.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
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
                              colSpan={6}
                              className="text-center py-6 text-gray-500"
                            >
                              No maintenance tasks found. Click "Add New Task"
                              to create one.
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

      {/* Task Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask
                ? "Edit Maintenance Task"
                : "Create New Maintenance Task"}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? "Update the maintenance task details below."
                : "Fill in the details to create a new maintenance task."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-select">
                  Select Existing Task (Optional)
                </Label>
                <Select
                  value={selectedTaskId}
                  onValueChange={handleTaskSelection}
                >
                  <SelectTrigger id="task-select">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Create New)</SelectItem>
                    {tasksListLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading tasks...
                      </SelectItem>
                    ) : tasks.length > 0 ? (
                      tasks.map((task) => (
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
                    onValueChange={handleEquipmentChange}
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : selectedTask ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
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
    </div>
  );
};

export default TaskBasedMaintenance;
