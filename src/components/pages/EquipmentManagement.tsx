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
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import EquipmentManagementModal from "../equipment/EquipmentManagementModal";

interface Equipment {
  id: string;
  name: string;
  category: string;
  department: string;
  status: "operational" | "maintenance" | "out-of-service";
  lastMaintenance: string;
  nextMaintenance: string;
  purchaseDate: string;
  serialNumber: string;
}

const EquipmentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  // Mock data for equipment list
  const equipmentList: Equipment[] = [
    {
      id: "1",
      name: "Industrial Mixer",
      category: "Production",
      department: "Manufacturing",
      status: "operational",
      lastMaintenance: "2023-10-15",
      nextMaintenance: "2024-01-15",
      purchaseDate: "2020-05-10",
      serialNumber: "MIX-2020-001",
    },
    {
      id: "2",
      name: "Conveyor Belt A",
      category: "Production",
      department: "Assembly",
      status: "maintenance",
      lastMaintenance: "2023-11-05",
      nextMaintenance: "2023-12-05",
      purchaseDate: "2019-08-22",
      serialNumber: "CONV-2019-A",
    },
    {
      id: "3",
      name: "HVAC System",
      category: "Facility",
      department: "Building Services",
      status: "operational",
      lastMaintenance: "2023-09-20",
      nextMaintenance: "2024-03-20",
      purchaseDate: "2021-01-15",
      serialNumber: "HVAC-2021-003",
    },
    {
      id: "4",
      name: "Forklift #2",
      category: "Transportation",
      department: "Warehouse",
      status: "out-of-service",
      lastMaintenance: "2023-08-10",
      nextMaintenance: "2023-11-10",
      purchaseDate: "2018-11-30",
      serialNumber: "FL-2018-002",
    },
    {
      id: "5",
      name: "CNC Machine #3",
      category: "Production",
      department: "Manufacturing",
      status: "operational",
      lastMaintenance: "2023-10-25",
      nextMaintenance: "2024-01-25",
      purchaseDate: "2022-03-18",
      serialNumber: "CNC-2022-003",
    },
    {
      id: "6",
      name: "Server Rack B",
      category: "IT",
      department: "IT Services",
      status: "operational",
      lastMaintenance: "2023-11-01",
      nextMaintenance: "2024-02-01",
      purchaseDate: "2021-07-12",
      serialNumber: "SRV-2021-B",
    },
  ];

  // Mock data for categories and departments
  const categories = [
    "Production",
    "Facility",
    "Transportation",
    "IT",
    "Office",
  ];
  const departments = [
    "Manufacturing",
    "Assembly",
    "Building Services",
    "Warehouse",
    "IT Services",
    "Administration",
  ];
  const statuses = ["operational", "maintenance", "out-of-service"];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter equipment based on search and filters
  const filteredEquipment = equipmentList.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || equipment.category === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "all" ||
      equipment.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || equipment.status === selectedStatus;

    return (
      matchesSearch && matchesCategory && matchesDepartment && matchesStatus
    );
  });

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setModalOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalOpen(true);
  };

  const handleDeleteEquipment = (id: string) => {
    // In a real application, you would show a confirmation dialog and delete the equipment
    console.log(`Delete equipment with ID: ${id}`);
  };

  const handleExportData = () => {
    // In a real application, you would generate and download a CSV/Excel file
    console.log("Exporting equipment data");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Operational
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Maintenance
          </Badge>
        );
      case "out-of-service":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Out of Service
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
          title="Equipment Management"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Equipment Inventory</h2>
              <Button onClick={handleAddEquipment}>
                <Plus className="mr-2 h-4 w-4" /> Add Equipment
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
                        placeholder="Search by name or serial number..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
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
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Equipment Table */}
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Maintenance</TableHead>
                          <TableHead>Next Maintenance</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEquipment.length > 0 ? (
                          filteredEquipment.map((equipment) => (
                            <TableRow key={equipment.id}>
                              <TableCell className="font-medium">
                                {equipment.name}
                              </TableCell>
                              <TableCell>{equipment.serialNumber}</TableCell>
                              <TableCell>{equipment.category}</TableCell>
                              <TableCell>{equipment.department}</TableCell>
                              <TableCell>
                                {getStatusBadgeColor(equipment.status)}
                              </TableCell>
                              <TableCell>{equipment.lastMaintenance}</TableCell>
                              <TableCell>{equipment.nextMaintenance}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleEditEquipment(equipment)
                                    }
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteEquipment(equipment.id)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-6 text-gray-500"
                            >
                              No equipment found matching your filters.
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

      {/* Equipment Management Modal */}
      <EquipmentManagementModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default EquipmentManagement;
