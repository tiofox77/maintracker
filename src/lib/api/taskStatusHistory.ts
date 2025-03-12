import { supabase } from "../supabase";

export type TaskStatusHistory = {
  id: string;
  task_id: string;
  status_date: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial";
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type TaskStatusHistoryInsert = Omit<
  TaskStatusHistory,
  "id" | "created_at" | "created_by"
>;

// Get status history for a specific task
export async function getTaskStatusHistory(taskId: string) {
  try {
    const { data, error } = await supabase
      .from("task_status_history")
      .select("*")
      .eq("task_id", taskId)
      .order("status_date", { ascending: false });

    if (error) {
      throw error;
    }

    return data as TaskStatusHistory[];
  } catch (error) {
    console.error(`Error fetching status history for task ${taskId}:`, error);
    throw error;
  }
}

// Get status history for a specific date range
export async function getTaskStatusHistoryByDateRange(
  startDate: string,
  endDate: string,
) {
  try {
    const { data, error } = await supabase
      .from("task_status_history")
      .select("*, task:task_id(title, equipment_id)")
      .gte("status_date", startDate)
      .lte("status_date", endDate)
      .order("status_date", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      `Error fetching status history between ${startDate} and ${endDate}:`,
      error,
    );
    throw error;
  }
}

// Add a new status history entry
export async function addTaskStatusHistory(
  statusHistory: TaskStatusHistoryInsert,
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("task_status_history")
      .insert({
        ...statusHistory,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as TaskStatusHistory;
  } catch (error) {
    console.error("Error adding task status history:", error);
    throw error;
  }
}
