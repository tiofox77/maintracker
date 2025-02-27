import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data as Category[];
  } catch (error) {
    console.error("Error in getCategories:", error);
    throw error;
  }
}

export async function getCategoryById(id: string) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }

    return data as Category;
  } catch (error) {
    console.error(`Error in getCategoryById:`, error);
    throw error;
  }
}

export async function createCategory(category: CategoryInsert) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return data as Category;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
}

export async function updateCategory(id: string, category: CategoryUpdate) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }

    return data as Category;
  } catch (error) {
    console.error(`Error in updateCategory:`, error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteCategory:`, error);
    throw error;
  }
}

export async function getCategoryEquipmentCount(id: string) {
  try {
    const { count, error } = await supabase
      .from("equipment")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (error) {
      console.error(`Error counting equipment for category ${id}:`, error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error(`Error in getCategoryEquipmentCount:`, error);
    throw error;
  }
}
