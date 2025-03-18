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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Plus, Search, Loader2, Edit, Trash2, CheckCircle } from "lucide-react";
import { useTaskMaintenance, useEquipment, useTasks } from "../../lib/hooks";
import { TaskMaintenance as TaskMaintenanceType } from "../../lib/api/taskMaintenance";
import { TaskMaintenanceModal } from "../maintenance/TaskMaintenanceModal";
import { toast } from "../../lib/utils/toast";
import { format, parseISO, isValid } from "date-fns";

const TaskMaintenance = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskMaintenanceType | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"create" | "edit" | "complete">(
    "create",
  );

  // Get data from hooks
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
    removeTask,
  } = useTaskMaintenance();
  const { equipment } = useEquipment();
  const { tasks: tasksList } = useTasks();

  // Fetch tasks on component mount
  useEffect(() => {
    console.log("Component mounted, fetching tasks...");
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query, type and status
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      (task.equipment?.name &&
        task.equipment.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.task?.name &&
        task.task.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type filter
    const matchesType = selectedType === "all" || task.type === selectedType;

    // Status filter
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    // Return true only if all filters match
    return matchesSearch && matchesType && matchesStatus;
  });

  // Task CRUD operations
  const handleAddTask = () => {
    setSelectedTask(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditTask = (task: TaskMaintenanceType) => {
    setSelectedTask(task);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCompleteTask = (task: TaskMaintenanceType) => {
    setSelectedTask(task);
    setModalMode("complete");
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
        toast.success("Task deleted successfully");
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      }
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

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
        );
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case "partial":
        return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Helper function to get equipment name by ID
  const getEquipmentName = (equipmentId: string) => {
    const equip = equipment.find((e) => e.id === equipmentId);
    return equip ? equip.name : "Unknown Equipment";
  };

  // Helper function to get task name by ID
  const getTaskName = (taskId: string | null) => {
    if (!taskId) return "No task selected";
    const task = tasksList.find((t) => t.id === taskId);
    return task ? task.name : "Unknown Task";
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
          title="Task Maintenance"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Task Maintenance</h2>
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
                        placeholder="Search task, equipment or description..."
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
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-[150px]">
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
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
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
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">
                                {task.task
                                  ? task.task.name
                                  : getTaskName(task.task_id)}
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
                                {getStatusBadge(task.status)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`
                                    ${task.priority === "low" ? "bg-blue-50 text-blue-700" : ""}
                                    ${task.priority === "medium" ? "bg-green-50 text-green-700" : ""}
                                    ${task.priority === "high" ? "bg-orange-50 text-orange-700" : ""}
                                    ${task.priority === "critical" ? "bg-red-50 text-red-700" : ""}
                                  `}
                                >
                                  {task.priority.charAt(0).toUpperCase() +
                                    task.priority.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  {task.status !== "completed" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCompleteTask(task)}
                                      title="Complete"
                                    >
                                      <CheckCircle
                                        size={16}
                                        className="text-green-600"
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
      <TaskMaintenanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskMaintenanceId={selectedTask?.id}
        mode={modalMode}
      />

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

export default TaskMaintenance;
