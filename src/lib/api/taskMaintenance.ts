import { supabase } from "../supabase";

export type TaskMaintenance = {
  id: string;
  task_id: string | null;
  equipment_id: string;
  line_id: string | null;
  area_id: string | null;
  scheduled_date: string;
  frequency: "custom" | "weekly" | "monthly" | "yearly" | null;
  custom_days: number | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "partial";
  type: "predictive" | "corrective" | "conditional";
  assigned_to: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
  };
  line?: {
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
  };
};

export type TaskMaintenanceInsert = Omit<
  TaskMaintenance,
  "id" | "created_at" | "updated_at" | "equipment" | "line" | "area" | "task"
>;

export type TaskMaintenanceUpdate = Partial<
  Omit<
    TaskMaintenance,
    "id" | "created_at" | "updated_at" | "equipment" | "line" | "area" | "task"
  >
>;

export async function getTaskMaintenances() {
  console.log("Fetching task maintenances from task_maintenance table");
  const { data, error } = await supabase
    .from("task_maintenance")
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching task maintenances:", error);
    throw error;
  }

  console.log("Task maintenances data:", data);
  return data as TaskMaintenance[];
}

export async function getTaskMaintenanceById(id: string) {
  const { data, error } = await supabase
    .from("task_maintenance")
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching task maintenance with id ${id}:`, error);
    throw error;
  }

  return data as TaskMaintenance;
}

export async function createTaskMaintenance(
  taskMaintenance: TaskMaintenanceInsert,
) {
  console.log("Creating task maintenance with data:", taskMaintenance);
  const { data, error } = await supabase
    .from("task_maintenance")
    .insert(taskMaintenance)
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .single();

  if (error) {
    console.error("Error creating task maintenance:", error);
    throw error;
  }

  console.log("Created task maintenance:", data);
  return data as TaskMaintenance;
}

export async function updateTaskMaintenance(
  id: string,
  taskMaintenance: TaskMaintenanceUpdate,
) {
  console.log(`Updating task maintenance with id ${id}:`, taskMaintenance);
  const { data, error } = await supabase
    .from("task_maintenance")
    .update(taskMaintenance)
    .eq("id", id)
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .single();

  if (error) {
    console.error(`Error updating task maintenance with id ${id}:`, error);
    throw error;
  }

  return data as TaskMaintenance;
}

export async function deleteTaskMaintenance(id: string) {
  console.log(`Deleting task maintenance with id ${id}`);
  const { error } = await supabase
    .from("task_maintenance")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting task maintenance with id ${id}:`, error);
    throw error;
  }

  return true;
}

export async function completeTaskMaintenance(id: string, notes: string) {
  console.log(`Completing task maintenance with id ${id}, notes: ${notes}`);
  const { data, error } = await supabase
    .from("task_maintenance")
    .update({
      status: "completed",
      notes: notes || null,
    })
    .eq("id", id)
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .single();

  if (error) {
    console.error(`Error completing task maintenance with id ${id}:`, error);
    throw error;
  }

  return data as TaskMaintenance;
}

export async function getTaskMaintenancesByEquipment(equipmentId: string) {
  const { data, error } = await supabase
    .from("task_maintenance")
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .eq("equipment_id", equipmentId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching task maintenances for equipment ${equipmentId}:`,
      error,
    );
    throw error;
  }

  return data as TaskMaintenance[];
}

export async function getTaskMaintenancesByDateRange(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("task_maintenance")
    .select(
      "*, equipment:equipment_id(id, name), line:line_id(id, name), area:area_id(id, name), task:task_id(id, name)",
    )
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error(
      `Error fetching task maintenances between ${startDate} and ${endDate}:`,
      error,
    );
    throw error;
  }

  return data as TaskMaintenance[];
}
