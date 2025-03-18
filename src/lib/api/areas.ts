import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Area = Database["public"]["Tables"]["departments"]["Row"];
export type AreaInsert = Database["public"]["Tables"]["departments"]["Insert"];
export type AreaUpdate = Database["public"]["Tables"]["departments"]["Update"];

export async function getAreas() {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching areas:", error);
      throw error;
    }

    return data as Area[];
  } catch (error) {
    console.error("Error in getAreas:", error);
    throw error;
  }
}

export async function getAreaById(id: string) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching area with id ${id}:`, error);
      throw error;
    }

    return data as Area;
  } catch (error) {
    console.error(`Error in getAreaById:`, error);
    throw error;
  }
}

export async function createArea(area: AreaInsert) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .insert(area)
      .select()
      .single();

    if (error) {
      console.error("Error creating area:", error);
      throw error;
    }

    return data as Area;
  } catch (error) {
    console.error("Error in createArea:", error);
    throw error;
  }
}

export async function updateArea(id: string, area: AreaUpdate) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update(area)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating area with id ${id}:`, error);
      throw error;
    }

    return data as Area;
  } catch (error) {
    console.error(`Error in updateArea:`, error);
    throw error;
  }
}

export async function deleteArea(id: string) {
  try {
    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting area with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteArea:`, error);
    throw error;
  }
}

export async function getAreaEquipmentCount(id: string) {
  try {
    const { count, error } = await supabase
      .from("equipment")
      .select("*", { count: "exact", head: true })
      .eq("department_id", id);

    if (error) {
      console.error(`Error counting equipment for area ${id}:`, error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error(`Error in getAreaEquipmentCount:`, error);
    throw error;
  }
}
