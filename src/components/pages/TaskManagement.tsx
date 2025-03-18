import React, { useState } from "react";
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
import { Input } from "../ui/input";
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
import { useTasks } from "../../lib/hooks";
import TaskManagementModal from "../tasks/TaskManagementModal";
import { format, parseISO } from "date-fns";

const TaskManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Get tasks from hook
  const { tasks, loading, error, removeTask } = useTasks();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => {
    return (
      searchQuery === "" ||
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleAddTask = () => {
    setSelectedTask(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTask(taskId);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a");
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
          title="Task Management"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Task Management</h2>
              <Button onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" /> Add New Task
              </Button>
            </div>

            {/* Tasks List */}
            <Card className="w-full">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Loading tasks...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-red-500"
                          >
                            Error loading tasks. Please try again.
                          </TableCell>
                        </TableRow>
                      ) : filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">
                              {task.name}
                            </TableCell>
                            <TableCell>
                              {task.description || "No description"}
                            </TableCell>
                            <TableCell>{formatDate(task.created_at)}</TableCell>
                            <TableCell>{formatDate(task.updated_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditTask(task.id)}
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
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            No tasks found. Click "Add New Task" to create one.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Management Modal */}
      <TaskManagementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskId={selectedTask}
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
    </div>
  );
};

export default TaskManagement;
