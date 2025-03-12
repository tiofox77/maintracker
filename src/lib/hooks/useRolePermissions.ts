import { useState, useEffect, useCallback } from "react";
import {
  getPermissions,
  getPermissionsByRole,
  addPermissionToRole,
  removePermissionFromRole,
  Permission,
  RolePermission,
  RolePermissionInsert,
} from "../api/rolePermissions";
import { toast } from "../utils/toast";

export function useRolePermissions(role?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load permissions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRolePermissions = useCallback(async (roleValue: string) => {
    try {
      setLoading(true);
      const data = await getPermissionsByRole(roleValue);
      setRolePermissions(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error(`Failed to load permissions for role ${roleValue}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    if (role) {
      fetchRolePermissions(role);
    }
  }, [fetchPermissions, fetchRolePermissions, role]);

  const addPermission = useCallback(
    async (rolePermission: RolePermissionInsert) => {
      try {
        setLoading(true);
        const newRolePermission = await addPermissionToRole(rolePermission);
        setRolePermissions((prev) => [...prev, newRolePermission]);
        toast.success("Permission added to role successfully");
        return newRolePermission;
      } catch (err) {
        toast.error("Failed to add permission to role");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removePermission = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await removePermissionFromRole(id);
      setRolePermissions((prev) => prev.filter((item) => item.id !== id));
      toast.success("Permission removed from role successfully");
      return true;
    } catch (err) {
      toast.error("Failed to remove permission from role");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permissions,
    rolePermissions,
    loading,
    error,
    fetchPermissions,
    fetchRolePermissions,
    addPermission,
    removePermission,
  };
}
