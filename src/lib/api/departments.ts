import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type DepartmentInsert =
  Database["public"]["Tables"]["departments"]["Insert"];
export type DepartmentUpdate =
  Database["public"]["Tables"]["departments"]["Update"];

export async function getDepartments() {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }

    return data as Department[];
  } catch (error) {
    console.error("Error in getDepartments:", error);
    throw error;
  }
}

export async function getDepartmentById(id: string) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching department with id ${id}:`, error);
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error(`Error in getDepartmentById:`, error);
    throw error;
  }
}

export async function createDepartment(department: DepartmentInsert) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .insert(department)
      .select()
      .single();

    if (error) {
      console.error("Error creating department:", error);
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error("Error in createDepartment:", error);
    throw error;
  }
}

export async function updateDepartment(
  id: string,
  department: DepartmentUpdate,
) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update(department)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating department with id ${id}:`, error);
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error(`Error in updateDepartment:`, error);
    throw error;
  }
}

export async function deleteDepartment(id: string) {
  try {
    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting department with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteDepartment:`, error);
    throw error;
  }
}

export async function getDepartmentEquipmentCount(id: string) {
  try {
    const { count, error } = await supabase
      .from("equipment")
      .select("*", { count: "exact", head: true })
      .eq("department_id", id);

    if (error) {
      console.error(`Error counting equipment for department ${id}:`, error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error(`Error in getDepartmentEquipmentCount:`, error);
    throw error;
  }
}
