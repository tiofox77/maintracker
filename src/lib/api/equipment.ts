import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type EquipmentInsert =
  Database["public"]["Tables"]["equipment"]["Insert"];
export type EquipmentUpdate =
  Database["public"]["Tables"]["equipment"]["Update"];

export async function getEquipment() {
  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      categories(*),
      departments(*)
    `,
    )
    .order("name");

  if (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }

  return data;
}

export async function getEquipmentById(id: string) {
  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      categories(*),
      departments(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching equipment with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createEquipment(equipment: EquipmentInsert) {
  const { data, error } = await supabase
    .from("equipment")
    .insert(equipment)
    .select()
    .single();

  if (error) {
    console.error("Error creating equipment:", error);
    throw error;
  }

  return data as Equipment;
}

export async function updateEquipment(id: string, equipment: EquipmentUpdate) {
  const { data, error } = await supabase
    .from("equipment")
    .update(equipment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating equipment with id ${id}:`, error);
    throw error;
  }

  return data as Equipment;
}

export async function deleteEquipment(id: string) {
  const { error } = await supabase.from("equipment").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting equipment with id ${id}:`, error);
    throw error;
  }

  return true;
}

export async function getEquipmentByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      categories(*),
      departments(*)
    `,
    )
    .eq("category_id", categoryId)
    .order("name");

  if (error) {
    console.error(
      `Error fetching equipment for category ${categoryId}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getEquipmentByDepartment(departmentId: string) {
  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      categories(*),
      departments(*)
    `,
    )
    .eq("department_id", departmentId)
    .order("name");

  if (error) {
    console.error(
      `Error fetching equipment for department ${departmentId}:`,
      error,
    );
    throw error;
  }

  return data;
}

export async function getEquipmentByStatus(
  status: "operational" | "maintenance" | "out-of-service",
) {
  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      categories(*),
      departments(*)
    `,
    )
    .eq("status", status)
    .order("name");

  if (error) {
    console.error(`Error fetching equipment with status ${status}:`, error);
    throw error;
  }

  return data;
}
