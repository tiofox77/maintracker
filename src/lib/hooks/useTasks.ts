import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  Task,
  TaskInsert,
  TaskUpdate,
} from "../api/tasks";
import { toast } from "../utils/toast";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTask = async (id: string) => {
    try {
      setLoading(true);
      const data = await getTaskById(id);
      return data;
    } catch (err) {
      toast.error("Failed to load task details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: TaskInsert) => {
    try {
      setLoading(true);
      const newTask = await createTask(task);
      setTasks((prev) => [...prev, newTask]);
      toast.success("Task created successfully");
      return newTask;
    } catch (err) {
      toast.error("Failed to create task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editTask = async (id: string, task: TaskUpdate) => {
    try {
      setLoading(true);
      const updatedTask = await updateTask(id, task);
      setTasks((prev) =>
        prev.map((item) => (item.id === id ? updatedTask : item)),
      );
      toast.success("Task updated successfully");
      return updatedTask;
    } catch (err) {
      toast.error("Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (id: string) => {
    try {
      setLoading(true);
      await deleteTask(id);
      setTasks((prev) => prev.filter((item) => item.id !== id));
      toast.success("Task deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete task");
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
    getTask,
    addTask,
    editTask,
    removeTask,
  };
}
