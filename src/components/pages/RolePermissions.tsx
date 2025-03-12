import React, { useState, useEffect } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Loader2, Save, Shield, Info } from "lucide-react";
import { useRolePermissions } from "../../lib/hooks";
import { toast } from "../../lib/utils/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const RolePermissions = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [permissionsByModule, setPermissionsByModule] = useState<
    Record<string, any[]>
  >({});
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const {
    permissions,
    rolePermissions,
    loading,
    error,
    fetchRolePermissions,
    addPermission,
    removePermission,
  } = useRolePermissions(selectedRole);

  // Group permissions by module
  useEffect(() => {
    const groupedPermissions: Record<string, any[]> = {};
    permissions.forEach((permission) => {
      if (!groupedPermissions[permission.module]) {
        groupedPermissions[permission.module] = [];
      }
      groupedPermissions[permission.module].push(permission);
    });
    setPermissionsByModule(groupedPermissions);
  }, [permissions]);

  // Set selected permissions based on role permissions
  useEffect(() => {
    const selected: Record<string, boolean> = {};
    rolePermissions.forEach((rp) => {
      if (rp.permission) {
        selected[rp.permission.id] = true;
      } else if (rp.permission_id) {
        selected[rp.permission_id] = true;
      }
    });
    setSelectedPermissions(selected);
  }, [rolePermissions]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    fetchRolePermissions(role);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: checked,
    }));
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      // Get current permissions for the role
      const currentPermissions = rolePermissions.reduce(
        (acc: Record<string, string>, rp) => {
          const permId = rp.permission ? rp.permission.id : rp.permission_id;
          acc[permId] = rp.id;
          return acc;
        },
        {},
      );

      // Determine permissions to add and remove
      const toAdd = [];
      const toRemove = [];

      // Find permissions to add
      for (const permId in selectedPermissions) {
        if (selectedPermissions[permId] && !currentPermissions[permId]) {
          toAdd.push({
            role: selectedRole,
            permission_id: permId,
          });
        }
      }

      // Find permissions to remove
      for (const permId in currentPermissions) {
        if (!selectedPermissions[permId]) {
          toRemove.push(currentPermissions[permId]);
        }
      }

      // Process additions
      for (const permission of toAdd) {
        await addPermission(permission);
      }

      // Process removals
      for (const id of toRemove) {
        await removePermission(id);
      }

      toast.success("Role permissions updated successfully");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to update role permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Role Permissions"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Shield className="mr-2 h-6 w-6 text-primary" />
                Role Permissions Management
              </h2>
              <Button
                onClick={handleSavePermissions}
                disabled={loading || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>

            <Card>
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle>Configure Role Access</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Role Permissions</p>
                        <p className="mt-1">
                          Configure what each role can access in the system.
                          Select a role and check the permissions you want to
                          grant. Changes will take effect immediately after
                          saving.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Tabs
                    defaultValue="admin"
                    value={selectedRole}
                    onValueChange={handleRoleChange}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                      <TabsTrigger value="manager">Manager</TabsTrigger>
                      <TabsTrigger value="technician">Technician</TabsTrigger>
                      <TabsTrigger value="user">User</TabsTrigger>
                    </TabsList>

                    {["admin", "manager", "technician", "user"].map((role) => (
                      <TabsContent
                        key={role}
                        value={role}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            {role.charAt(0).toUpperCase() + role.slice(1)} Role
                            Permissions
                          </h3>
                          <Badge
                            className={`${
                              role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : role === "manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : role === "technician"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Badge>
                        </div>

                        {loading ? (
                          <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mr-2" />
                            <span>Loading permissions...</span>
                          </div>
                        ) : error ? (
                          <div className="text-center py-12 text-red-500">
                            Error loading permissions. Please try again.
                          </div>
                        ) : (
                          <div className="space-y-8">
                            {Object.keys(permissionsByModule).length > 0 ? (
                              Object.entries(permissionsByModule).map(
                                ([module, modulePermissions]) => (
                                  <div key={module} className="space-y-4">
                                    <h4 className="text-md font-medium border-b pb-2">
                                      {module} Module
                                    </h4>
                                    <div className="rounded-md border overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[300px]">
                                              Permission
                                            </TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[100px] text-center">
                                              Access
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {modulePermissions.map(
                                            (permission) => (
                                              <TableRow key={permission.id}>
                                                <TableCell className="font-medium">
                                                  {permission.name}
                                                </TableCell>
                                                <TableCell>
                                                  {permission.description}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <div className="flex justify-center">
                                                          <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={
                                                              !!selectedPermissions[
                                                                permission.id
                                                              ]
                                                            }
                                                            onCheckedChange={(
                                                              checked,
                                                            ) =>
                                                              handlePermissionChange(
                                                                permission.id,
                                                                checked ===
                                                                  true,
                                                              )
                                                            }
                                                            disabled={
                                                              role ===
                                                                "admin" &&
                                                              permission.name.startsWith(
                                                                "view",
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        {role === "admin" &&
                                                        permission.name.startsWith(
                                                          "view",
                                                        )
                                                          ? "Admin always has view permissions"
                                                          : selectedPermissions[
                                                                permission.id
                                                              ]
                                                            ? "Click to revoke access"
                                                            : "Click to grant access"}
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                </TableCell>
                                              </TableRow>
                                            ),
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="text-center py-12 text-gray-500">
                                No permissions found in the system.
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
