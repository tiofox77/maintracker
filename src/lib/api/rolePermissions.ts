import { supabase } from "../supabase";
import { Database } from "../../types/database.types";

export type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
  created_at: string;
};

export type RolePermission = {
  id: string;
  role: "admin" | "manager" | "technician" | "user" | string;
  permission_id: string;
  created_at: string;
  permission?: Permission;
};

export type PermissionInsert = Omit<Permission, "id" | "created_at">;
export type RolePermissionInsert = Omit<
  RolePermission,
  "id" | "created_at" | "permission"
>;

// Get all permissions
export async function getPermissions() {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("module", { ascending: true });

    if (error) {
      throw error;
    }

    return data as Permission[];
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
}

// Get permissions for a specific role
export async function getPermissionsByRole(role: string) {
  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*, permission:permission_id(*)")
      .eq("role", role);

    if (error) {
      throw error;
    }

    return data as RolePermission[];
  } catch (error) {
    console.error(`Error fetching permissions for role ${role}:`, error);
    throw error;
  }
}

// Add a permission to a role
export async function addPermissionToRole(
  rolePermission: RolePermissionInsert,
) {
  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .insert(rolePermission)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as RolePermission;
  } catch (error) {
    console.error("Error adding permission to role:", error);
    throw error;
  }
}

// Remove a permission from a role
export async function removePermissionFromRole(id: string) {
  try {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error removing permission with id ${id}:`, error);
    throw error;
  }
}

// Check if a user has a specific permission
export async function checkUserPermission(
  userId: string,
  permissionName: string,
) {
  try {
    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError) {
      throw userError;
    }

    if (!userData) {
      return false;
    }

    // Get permission ID
    const { data: permissionData, error: permissionError } = await supabase
      .from("permissions")
      .select("id")
      .eq("name", permissionName)
      .single();

    if (permissionError) {
      throw permissionError;
    }

    if (!permissionData) {
      return false;
    }

    // Check if role has permission
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role", userData.role)
      .eq("permission_id", permissionData.id);

    if (error) {
      throw error;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error(
      `Error checking permission ${permissionName} for user ${userId}:`,
      error,
    );
    return false;
  }
}
