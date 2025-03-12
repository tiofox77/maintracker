import { useState, useEffect, useCallback } from "react";
import {
  getMaterialRequests,
  getMaterialRequestById,
  createMaterialRequest,
  updateMaterialRequest,
  deleteMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
  MaterialRequest,
  MaterialRequestInsert,
  MaterialRequestUpdate,
  MaterialRequestItem,
  addMaterialRequestItem,
  updateMaterialRequestItem,
  deleteMaterialRequestItem,
} from "../../api/supplyChain/materialRequests";
import { toast } from "../../utils/toast";

export function useMaterialRequests({
  page = 1,
  limit = 10,
  status,
  department,
  search,
  startDate,
  endDate,
  sortBy = "request_date",
  sortOrder = "desc",
  autoFetch = true,
}: {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  department?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  autoFetch?: boolean;
} = {}) {
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaterialRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, count } = await getMaterialRequests({
        page: currentPage,
        limit: pageSize,
        status,
        department,
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setMaterialRequests(data);
      setTotalCount(count);
      return { data, count };
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load material requests");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    status,
    department,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchMaterialRequests();
    }
  }, [fetchMaterialRequests, autoFetch]);

  const fetchMaterialRequestById = async (id: string) => {
    try {
      setLoading(true);
      const data = await getMaterialRequestById(id);
      return data;
    } catch (err) {
      toast.error("Failed to load material request details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMaterialRequest = async (materialRequest: MaterialRequestInsert) => {
    try {
      setLoading(true);
      const newMaterialRequest = await createMaterialRequest(materialRequest);
      setMaterialRequests((prev) => [newMaterialRequest, ...prev]);
      setTotalCount((prev) => prev + 1);
      toast.success("Material request created successfully");
      return newMaterialRequest;
    } catch (err) {
      toast.error("Failed to create material request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editMaterialRequest = async (
    id: string,
    materialRequest: MaterialRequestUpdate,
  ) => {
    try {
      setLoading(true);
      const updatedMaterialRequest = await updateMaterialRequest(
        id,
        materialRequest,
      );
      setMaterialRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedMaterialRequest } : item,
        ),
      );
      toast.success("Material request updated successfully");
      return updatedMaterialRequest;
    } catch (err) {
      toast.error("Failed to update material request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMaterialRequest = async (id: string) => {
    try {
      setLoading(true);
      await deleteMaterialRequest(id);
      setMaterialRequests((prev) => prev.filter((item) => item.id !== id));
      setTotalCount((prev) => prev - 1);
      toast.success("Material request deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete material request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, notes?: string) => {
    try {
      setLoading(true);
      const updatedRequest = await approveMaterialRequest(id, notes);
      setMaterialRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedRequest } : item,
        ),
      );
      toast.success("Material request approved successfully");
      return updatedRequest;
    } catch (err) {
      toast.error("Failed to approve material request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (id: string, notes?: string) => {
    try {
      setLoading(true);
      const updatedRequest = await rejectMaterialRequest(id, notes);
      setMaterialRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedRequest } : item,
        ),
      );
      toast.success("Material request rejected successfully");
      return updatedRequest;
    } catch (err) {
      toast.error("Failed to reject material request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Item operations
  const addItem = async (item: MaterialRequestItem) => {
    try {
      setLoading(true);
      const newItem = await addMaterialRequestItem(item);
      // Update the material requests state to include the new item
      setMaterialRequests((prev) =>
        prev.map((request) => {
          if (request.id === item.material_request_id) {
            return {
              ...request,
              items: [...(request.items || []), newItem],
            };
          }
          return request;
        }),
      );
      toast.success("Item added successfully");
      return newItem;
    } catch (err) {
      toast.error("Failed to add item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, item: Partial<MaterialRequestItem>) => {
    try {
      setLoading(true);
      const updatedItem = await updateMaterialRequestItem(id, item);
      // Update the material requests state to include the updated item
      setMaterialRequests((prev) =>
        prev.map((request) => {
          if (request.items?.some((i) => i.id === id)) {
            return {
              ...request,
              items: request.items.map((i) =>
                i.id === id ? { ...i, ...updatedItem } : i,
              ),
            };
          }
          return request;
        }),
      );
      toast.success("Item updated successfully");
      return updatedItem;
    } catch (err) {
      toast.error("Failed to update item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string, requestId: string) => {
    try {
      setLoading(true);
      await deleteMaterialRequestItem(id);
      // Update the material requests state to remove the deleted item
      setMaterialRequests((prev) =>
        prev.map((request) => {
          if (request.id === requestId) {
            return {
              ...request,
              items: request.items?.filter((i) => i.id !== id) || [],
            };
          }
          return request;
        }),
      );
      toast.success("Item removed successfully");
      return true;
    } catch (err) {
      toast.error("Failed to remove item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    materialRequests,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    setCurrentPage,
    setPageSize,
    fetchMaterialRequests,
    fetchMaterialRequestById,
    addMaterialRequest,
    editMaterialRequest,
    removeMaterialRequest,
    approveRequest,
    rejectRequest,
    addItem,
    updateItem,
    removeItem,
  };
}
