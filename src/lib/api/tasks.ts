import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Task = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at">;

export type TaskUpdate = Partial<
  Omit<Task, "id" | "created_at" | "updated_at">
>;

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  return data as Task[];
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching task with id ${id}:`, error);
    throw error;
  }

  return data as Task;
}

export async function createTask(task: TaskInsert) {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  return data as Task;
}

export async function updateTask(id: string, task: TaskUpdate) {
  const { data, error } = await supabase
    .from("tasks")
    .update(task)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating task with id ${id}:`, error);
    throw error;
  }

  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    throw error;
  }

  return true;
}
