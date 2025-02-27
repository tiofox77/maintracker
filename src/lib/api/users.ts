import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("last_name");

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data as User[];
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }

  return data as User;
}

export async function createUser(user: UserInsert) {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data as User;
}

export async function updateUser(id: string, user: UserUpdate) {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }

  return data as User;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }

  return true;
}

export async function getUsersByRole(
  role: "admin" | "manager" | "technician" | "user",
) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", role)
    .order("last_name");

  if (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    throw error;
  }

  return data as User[];
}

export async function getUsersByDepartment(department: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("department", department)
    .order("last_name");

  if (error) {
    console.error(`Error fetching users in department ${department}:`, error);
    throw error;
  }

  return data as User[];
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }

  return data as User;
}
