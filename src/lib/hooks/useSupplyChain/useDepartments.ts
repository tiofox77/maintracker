import { useState, useEffect, useCallback } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  DepartmentInsert,
  DepartmentUpdate,
} from "../../api/supplyChain/departments";
import { toast } from "../../utils/toast";

export function useSupplyChainDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartments();
      setDepartments(data);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load departments");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const addDepartment = async (department: DepartmentInsert) => {
    try {
      setLoading(true);
      const newDepartment = await createDepartment(department);
      setDepartments((prev) => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      toast.error("Failed to add department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editDepartment = async (id: string, department: DepartmentUpdate) => {
    try {
      setLoading(true);
      const updatedDepartment = await updateDepartment(id, department);
      setDepartments((prev) =>
        prev.map((item) => (item.id === id ? updatedDepartment : item)),
      );
      return updatedDepartment;
    } catch (err) {
      toast.error("Failed to update department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeDepartment = async (id: string) => {
    try {
      setLoading(true);
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      toast.error("Failed to delete department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
