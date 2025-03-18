import React, { useEffect, useState } from "react";
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
import { Input } from "../ui/input";
import { Plus, Search, Edit, Trash2, CheckCircle } from "lucide-react";
import { useTaskMaintenance } from "../../lib/hooks/useTaskMaintenance";
import { TaskMaintenance } from "../../lib/api/taskMaintenance";
import TaskCorrectiveModal from "../maintenance/TaskCorrectiveModal";
import { format } from "date-fns";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Layout from "../layout/Layout";

const TaskCorrective = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    completeTask,
  } = useTaskMaintenance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskMaintenance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TaskMaintenance) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await removeTask(taskToDelete);
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleCompleteTask = (id: string) => {
    setTaskToComplete(id);
    setIsCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (taskToComplete) {
      try {
        await completeTask(taskToComplete, completionNotes);
        setIsCompleteDialogOpen(false);
        setTaskToComplete(null);
        setCompletionNotes("");
      } catch (error) {
        console.error("Error completing task:", error);
      }
    }
  };

  const handleCloseModal = (refresh?: boolean) => {
    setIsModalOpen(false);
    setCurrentTask(null);
    if (refresh) {
      fetchTasks();
    }
  };

  const filteredTasks = tasks
    .filter((task) => task.type === "corrective")
    .filter(
      (task) =>
        task.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((task) => statusFilter === "all" || task.status === statusFilter);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Error loading tasks: {error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Corrective Maintenance Tasks</h1>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" /> Add New Task
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <div className="flex items-center space-x-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Area/Line</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No corrective maintenance tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.equipment?.name || "Unknown Equipment"}
                      </TableCell>
                      <TableCell>
                        {task.area?.name || ""}
                        {task.area?.name && task.line?.name ? " / " : ""}
                        {task.line?.name || ""}
                      </TableCell>
                      <TableCell>
                        {task.scheduled_date
                          ? format(
                              new Date(task.scheduled_date),
                              "MMM dd, yyyy",
                            )
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === "critical"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : task.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority
                            ? task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)
                            : "Low"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : task.status === "partial"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status
                            ? task.status.charAt(0).toUpperCase() +
                              task.status.slice(1).replace("-", " ")
                            : "Scheduled"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {task.description || "No description"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {task.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCompleteTask(task.id)}
                            title="Mark as Complete"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isModalOpen && (
          <TaskCorrectiveModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            task={currentTask}
            onAddTask={addTask}
            onEditTask={editTask}
          />
        )}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                maintenance task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Add any completion notes before marking this task as complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="Completion notes (optional)"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmComplete}
                className="bg-green-600"
              >
                Complete Task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default TaskCorrective;
