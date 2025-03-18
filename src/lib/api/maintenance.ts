import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type MaintenanceTask = {
  id: string;
  title: string;
  description: string | null;
  equipment_id: string;
  category_id: string | null;
  area_id: string | null;
  task_id: string | null;
  scheduled_date: string | null;
  completion_date: string | null;
  frequency: "custom" | "weekly" | "monthly" | "yearly" | null;
  custom_days: number | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial";
  assigned_to: string | null;
  notes: string | null;
  type: "predictive" | "corrective" | "conditional" | null;
  estimated_duration?: number | null;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  area?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  is_recurring_instance?: boolean;
  original_task_id?: string;
};

export type MaintenanceTaskInsert = Omit<
  MaintenanceTask,
  | "id"
  | "created_at"
  | "updated_at"
  | "equipment"
  | "is_recurring_instance"
  | "original_task_id"
>;

export type MaintenanceTaskUpdate = Partial<
  Omit<
    MaintenanceTask,
    | "id"
    | "created_at"
    | "updated_at"
    | "equipment"
    | "is_recurring_instance"
    | "original_task_id"
  >
>;

export async function getMaintenanceTasks() {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching maintenance tasks:", error);
    throw error;
  }

  return data as MaintenanceTask[];
}

export async function getMaintenanceTaskById(id: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching maintenance task with id ${id}:`, error);
    throw error;
  }

  return data as MaintenanceTask;
}

export async function createMaintenanceTask(
  maintenanceTask: MaintenanceTaskInsert,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .insert(maintenanceTask)
    .select()
    .single();

  if (error) {
    console.error("Error creating maintenance task:", error);
    throw error;
  }

  return data as MaintenanceTask;
}

export async function updateMaintenanceTask(
  id: string,
  maintenanceTask: MaintenanceTaskUpdate,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .update(maintenanceTask)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating maintenance task with id ${id}:`, error);
    throw error;
  }

  return data as MaintenanceTask;
}

export async function deleteMaintenanceTask(id: string) {
  const { error } = await supabase
    .from("maintenance_tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting maintenance task with id ${id}:`, error);
    throw error;
  }

  return true;
}

export async function completeMaintenanceTask(id: string, notes: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .update({
      status: "completed",
      completion_date: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error completing maintenance task with id ${id}:`, error);
    throw error;
  }

  return data as MaintenanceTask;
}

export async function getMaintenanceTasksByEquipment(equipmentId: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .eq("equipment_id", equipmentId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching maintenance tasks for equipment ${equipmentId}:`,
      error,
    );
    throw error;
  }

  return data as MaintenanceTask[];
}

export async function getMaintenanceTasksByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .eq("category_id", categoryId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching maintenance tasks for category ${categoryId}:`,
      error,
    );
    throw error;
  }

  return data as MaintenanceTask[];
}

export async function getMaintenanceTasksByStatus(
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial",
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .eq("status", status)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching maintenance tasks with status ${status}:`,
      error,
    );
    throw error;
  }

  return data as MaintenanceTask[];
}

export async function getMaintenanceTasksByDateRange(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      "*, equipment:equipment_id(id, name), category:category_id(id, name), area:categories(id, name), task:task_id(id, name, description)",
    )
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching maintenance tasks between ${startDate} and ${endDate}:`,
      error,
    );
    throw error;
  }

  return data as MaintenanceTask[];
}
