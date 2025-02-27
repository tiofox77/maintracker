import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
import { Search, Plus, Filter, Edit, Trash2, Download } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  department: string;
  status: "operational" | "maintenance" | "out-of-service";
  lastMaintenance: string;
  nextMaintenance: string;
}

interface EquipmentManagementModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EquipmentManagementModal = ({
  open = true,
  onOpenChange,
}: EquipmentManagementModalProps) => {
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [selectedDepartment, setSelectedDepartment] =
    useState("all-departments");
  const [selectedStatus, setSelectedStatus] = useState("all-statuses");

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
    },
    {
      id: "2",
      name: "Conveyor Belt A",
      category: "Production",
      department: "Assembly",
      status: "maintenance",
      lastMaintenance: "2023-11-05",
      nextMaintenance: "2023-12-05",
    },
    {
      id: "3",
      name: "HVAC System",
      category: "Facility",
      department: "Building Services",
      status: "operational",
      lastMaintenance: "2023-09-20",
      nextMaintenance: "2024-03-20",
    },
    {
      id: "4",
      name: "Forklift #2",
      category: "Transportation",
      department: "Warehouse",
      status: "out-of-service",
      lastMaintenance: "2023-08-10",
      nextMaintenance: "2023-11-10",
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
    "Administration",
  ];
  const statuses = ["operational", "maintenance", "out-of-service"];

  // Filter equipment based on search and filters
  const filteredEquipment = equipmentList.filter((equipment) => {
    const matchesSearch = equipment.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all-categories" ||
      equipment.category === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "all-departments" ||
      equipment.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all-statuses" || equipment.status === selectedStatus;

    return (
      matchesSearch && matchesCategory && matchesDepartment && matchesStatus
    );
  });

  const handleAddNewEquipment = () => {
    setActiveTab("add");
  };

  const handleEditEquipment = (id: string) => {
    // In a real application, you would fetch the equipment details and populate the form
    setActiveTab("add");
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
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "out-of-service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">
            Equipment Management
          </DialogTitle>
          <DialogDescription>
            View, add, edit, and manage equipment across all departments.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Equipment List</TabsTrigger>
              <TabsTrigger value="add">Add/Edit Equipment</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Search equipment..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleAddNewEquipment}>
                    <Plus size={16} className="mr-2" />
                    Add Equipment
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-48">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-categories">
                            All Categories
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48">
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-departments">
                            All Departments
                          </SelectItem>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48">
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-statuses">
                            All Statuses
                          </SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
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
                          <TableCell>{equipment.category}</TableCell>
                          <TableCell>{equipment.department}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(equipment.status)}
                            >
                              {equipment.status.charAt(0).toUpperCase() +
                                equipment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{equipment.lastMaintenance}</TableCell>
                          <TableCell>{equipment.nextMaintenance}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleEditEquipment(equipment.id)
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
                          colSpan={7}
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
          </TabsContent>

          <TabsContent value="add" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Equipment Name
                      </label>
                      <Input id="name" placeholder="Enter equipment name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="serial" className="text-sm font-medium">
                        Serial Number
                      </label>
                      <Input id="serial" placeholder="Enter serial number" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="department"
                        className="text-sm font-medium"
                      >
                        Department
                      </label>
                      <Select>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="purchase-date"
                        className="text-sm font-medium"
                      >
                        Purchase Date
                      </label>
                      <Input id="purchase-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <Select>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last-maintenance"
                        className="text-sm font-medium"
                      >
                        Last Maintenance Date
                      </label>
                      <Input id="last-maintenance" type="date" />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="next-maintenance"
                        className="text-sm font-medium"
                      >
                        Next Maintenance Date
                      </label>
                      <Input id="next-maintenance" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      placeholder="Enter any additional notes about this equipment"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 border-t bg-gray-50">
          {activeTab === "list" ? (
            <Button
              variant="outline"
              onClick={() => onOpenChange && onOpenChange(false)}
            >
              Close
            </Button>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setActiveTab("list")}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Save as Draft
                </Button>
                <Button>Save Equipment</Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentManagementModal;
