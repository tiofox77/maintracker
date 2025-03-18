import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTasks } from "../../lib/hooks";
import { Task, TaskInsert, TaskUpdate } from "../../lib/api/tasks";
import { toast } from "../../lib/utils/toast";

interface TaskManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string | null;
  mode?: "create" | "edit";
}

export const TaskManagementModal = ({
  open,
  onOpenChange,
  taskId = null,
  mode = "create",
}: TaskManagementModalProps) => {
  // Form states
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addTask, editTask, getTask } = useTasks();

  // Fetch task data if editing
  useEffect(() => {
    const fetchTaskData = async () => {
      if (taskId && open && mode === "edit") {
        try {
          setLoading(true);
          const task = await getTask(taskId);
          setTaskName(task.name);
          setTaskDescription(task.description || "");
        } catch (error) {
          console.error("Error fetching task:", error);
          toast.error("Failed to load task details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTaskData();
  }, [taskId, open, mode, getTask]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setTaskName("");
    setTaskDescription("");
  };

  const validateForm = () => {
    if (!taskName) {
      toast.error("Task name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (taskId && mode === "edit") {
        // Update existing task
        const taskUpdate: TaskUpdate = {
          name: taskName,
          description: taskDescription,
        };
        await editTask(taskId, taskUpdate);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const newTask: TaskInsert = {
          name: taskName,
          description: taskDescription,
        };
        await addTask(newTask);
        toast.success("Task created successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the task details below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name *</Label>
                <Input
                  id="task-name"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
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
              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : mode === "edit" ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskManagementModal;
