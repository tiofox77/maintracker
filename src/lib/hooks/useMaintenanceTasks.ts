import { useState, useEffect, useCallback } from "react";
import {
  getMaintenanceTasks,
  getMaintenanceTaskById,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  completeMaintenanceTask,
  getMaintenanceTasksByEquipment,
  getMaintenanceTasksByCategory,
  getMaintenanceTasksByStatus,
  getMaintenanceTasksByDateRange,
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
} from "../api/maintenance";
import { toast } from "../utils/toast";

export function useMaintenanceTasks() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasks();
      setTasks(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load maintenance tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTaskById = async (id: string) => {
    try {
      setLoading(true);
      const data = await getMaintenanceTaskById(id);
      return data;
    } catch (err) {
      toast.error("Failed to load maintenance task details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: MaintenanceTaskInsert) => {
    try {
      setLoading(true);
      const newTask = await createMaintenanceTask(task);
      setTasks((prev) => [...prev, newTask]);
      toast.success("Maintenance task created successfully");
      return newTask;
    } catch (err) {
      toast.error("Failed to create maintenance task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editTask = async (id: string, task: MaintenanceTaskUpdate) => {
    try {
      setLoading(true);
      const updatedTask = await updateMaintenanceTask(id, task);
      setTasks((prev) =>
        prev.map((item) => (item.id === id ? updatedTask : item)),
      );
      toast.success("Maintenance task updated successfully");
      return updatedTask;
    } catch (err) {
      toast.error("Failed to update maintenance task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (id: string) => {
    try {
      setLoading(true);
      await deleteMaintenanceTask(id);
      setTasks((prev) => prev.filter((item) => item.id !== id));
      toast.success("Maintenance task deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete maintenance task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (id: string, notes: string) => {
    try {
      setLoading(true);
      const completedTask = await completeMaintenanceTask(id, notes);
      setTasks((prev) =>
        prev.map((item) => (item.id === id ? completedTask : item)),
      );
      toast.success("Maintenance task completed successfully");
      return completedTask;
    } catch (err) {
      toast.error("Failed to complete maintenance task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByEquipment = async (equipmentId: string) => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasksByEquipment(equipmentId);
      return data;
    } catch (err) {
      toast.error("Failed to load equipment maintenance tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasksByCategory(categoryId);
      return data;
    } catch (err) {
      toast.error("Failed to load category maintenance tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = async (
    status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial",
  ) => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasksByStatus(status);
      return data;
    } catch (err) {
      toast.error(`Failed to load ${status} maintenance tasks`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const data = await getMaintenanceTasksByDateRange(startDate, endDate);
      return data;
    } catch (err) {
      toast.error("Failed to load maintenance tasks for date range");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTaskById,
    addTask,
    editTask,
    removeTask,
    completeTask,
    getTasksByEquipment,
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDateRange,
  };
}
