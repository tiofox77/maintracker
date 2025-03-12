import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "../../lib/utils/toast";

interface CustomReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: (reportConfig: CustomReportConfig) => Promise<void>;
  loading: boolean;
}

export interface CustomReportConfig {
  title: string;
  startDate: string;
  endDate: string;
  reportType: string;
  includeFields: string[];
  filterBy: {
    department?: string;
    status?: string;
    priority?: string;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const CustomReportModal = ({
  open,
  onOpenChange,
  onGenerateReport,
  loading,
}: CustomReportModalProps) => {
  const today = new Date().toISOString().split("T")[0];
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString().split("T")[0];

  const [reportConfig, setReportConfig] = useState<CustomReportConfig>({
    title: "Custom Report",
    startDate: threeMonthsAgoStr,
    endDate: today,
    reportType: "maintenance",
    includeFields: ["title", "equipment", "status", "date", "department"],
    filterBy: {},
    sortBy: "date",
    sortOrder: "desc",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportConfig.title) {
      toast.error("Please enter a report title");
      return;
    }
    if (!reportConfig.startDate || !reportConfig.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(reportConfig.startDate) > new Date(reportConfig.endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }
    if (reportConfig.includeFields.length === 0) {
      toast.error("Please select at least one field to include");
      return;
    }

    try {
      await onGenerateReport(reportConfig);
    } catch (error) {
      console.error("Error generating custom report:", error);
    }
  };

  const toggleField = (field: string) => {
    setReportConfig((prev) => {
      if (prev.includeFields.includes(field)) {
        return {
          ...prev,
          includeFields: prev.includeFields.filter((f) => f !== field),
        };
      } else {
        return {
          ...prev,
          includeFields: [...prev.includeFields, field],
        };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
          <DialogDescription>
            Configure your custom report parameters and filters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input
              id="report-title"
              value={reportConfig.title}
              onChange={(e) =>
                setReportConfig({ ...reportConfig, title: e.target.value })
              }
              placeholder="Enter report title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportConfig.reportType}
              onValueChange={(value) =>
                setReportConfig({ ...reportConfig, reportType: value })
              }
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance Tasks</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Include Fields</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-title"
                  checked={reportConfig.includeFields.includes("title")}
                  onCheckedChange={() => toggleField("title")}
                />
                <label
                  htmlFor="field-title"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Title/Name
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-equipment"
                  checked={reportConfig.includeFields.includes("equipment")}
                  onCheckedChange={() => toggleField("equipment")}
                />
                <label
                  htmlFor="field-equipment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Equipment
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-status"
                  checked={reportConfig.includeFields.includes("status")}
                  onCheckedChange={() => toggleField("status")}
                />
                <label
                  htmlFor="field-status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Status
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-date"
                  checked={reportConfig.includeFields.includes("date")}
                  onCheckedChange={() => toggleField("date")}
                />
                <label
                  htmlFor="field-date"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Date
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-department"
                  checked={reportConfig.includeFields.includes("department")}
                  onCheckedChange={() => toggleField("department")}
                />
                <label
                  htmlFor="field-department"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Department
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-priority"
                  checked={reportConfig.includeFields.includes("priority")}
                  onCheckedChange={() => toggleField("priority")}
                />
                <label
                  htmlFor="field-priority"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Priority
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-technician"
                  checked={reportConfig.includeFields.includes("technician")}
                  onCheckedChange={() => toggleField("technician")}
                />
                <label
                  htmlFor="field-technician"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Technician
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-duration"
                  checked={reportConfig.includeFields.includes("duration")}
                  onCheckedChange={() => toggleField("duration")}
                />
                <label
                  htmlFor="field-duration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Duration
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-department">Filter by Department</Label>
              <Select
                value={reportConfig.filterBy.department || ""}
                onValueChange={(value) =>
                  setReportConfig({
                    ...reportConfig,
                    filterBy: { ...reportConfig.filterBy, department: value },
                  })
                }
              >
                <SelectTrigger id="filter-department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select
                value={reportConfig.filterBy.status || ""}
                onValueChange={(value) =>
                  setReportConfig({
                    ...reportConfig,
                    filterBy: { ...reportConfig.filterBy, status: value },
                  })
                }
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select
                value={reportConfig.sortBy}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, sortBy: value })
                }
              >
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Select field to sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title/Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select
                value={reportConfig.sortOrder}
                onValueChange={(value: "asc" | "desc") =>
                  setReportConfig({ ...reportConfig, sortOrder: value })
                }
              >
                <SelectTrigger id="sort-order">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
