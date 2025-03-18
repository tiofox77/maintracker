import { useState, useCallback } from "react";
import {
  getTaskMaintenances,
  createTaskMaintenance,
  updateTaskMaintenance,
  deleteTaskMaintenance,
  completeTaskMaintenance,
  TaskMaintenance,
  TaskMaintenanceInsert,
  TaskMaintenanceUpdate,
} from "../api/taskMaintenance";

export function useTaskMaintenance() {
  const [tasks, setTasks] = useState<TaskMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTaskMaintenances();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching task maintenances:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (task: TaskMaintenanceInsert) => {
    try {
      const newTask = await createTaskMaintenance(task);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error("Error adding task maintenance:", err);
      throw err;
    }
  }, []);

  const editTask = useCallback(
    async (id: string, task: TaskMaintenanceUpdate) => {
      try {
        const updatedTask = await updateTaskMaintenance(id, task);
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        return updatedTask;
      } catch (err) {
        console.error("Error updating task maintenance:", err);
        throw err;
      }
    },
    [],
  );

  const removeTask = useCallback(async (id: string) => {
    try {
      await deleteTaskMaintenance(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error("Error removing task maintenance:", err);
      throw err;
    }
  }, []);

  const completeTask = useCallback(async (id: string, notes: string) => {
    try {
      const completedTask = await completeTaskMaintenance(id, notes);
      setTasks((prev) => prev.map((t) => (t.id === id ? completedTask : t)));
      return completedTask;
    } catch (err) {
      console.error("Error completing task maintenance:", err);
      throw err;
    }
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
