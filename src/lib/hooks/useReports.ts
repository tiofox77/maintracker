import { useState } from "react";
import {
  getMaintenanceSummary,
  getEquipmentPerformance,
  getDepartmentAnalysis,
  getTechnicianPerformance,
  getMaintenanceCalendar,
  exportToCSV,
} from "../api/reports";
import { toast } from "../utils/toast";

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateMaintenanceSummary = async (
    startDate: string,
    endDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getMaintenanceSummary(startDate, endDate);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate maintenance summary report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateEquipmentPerformance = async (
    startDate: string,
    endDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getEquipmentPerformance(startDate, endDate);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate equipment performance report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateDepartmentAnalysis = async (
    startDate: string,
    endDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getDepartmentAnalysis(startDate, endDate);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate department analysis report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateTechnicianPerformance = async (
    startDate: string,
    endDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getTechnicianPerformance(startDate, endDate);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate technician performance report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateMaintenanceCalendar = async (
    startDate: string,
    endDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getMaintenanceCalendar(startDate, endDate);
      setError(null);
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate maintenance calendar report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (data: any[], filename: string) => {
    try {
      exportToCSV(data, filename);
      toast.success(`Report exported as ${filename}.csv`);
    } catch (err) {
      toast.error("Failed to export report");
      console.error("Export error:", err);
    }
  };

  return {
    loading,
    error,
    generateMaintenanceSummary,
    generateEquipmentPerformance,
    generateDepartmentAnalysis,
    generateTechnicianPerformance,
    generateMaintenanceCalendar,
    exportReport,
  };
}
