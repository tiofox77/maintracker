import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type MaintenanceTask =
  Database["public"]["Tables"]["maintenance_tasks"]["Row"];
export type MaintenanceTaskInsert =
  Database["public"]["Tables"]["maintenance_tasks"]["Insert"];
export type MaintenanceTaskUpdate =
  Database["public"]["Tables"]["maintenance_tasks"]["Update"];

export async function getMaintenanceTasks() {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .order("scheduled_date");

  if (error) {
    console.error("Error fetching maintenance tasks:", error);
    throw error;
  }

  return data;
}

export async function getMaintenanceTaskById(id: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching maintenance task with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createMaintenanceTask(task: MaintenanceTaskInsert) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .insert(task)
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
  task: MaintenanceTaskUpdate,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .update(task)
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

export async function getMaintenanceTasksByEquipment(equipmentId: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .eq("equipment_id", equipmentId)
    .order("scheduled_date");

  if (error) {
    console.error(
      `Error fetching maintenance tasks for equipment ${equipmentId}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getMaintenanceTasksByStatus(
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial",
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .eq("status", status)
    .order("scheduled_date");

  if (error) {
    console.error(
      `Error fetching maintenance tasks with status ${status}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getMaintenanceTasksByDateRange(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date");

  if (error) {
    console.error(
      `Error fetching maintenance tasks between ${startDate} and ${endDate}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getMaintenanceTasksByPriority(
  priority: "low" | "medium" | "high" | "critical",
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .eq("priority", priority)
    .order("scheduled_date");

  if (error) {
    console.error(
      `Error fetching maintenance tasks with priority ${priority}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getMaintenanceTasksByAssignee(assignedTo: string) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .eq("assigned_to", assignedTo)
    .order("scheduled_date");

  if (error) {
    console.error(
      `Error fetching maintenance tasks assigned to ${assignedTo}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function completeMaintenanceTask(
  id: string,
  actualDuration: number,
  notes: string,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .update({
      status: "completed",
      completed_date: new Date().toISOString(),
      actual_duration: actualDuration,
      notes: notes,
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
