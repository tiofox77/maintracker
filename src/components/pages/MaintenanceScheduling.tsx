import React, { useState } from "react";
import { format } from "date-fns";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../layout/Sidebar";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import MaintenanceSchedulingModal from "../maintenance/MaintenanceSchedulingModal";

interface MaintenanceTask {
  id: string;
  title: string;
  equipment: string;
  department: string;
  scheduledDate: Date;
  estimatedDuration: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  assignedTo: string;
}

const MaintenanceScheduling = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Mock data for maintenance tasks
  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: "1",
      title: "Routine Inspection",
      equipment: "HVAC System",
      department: "Facilities",
      scheduledDate: new Date(2023, 5, 15),
      estimatedDuration: "2",
      priority: "medium",
      status: "scheduled",
      assignedTo: "John Doe",
    },
    {
      id: "2",
      title: "Oil Change",
      equipment: "CNC Machine #3",
      department: "Manufacturing",
      scheduledDate: new Date(2023, 5, 18),
      estimatedDuration: "1.5",
      priority: "high",
      status: "scheduled",
      assignedTo: "Jane Smith",
    },
    {
      id: "3",
      title: "Belt Replacement",
      equipment: "Conveyor Belt A",
      department: "Logistics",
      scheduledDate: new Date(2023, 5, 20),
      estimatedDuration: "3",
      priority: "high",
      status: "in-progress",
      assignedTo: "Robert Johnson",
    },
    {
      id: "4",
      title: "Cooling System Check",
      equipment: "Server Rack B",
      department: "IT",
      scheduledDate: new Date(2023, 5, 14),
      estimatedDuration: "1",
      priority: "medium",
      status: "completed",
      assignedTo: "Emily Brown",
    },
    {
      id: "5",
      title: "Battery Replacement",
      equipment: "Forklift #2",
      department: "Warehouse",
      scheduledDate: new Date(2023, 5, 22),
      estimatedDuration: "2",
      priority: "low",
      status: "scheduled",
      assignedTo: "John Doe",
    },
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter tasks based on search query, selected date, priority, and status
  const filteredTasks = maintenanceTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.equipment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = selectedDate
      ? task.scheduledDate.toDateString() === selectedDate.toDateString()
      : true;

    const matchesPriority =
      selectedPriority === "all" || task.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    return matchesSearch && matchesDate && matchesPriority && matchesStatus;
  });

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            High
          </Badge>
        );
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
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
          title="Maintenance Scheduling"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  {selectedDate && (
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium">
                        Selected: {format(selectedDate, "PPP")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Maintenance Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search tasks..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={selectedPriority}
                          onValueChange={setSelectedPriority}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Equipment</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                  {task.title}
                                </TableCell>
                                <TableCell>{task.equipment}</TableCell>
                                <TableCell>{task.department}</TableCell>
                                <TableCell>
                                  {format(task.scheduledDate, "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>
                                  {task.estimatedDuration} hrs
                                </TableCell>
                                <TableCell>
                                  {getPriorityBadge(task.priority)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(task.status)}
                                </TableCell>
                                <TableCell>{task.assignedTo}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center py-6 text-gray-500"
                              >
                                No maintenance tasks found matching your
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
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Scheduling Modal */}
      <MaintenanceSchedulingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSchedule={(data) => {
          console.log("New maintenance task:", data);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default MaintenanceScheduling;
