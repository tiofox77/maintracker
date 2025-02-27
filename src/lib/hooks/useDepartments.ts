import { useState, useEffect } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  DepartmentInsert,
  DepartmentUpdate,
} from "../api/departments";
import { toast } from "../utils/toast";

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load departments");
      console.error("Error in fetchDepartments:", err);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (department: DepartmentInsert) => {
    try {
      const newDepartment = await createDepartment(department);
      setDepartments((prev) => [...prev, newDepartment]);
      toast.success("Department added successfully");
      return newDepartment;
    } catch (err) {
      toast.error("Failed to add department");
      console.error("Error in addDepartment:", err);
      throw err;
    }
  };

  const editDepartment = async (id: string, department: DepartmentUpdate) => {
    try {
      const updatedDepartment = await updateDepartment(id, department);
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === id ? updatedDepartment : dept)),
      );
      toast.success("Department updated successfully");
      return updatedDepartment;
    } catch (err) {
      toast.error("Failed to update department");
      console.error("Error in editDepartment:", err);
      throw err;
    }
  };

  const removeDepartment = async (id: string) => {
    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      toast.success("Department deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete department");
      console.error("Error in removeDepartment:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    addDepartment,
    editDepartment,
    removeDepartment,
  };
}
