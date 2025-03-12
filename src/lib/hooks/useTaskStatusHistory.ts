import { useState, useCallback } from "react";
import {
  getTaskStatusHistory,
  getTaskStatusHistoryByDateRange,
  addTaskStatusHistory,
  TaskStatusHistory,
  TaskStatusHistoryInsert,
} from "../api/taskStatusHistory";
import { toast } from "../utils/toast";

export function useTaskStatusHistory() {
  const [statusHistory, setStatusHistory] = useState<TaskStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTaskStatusHistory = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      const data = await getTaskStatusHistory(taskId);
      setStatusHistory(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load task status history");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatusHistoryByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        setLoading(true);
        const data = await getTaskStatusHistoryByDateRange(startDate, endDate);
        setError(null);
        return data;
      } catch (err) {
        setError(err as Error);
        toast.error("Failed to load status history for date range");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addStatusHistory = useCallback(
    async (statusHistory: TaskStatusHistoryInsert) => {
      try {
        setLoading(true);
        const newStatusHistory = await addTaskStatusHistory(statusHistory);
        setStatusHistory((prev) => [newStatusHistory, ...prev]);
        setError(null);
        return newStatusHistory;
      } catch (err) {
        setError(err as Error);
        toast.error("Failed to add status history");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    statusHistory,
    loading,
    error,
    fetchTaskStatusHistory,
    fetchStatusHistoryByDateRange,
    addStatusHistory,
  };
}
