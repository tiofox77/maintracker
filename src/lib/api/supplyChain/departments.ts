import { supabase } from "../../supabase";

export type Department = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type DepartmentInsert = Omit<
  Department,
  "id" | "created_at" | "updated_at"
>;
export type DepartmentUpdate = Partial<
  Omit<Department, "id" | "created_at" | "updated_at">
>;

// Get all departments
export async function getDepartments() {
  try {
    const { data, error } = await supabase
      .from("supply_chain_departments")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return data as Department[];
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
}

// Get a single department by ID
export async function getDepartmentById(id: string) {
  try {
    const { data, error } = await supabase
      .from("supply_chain_departments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error(`Error fetching department with id ${id}:`, error);
    throw error;
  }
}

// Create a new department
export async function createDepartment(department: DepartmentInsert) {
  try {
    const { data, error } = await supabase
      .from("supply_chain_departments")
      .insert(department)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
}

// Update an existing department
export async function updateDepartment(
  id: string,
  department: DepartmentUpdate,
) {
  try {
    const { data, error } = await supabase
      .from("supply_chain_departments")
      .update({
        ...department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Department;
  } catch (error) {
    console.error(`Error updating department with id ${id}:`, error);
    throw error;
  }
}

// Delete a department
export async function deleteDepartment(id: string) {
  try {
    const { error } = await supabase
      .from("supply_chain_departments")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting department with id ${id}:`, error);
    throw error;
  }
}
