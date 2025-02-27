import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDepartments } from "../../lib/hooks";
import {
  Department,
  DepartmentInsert,
  DepartmentUpdate,
  getDepartmentById,
} from "../../lib/api/departments";
import { toast } from "../../lib/utils/toast";

interface DepartmentManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId?: string | null;
}

export const DepartmentManagementModal = ({
  open,
  onOpenChange,
  departmentId = null,
}: DepartmentManagementModalProps) => {
  // Form states
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentLocation, setDepartmentLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addDepartment, editDepartment } = useDepartments();

  // Fetch department data if editing
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (departmentId && open) {
        try {
          setLoading(true);
          const department = await getDepartmentById(departmentId);

          setDepartmentName(department.name);
          setDepartmentDescription(department.description || "");
          setDepartmentLocation(department.location || "");
        } catch (error) {
          console.error("Error fetching department:", error);
          toast.error("Failed to load department details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDepartmentData();
  }, [departmentId, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setDepartmentName("");
    setDepartmentDescription("");
    setDepartmentLocation("");
  };

  const validateForm = () => {
    if (!departmentName) {
      toast.error("Department name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (departmentId) {
        // Update existing department
        const departmentUpdate: DepartmentUpdate = {
          name: departmentName,
          description: departmentDescription || null,
          location: departmentLocation || null,
        };
        await editDepartment(departmentId, departmentUpdate);
        toast.success("Department updated successfully");
      } else {
        // Create new department
        const newDepartment: DepartmentInsert = {
          name: departmentName,
          description: departmentDescription || null,
          location: departmentLocation || null,
        };
        await addDepartment(newDepartment);
        toast.success("Department added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {departmentId ? "Edit Department" : "Add New Department"}
          </DialogTitle>
          <DialogDescription>
            {departmentId
              ? "Update the department details below."
              : "Fill in the details to create a new department."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="department-name">Department Name *</Label>
                <Input
                  id="department-name"
                  placeholder="Enter department name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-description">Description</Label>
                <textarea
                  id="department-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter department description"
                  value={departmentDescription}
                  onChange={(e) => setDepartmentDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-location">Location</Label>
                <Input
                  id="department-location"
                  placeholder="Enter department location"
                  value={departmentLocation}
                  onChange={(e) => setDepartmentLocation(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : departmentId ? (
                  "Update Department"
                ) : (
                  "Add Department"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
