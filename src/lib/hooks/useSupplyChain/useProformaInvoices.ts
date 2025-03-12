import { useState, useEffect, useCallback } from "react";
import {
  getProformaInvoices,
  getProformaInvoiceById,
  createProformaInvoice,
  updateProformaInvoice,
  deleteProformaInvoice,
  markProformaInvoiceAsPaid,
  cancelProformaInvoice,
  ProformaInvoice,
  ProformaInvoiceInsert,
  ProformaInvoiceUpdate,
} from "../../api/supplyChain/proformaInvoices";
import { toast } from "../../utils/toast";

export function useProformaInvoices({
  page = 1,
  limit = 10,
  status,
  currency,
  search,
  startDate,
  endDate,
  sortBy = "issue_date",
  sortOrder = "desc",
  autoFetch = true,
}: {
  page?: number;
  limit?: number;
  status?: "pending" | "paid" | "canceled";
  currency?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  autoFetch?: boolean;
} = {}) {
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProformaInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, count } = await getProformaInvoices({
        page: currentPage,
        limit: pageSize,
        status,
        currency,
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setProformaInvoices(data);
      setTotalCount(count);
      return { data, count };
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load proforma invoices");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    status,
    currency,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchProformaInvoices();
    }
  }, [fetchProformaInvoices, autoFetch]);

  const fetchProformaInvoiceById = async (id: string) => {
    try {
      setLoading(true);
      const data = await getProformaInvoiceById(id);
      return data;
    } catch (err) {
      toast.error("Failed to load proforma invoice details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addProformaInvoice = async (
    proformaInvoice: ProformaInvoiceInsert,
    documentFile?: File,
  ) => {
    try {
      setLoading(true);
      const newProformaInvoice = await createProformaInvoice(
        proformaInvoice,
        documentFile,
      );
      setProformaInvoices((prev) => [newProformaInvoice, ...prev]);
      setTotalCount((prev) => prev + 1);
      toast.success("Proforma invoice created successfully");
      return newProformaInvoice;
    } catch (err) {
      toast.error("Failed to create proforma invoice");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editProformaInvoice = async (
    id: string,
    proformaInvoice: ProformaInvoiceUpdate,
    documentFile?: File,
  ) => {
    try {
      setLoading(true);
      const updatedProformaInvoice = await updateProformaInvoice(
        id,
        proformaInvoice,
        documentFile,
      );
      setProformaInvoices((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedProformaInvoice } : item,
        ),
      );
      toast.success("Proforma invoice updated successfully");
      return updatedProformaInvoice;
    } catch (err) {
      toast.error("Failed to update proforma invoice");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProformaInvoice = async (id: string) => {
    try {
      setLoading(true);
      await deleteProformaInvoice(id);
      setProformaInvoices((prev) => prev.filter((item) => item.id !== id));
      setTotalCount((prev) => prev - 1);
      toast.success("Proforma invoice deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete proforma invoice");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string, notes?: string) => {
    try {
      setLoading(true);
      const updatedInvoice = await markProformaInvoiceAsPaid(id, notes);
      setProformaInvoices((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedInvoice } : item,
        ),
      );
      toast.success("Proforma invoice marked as paid successfully");
      return updatedInvoice;
    } catch (err) {
      toast.error("Failed to mark proforma invoice as paid");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelInvoice = async (id: string, notes?: string) => {
    try {
      setLoading(true);
      const updatedInvoice = await cancelProformaInvoice(id, notes);
      setProformaInvoices((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedInvoice } : item,
        ),
      );
      toast.success("Proforma invoice canceled successfully");
      return updatedInvoice;
    } catch (err) {
      toast.error("Failed to cancel proforma invoice");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    proformaInvoices,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    setCurrentPage,
    setPageSize,
    fetchProformaInvoices,
    fetchProformaInvoiceById,
    addProformaInvoice,
    editProformaInvoice,
    removeProformaInvoice,
    markAsPaid,
    cancelInvoice,
  };
}
