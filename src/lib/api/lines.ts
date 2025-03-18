import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Line = Database["public"]["Tables"]["categories"]["Row"];
export type LineInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type LineUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function getLines() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching lines:", error);
      throw error;
    }

    return data as Line[];
  } catch (error) {
    console.error("Error in getLines:", error);
    throw error;
  }
}

export async function getLineById(id: string) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching line with id ${id}:`, error);
      throw error;
    }

    return data as Line;
  } catch (error) {
    console.error(`Error in getLineById:`, error);
    throw error;
  }
}

export async function createLine(line: LineInsert) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert(line)
      .select()
      .single();

    if (error) {
      console.error("Error creating line:", error);
      throw error;
    }

    return data as Line;
  } catch (error) {
    console.error("Error in createLine:", error);
    throw error;
  }
}

export async function updateLine(id: string, line: LineUpdate) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update(line)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating line with id ${id}:`, error);
      throw error;
    }

    return data as Line;
  } catch (error) {
    console.error(`Error in updateLine:`, error);
    throw error;
  }
}

export async function deleteLine(id: string) {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting line with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteLine:`, error);
    throw error;
  }
}

export async function getLineEquipmentCount(id: string) {
  try {
    const { count, error } = await supabase
      .from("equipment")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (error) {
      console.error(`Error counting equipment for line ${id}:`, error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error(`Error in getLineEquipmentCount:`, error);
    throw error;
  }
}
