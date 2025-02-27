import React, { useState } from "react";
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
  PieChart,
  Search,
  Sliders,
} from "lucide-react";

interface MaintenanceRecord {
  id: string;
  taskTitle: string;
  equipment: string;
  department: string;
  completedDate: Date;
  duration: string;
  technician: string;
  status: "completed" | "cancelled" | "partial";
  notes?: string;
}

const ReportsHistory = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data for maintenance history
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: "1",
      taskTitle: "Routine Inspection",
      equipment: "HVAC System",
      department: "Facilities",
      completedDate: new Date(2023, 5, 15),
      duration: "2.5",
      technician: "John Doe",
      status: "completed",
      notes: "All systems functioning normally. Replaced air filters.",
    },
    {
      id: "2",
      taskTitle: "Oil Change",
      equipment: "CNC Machine #3",
      department: "Manufacturing",
      completedDate: new Date(2023, 5, 18),
      duration: "1.5",
      technician: "Jane Smith",
      status: "completed",
      notes: "Used synthetic oil as recommended by manufacturer.",
    },
    {
      id: "3",
      taskTitle: "Belt Replacement",
      equipment: "Conveyor Belt A",
      department: "Logistics",
      completedDate: new Date(2023, 5, 20),
      duration: "3",
      technician: "Robert Johnson",
      status: "partial",
      notes:
        "Replaced main belt, but tensioner needs replacement on next maintenance.",
    },
    {
      id: "4",
      taskTitle: "Cooling System Check",
      equipment: "Server Rack B",
      department: "IT",
      completedDate: new Date(2023, 5, 14),
      duration: "1",
      technician: "Emily Brown",
      status: "completed",
      notes: "Cooling system operating within normal parameters.",
    },
    {
      id: "5",
      taskTitle: "Battery Replacement",
      equipment: "Forklift #2",
      department: "Warehouse",
      completedDate: new Date(2023, 5, 22),
      duration: "2",
      technician: "John Doe",
      status: "cancelled",
      notes: "Cancelled due to forklift being in use for urgent shipment.",
    },
    {
      id: "6",
      taskTitle: "Software Update",
      equipment: "Production Control System",
      department: "Manufacturing",
      completedDate: new Date(2023, 5, 25),
      duration: "4",
      technician: "Emily Brown",
      status: "completed",
      notes: "Updated to version 3.5.2. All modules functioning correctly.",
    },
    {
      id: "7",
      taskTitle: "Safety Inspection",
      equipment: "Assembly Line B",
      department: "Manufacturing",
      completedDate: new Date(2023, 5, 28),
      duration: "5",
      technician: "Robert Johnson",
      status: "completed",
      notes:
        "All safety systems passed inspection. Updated emergency stop buttons.",
    },
  ];

  // Mock data for departments
  const departments = [
    "Manufacturing",
    "Logistics",
    "Facilities",
    "IT",
    "Warehouse",
  ];

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
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleExportData = () => {
    // In a real application, you would generate and download a CSV/Excel file
    console.log("Exporting maintenance history data");
  };

  const handleGenerateReport = (reportType: string) => {
    // In a real application, you would generate the specified report
    console.log(`Generating ${reportType} report`);
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
                              {departments.map((department) => (
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
                            {filteredRecords.length > 0 ? (
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Generate Reports</h2>
                  <p className="text-gray-500 mt-1">
                    Create and download various maintenance reports
                  </p>
                </div>

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
                      >
                        Generate Report
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
                      >
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Department Maintenance Report */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-500" />
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
                      >
                        Generate Report
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
                      >
                        Generate Report
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
                      >
                        Generate Report
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
                      >
                        Create Custom Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsHistory;
