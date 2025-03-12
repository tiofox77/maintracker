import { useState, useCallback } from "react";
import {
  getMaintenanceSummary,
  getEquipmentPerformance,
  getDepartmentAnalysis,
  getTechnicianPerformance,
  getMaintenanceCalendar,
  exportToCSV,
} from "../api/reports";
import { toast } from "../utils/toast";
import { CustomReportConfig } from "@/components/reports/CustomReportModal";

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Export any data as CSV
  const exportReport = useCallback((data: any, filename: string) => {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("No data to export");
      }

      // If data is not an array, convert it to an array of one object
      const dataArray = Array.isArray(data) ? data : [data];

      // For complex nested objects, flatten them for CSV export
      const flattenedData = dataArray.map((item) => {
        const flatItem = { ...item };

        // Handle nested objects by converting them to string representation
        Object.keys(flatItem).forEach((key) => {
          if (typeof flatItem[key] === "object" && flatItem[key] !== null) {
            flatItem[key] = JSON.stringify(flatItem[key]);
          }
        });

        return flatItem;
      });

      exportToCSV(flattenedData, filename);
      return true;
    } catch (err) {
      console.error("Error exporting report:", err);
      setError(err as Error);
      return false;
    }
  }, []);

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

  const generateCustomReport = async (config: CustomReportConfig) => {
    try {
      setLoading(true);
      // Mock implementation since getCustomReport is not available
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock data based on config
      const mockData = [
        {
          id: "custom-001",
          title: "Custom Report Item 1",
          equipment: config.filterBy.department
            ? `Equipment in ${config.filterBy.department}`
            : "Various Equipment",
          department: config.filterBy.department || "All Departments",
          status: config.filterBy.status || "mixed",
          date: config.startDate,
          priority: "medium",
          technician: "Various",
          duration: 2.5,
        },
        {
          id: "custom-002",
          title: "Custom Report Item 2",
          equipment: "Multiple Units",
          department: config.filterBy.department || "All Departments",
          status: config.filterBy.status || "mixed",
          date: config.endDate,
          priority: "high",
          technician: "Team",
          duration: 4.0,
        },
      ];

      // Filter fields to include only those specified
      const filteredData = mockData.map((item) => {
        const filteredItem = {};
        config.includeFields.forEach((field) => {
          filteredItem[field] = item[field];
        });
        return filteredItem;
      });

      setError(null);
      return filteredData;
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to generate custom report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    exportReport,
    generateMaintenanceSummary,
    generateEquipmentPerformance,
    generateDepartmentAnalysis,
    generateTechnicianPerformance,
    generateMaintenanceCalendar,
    generateCustomReport,
  };
}
