import React, { useState, useEffect } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format } from "date-fns";
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  PieChart as PieChartIcon,
  Search,
  Sliders,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  PieChart,
  LineChart,
  MetricCard,
} from "../reports/ChartComponents";
import {
  useReports,
  useMaintenanceTasks,
  useEquipment,
  useDepartments,
} from "@/lib/hooks";
import { toast } from "../../lib/utils/toast";
import {
  CustomReportModal,
  CustomReportConfig,
} from "../reports/CustomReportModal";

interface MaintenanceRecord {
  id: string;
  taskTitle: string;
  equipment: string;
  department: string;
  completedDate: Date;
  duration: string;
  technician: string;
  status: "completed" | "cancelled" | "partial" | "scheduled" | "in-progress";
  notes?: string;
}

const ReportsHistory = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [customReportModalOpen, setCustomReportModalOpen] = useState(false);

  const { tasks, loading: tasksLoading } = useMaintenanceTasks();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);

  useEffect(() => {
    if (!tasksLoading && !equipmentLoading) {
      // Convert all tasks to maintenance records format
      const records = tasks.map((task) => {
        const equipmentItem = equipment.find((e) => e.id === task.equipment_id);
        const departmentName = equipmentItem?.departments?.name || "Unknown";

        return {
          id: task.id,
          taskTitle: task.title,
          equipment: equipmentItem?.name || "Unknown Equipment",
          department: departmentName,
          completedDate: task.completed_date
            ? new Date(task.completed_date)
            : new Date(task.scheduled_date || Date.now()),
          duration: task.actual_duration
            ? task.actual_duration.toString()
            : task.estimated_duration
              ? task.estimated_duration.toString()
              : "0",
          technician: task.assigned_to || "Unassigned",
          status: task.status as
            | "completed"
            | "cancelled"
            | "partial"
            | "scheduled"
            | "in-progress",
          notes: task.notes || "",
        };
      });

      setMaintenanceRecords(records);
    }
  }, [tasks, equipment, tasksLoading, equipmentLoading]);

  const { departments, loading: departmentsLoading } = useDepartments();
  const departmentNames = departments.map((dept) => dept.name);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter maintenance records based on search and filters
  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch =
      record.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || record.department === selectedDepartment;

    let matchesDateRange = true;
    const currentDate = new Date();
    const recordDate = new Date(record.completedDate);

    if (selectedDateRange === "last7days") {
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      matchesDateRange = recordDate >= sevenDaysAgo;
    } else if (selectedDateRange === "last30days") {
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      matchesDateRange = recordDate >= thirtyDaysAgo;
    } else if (selectedDateRange === "last90days") {
      const ninetyDaysAgo = new Date(currentDate);
      ninetyDaysAgo.setDate(currentDate.getDate() - 90);
      matchesDateRange = recordDate >= ninetyDaysAgo;
    }

    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;

    return (
      matchesSearch && matchesDepartment && matchesDateRange && matchesStatus
    );
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Partial
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            In Progress
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const { exportReport } = useReports();

  const handleExportData = () => {
    exportReport(filteredRecords, "maintenance-history");
  };

  const {
    generateMaintenanceSummary,
    generateEquipmentPerformance,
    generateDepartmentAnalysis,
    generateTechnicianPerformance,
    generateMaintenanceCalendar,
    generateCustomReport,
  } = useReports();
  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = async (reportType: string) => {
    setReportLoading(true);
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 90); // Last 90 days by default

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = today.toISOString().split("T")[0];

      let reportData;
      switch (reportType) {
        case "maintenance-summary":
          reportData = await generateMaintenanceSummary(
            startDateStr,
            endDateStr,
          );
          exportReport(reportData, "maintenance-summary");
          toast.success("Maintenance summary report generated successfully");
          break;
        case "equipment-performance":
          reportData = await generateEquipmentPerformance(
            startDateStr,
            endDateStr,
          );
          exportReport(reportData, "equipment-performance");
          toast.success("Equipment performance report generated successfully");
          break;
        case "department-analysis":
          reportData = await generateDepartmentAnalysis(
            startDateStr,
            endDateStr,
          );
          exportReport(reportData, "department-analysis");
          toast.success("Department analysis report generated successfully");
          break;
        case "technician-performance":
          reportData = await generateTechnicianPerformance(
            startDateStr,
            endDateStr,
          );
          exportReport(reportData, "technician-performance");
          toast.success("Technician performance report generated successfully");
          break;
        case "maintenance-calendar":
          reportData = await generateMaintenanceCalendar(
            startDateStr,
            endDateStr,
          );
          exportReport(reportData, "maintenance-calendar");
          toast.success("Maintenance calendar report generated successfully");
          break;
        case "custom":
          setCustomReportModalOpen(true);
          break;
        default:
          toast.info("Report generation will be available in a future update");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Reports & History"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
                <TabsTrigger value="history">Maintenance History</TabsTrigger>
                <TabsTrigger value="reports">Generate Reports</TabsTrigger>
              </TabsList>

              {/* Maintenance History Tab */}
              <TabsContent value="history" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Maintenance History</h2>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" /> Export Data
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search by task, equipment, or technician..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Select
                            value={selectedDepartment}
                            onValueChange={setSelectedDepartment}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Departments
                              </SelectItem>
                              {departmentNames.map((department) => (
                                <SelectItem key={department} value={department}>
                                  {department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedDateRange}
                            onValueChange={setSelectedDateRange}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="last7days">
                                Last 7 Days
                              </SelectItem>
                              <SelectItem value="last30days">
                                Last 30 Days
                              </SelectItem>
                              <SelectItem value="last90days">
                                Last 90 Days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="in-progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Maintenance History Table */}
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>Equipment</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Completed Date</TableHead>
                              <TableHead>Duration (hrs)</TableHead>
                              <TableHead>Technician</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasksLoading || equipmentLoading ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-10"
                                >
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading maintenance history...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : filteredRecords.length > 0 ? (
                              filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell className="font-medium">
                                    {record.taskTitle}
                                  </TableCell>
                                  <TableCell>{record.equipment}</TableCell>
                                  <TableCell>{record.department}</TableCell>
                                  <TableCell>
                                    {format(
                                      record.completedDate,
                                      "MMM d, yyyy",
                                    )}
                                  </TableCell>
                                  <TableCell>{record.duration}</TableCell>
                                  <TableCell>{record.technician}</TableCell>
                                  <TableCell>
                                    {getStatusBadge(record.status)}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-6 text-gray-500"
                                >
                                  No maintenance records found matching your
                                  criteria.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Generate Reports Tab */}
              <TabsContent value="reports" className="mt-6">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Generate Reports</h2>
                    <p className="text-gray-500 mt-1">
                      Create and download various maintenance reports
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      defaultValue="last30days"
                      onValueChange={(value) => {
                        // This would filter data based on the selected date range
                        console.log(`Selected date range: ${value}`);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7days">Last 7 days</SelectItem>
                        <SelectItem value="last30days">Last 30 days</SelectItem>
                        <SelectItem value="last90days">Last 90 days</SelectItem>
                        <SelectItem value="thisyear">This year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Export all reports data
                        const allReportsData = {
                          tasks: tasks,
                          equipment: equipment,
                          metrics: {
                            totalTasks: tasks.length,
                            completedTasks: tasks.filter(
                              (t) => t.status === "completed",
                            ).length,
                            completionRate:
                              tasks.length > 0
                                ? (tasks.filter((t) => t.status === "completed")
                                    .length /
                                    tasks.length) *
                                  100
                                : 0,
                            avgResolutionTime:
                              tasks.filter((t) => t.actual_duration).length > 0
                                ? tasks
                                    .filter((t) => t.actual_duration)
                                    .reduce(
                                      (sum, t) =>
                                        sum + (t.actual_duration || 0),
                                      0,
                                    ) /
                                  tasks.filter((t) => t.actual_duration).length
                                : 0,
                          },
                        };
                        exportReport(allReportsData, "all-reports-data");
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" /> Export All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {tasksLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                          <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-4 py-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <>
                      <MetricCard
                        title="Total Tasks"
                        value={tasks.length}
                        trend={tasks.length > 0 ? "up" : "neutral"}
                        trendValue={`${tasks.filter((t) => t.status === "completed").length} completed`}
                        icon={<FileText className="h-5 w-5" />}
                      />
                      <MetricCard
                        title="Completion Rate"
                        value={`${tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100) : 0}%`}
                        trend={
                          tasks.filter((t) => t.status === "completed").length >
                          tasks.filter((t) => t.status === "cancelled").length
                            ? "up"
                            : "down"
                        }
                        trendValue={`${tasks.filter((t) => t.status === "cancelled").length} cancelled`}
                        icon={<BarChart3 className="h-5 w-5" />}
                      />
                      <MetricCard
                        title="Avg. Resolution Time"
                        value={`${tasks.filter((t) => t.actual_duration).length > 0 ? (tasks.filter((t) => t.actual_duration).reduce((sum, t) => sum + (t.actual_duration || 0), 0) / tasks.filter((t) => t.actual_duration).length).toFixed(1) : 0} hrs`}
                        trend="neutral"
                        trendValue={`${tasks.filter((t) => t.actual_duration).length} tasks measured`}
                        icon={<Calendar className="h-5 w-5" />}
                      />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {tasksLoading ? (
                    <>
                      {[1, 2].map((i) => (
                        <Card key={i} className="p-6 h-[300px]">
                          <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-[250px] bg-gray-100 rounded"></div>
                          </div>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Maintenance Tasks by Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px] flex items-center justify-center">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left pb-2">Status</th>
                                  <th className="text-left pb-2">Count</th>
                                  <th className="text-left pb-2">Bar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  {
                                    label: "Completed",
                                    value: tasks.filter(
                                      (t) => t.status === "completed",
                                    ).length,
                                    color: "bg-green-500",
                                  },
                                  {
                                    label: "In Progress",
                                    value: tasks.filter(
                                      (t) => t.status === "in-progress",
                                    ).length,
                                    color: "bg-yellow-500",
                                  },
                                  {
                                    label: "Scheduled",
                                    value: tasks.filter(
                                      (t) => t.status === "scheduled",
                                    ).length,
                                    color: "bg-blue-500",
                                  },
                                  {
                                    label: "Cancelled",
                                    value: tasks.filter(
                                      (t) => t.status === "cancelled",
                                    ).length,
                                    color: "bg-red-500",
                                  },
                                  {
                                    label: "Partial",
                                    value: tasks.filter(
                                      (t) => t.status === "partial",
                                    ).length,
                                    color: "bg-purple-500",
                                  },
                                ].map((item, index) => {
                                  const maxValue = Math.max(
                                    tasks.filter(
                                      (t) => t.status === "completed",
                                    ).length,
                                    tasks.filter(
                                      (t) => t.status === "in-progress",
                                    ).length,
                                    tasks.filter(
                                      (t) => t.status === "scheduled",
                                    ).length,
                                    tasks.filter(
                                      (t) => t.status === "cancelled",
                                    ).length,
                                    tasks.filter((t) => t.status === "partial")
                                      .length,
                                    1,
                                  );
                                  const percentage =
                                    (item.value / maxValue) * 100;

                                  return (
                                    <tr key={index} className="h-12">
                                      <td className="font-medium">
                                        {item.label}
                                      </td>
                                      <td>{item.value}</td>
                                      <td className="w-1/2">
                                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${item.color} rounded-full`}
                                            style={{
                                              width: `${Math.max(percentage, 2)}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                      <PieChart
                        title="Tasks by Priority"
                        data={[
                          {
                            label: "Critical",
                            value: tasks.filter(
                              (t) => t.priority === "critical",
                            ).length,
                            color: "#ef4444",
                          },
                          {
                            label: "High",
                            value: tasks.filter((t) => t.priority === "high")
                              .length,
                            color: "#f97316",
                          },
                          {
                            label: "Medium",
                            value: tasks.filter((t) => t.priority === "medium")
                              .length,
                            color: "#3b82f6",
                          },
                          {
                            label: "Low",
                            value: tasks.filter((t) => t.priority === "low")
                              .length,
                            color: "#22c55e",
                          },
                        ]}
                      />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  {tasksLoading ? (
                    <Card className="p-6 h-[300px]">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-[250px] bg-gray-100 rounded"></div>
                      </div>
                    </Card>
                  ) : (
                    <LineChart
                      title="Maintenance Tasks Over Time"
                      data={(() => {
                        // Group tasks by month
                        const monthlyTasks = {};
                        const months = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ];

                        tasks.forEach((task) => {
                          if (task.scheduled_date) {
                            const date = new Date(task.scheduled_date);
                            const month = date.getMonth();
                            monthlyTasks[month] =
                              (monthlyTasks[month] || 0) + 1;
                          }
                        });

                        // Create data array for the last 6 months
                        const currentMonth = new Date().getMonth();
                        const data = [];

                        for (let i = 5; i >= 0; i--) {
                          const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
                          data.push({
                            label: months[monthIndex],
                            value: monthlyTasks[monthIndex] || 0,
                          });
                        }

                        return data;
                      })()}
                    />
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-4">Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Maintenance Summary Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Maintenance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Overview of all maintenance activities with completion
                        rates and time spent.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleGenerateReport("maintenance-summary")
                        }
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Equipment Performance Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        Equipment Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Analysis of equipment uptime, downtime, and maintenance
                        frequency.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleGenerateReport("equipment-performance")
                        }
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Department Maintenance Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-purple-500" />
                        Department Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Breakdown of maintenance activities and costs by
                        department.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleGenerateReport("department-analysis")
                        }
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Technician Performance Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-orange-500" />
                        Technician Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Evaluation of technician productivity, task completion,
                        and efficiency.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleGenerateReport("technician-performance")
                        }
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Maintenance Calendar Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-red-500" />
                        Maintenance Calendar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Calendar view of completed and upcoming maintenance
                        tasks.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleGenerateReport("maintenance-calendar")
                        }
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Custom Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        Custom Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm mb-4">
                        Create a customized report with specific parameters and
                        filters.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => handleGenerateReport("custom")}
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          "Create Custom Report"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Custom Report Modal */}
      <CustomReportModal
        open={customReportModalOpen}
        onOpenChange={setCustomReportModalOpen}
        loading={reportLoading}
        onGenerateReport={async (config: CustomReportConfig) => {
          try {
            setReportLoading(true);
            const reportData = await generateCustomReport(config);
            exportReport(reportData, `custom-report-${config.reportType}`);
            setCustomReportModalOpen(false);
            toast.success("Custom report generated successfully");
          } catch (error) {
            console.error("Error generating custom report:", error);
            toast.error("Failed to generate custom report");
          } finally {
            setReportLoading(false);
          }
        }}
      />
    </div>
  );
};

export default ReportsHistory;
