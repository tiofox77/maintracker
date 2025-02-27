import { useState, useEffect } from "react";
import {
  getMaintenanceTasks,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  completeMaintenanceTask,
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
} from "../api/maintenance";
import { toast } from "../utils/toast";

export function useMaintenanceTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load maintenance tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: MaintenanceTaskInsert) => {
    try {
      const newTask = await createMaintenanceTask(task);
      // Refetch to get the joined data
      fetchTasks();
      toast.success("Maintenance task scheduled successfully");
      return newTask;
    } catch (err) {
      toast.error("Failed to schedule maintenance task");
      throw err;
    }
  };

  const editTask = async (id: string, task: MaintenanceTaskUpdate) => {
    try {
      const updatedTask = await updateMaintenanceTask(id, task);
      // Refetch to get the joined data
      fetchTasks();
      toast.success("Maintenance task updated successfully");
      return updatedTask;
    } catch (err) {
      toast.error("Failed to update maintenance task");
      throw err;
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteMaintenanceTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Maintenance task deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete maintenance task");
      throw err;
    }
  };

  const completeTask = async (
    id: string,
    actualDuration: number,
    notes: string,
  ) => {
    try {
      await completeMaintenanceTask(id, actualDuration, notes);
      // Refetch to get the updated data
      fetchTasks();
      toast.success("Maintenance task completed successfully");
      return true;
    } catch (err) {
      toast.error("Failed to complete maintenance task");
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    completeTask,
  };
}
