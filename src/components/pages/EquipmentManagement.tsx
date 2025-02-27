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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Download, Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useEquipment, useCategories, useDepartments } from "../../lib/hooks";
import {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
} from "../../lib/api/equipment";
import { Label } from "../ui/label";

const EquipmentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(
    null,
  );

  // Form states
  const [equipmentName, setEquipmentName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<
    "operational" | "maintenance" | "out-of-service"
  >("operational");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [notes, setNotes] = useState("");

  // Get equipment, categories, and departments from hooks
  const {
    equipment,
    loading: equipmentLoading,
    error: equipmentError,
    addEquipment,
    editEquipment,
    removeEquipment,
  } = useEquipment();

  const { categories, loading: categoriesLoading } = useCategories();
  const { departments, loading: departmentsLoading } = useDepartments();

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter((equip) => {
    const matchesSearch =
      equip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (equip.serial_number &&
        equip.serial_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || equip.category_id === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "all" ||
      equip.department_id === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || equip.status === selectedStatus;

    return (
      matchesSearch && matchesCategory && matchesDepartment && matchesStatus
    );
  });

  // Equipment CRUD operations
  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEditEquipment = (equip: Equipment) => {
    setSelectedEquipment(equip);
    setEquipmentName(equip.name);
    setSerialNumber(equip.serial_number || "");
    setCategoryId(equip.category_id);
    setDepartmentId(equip.department_id);
    setStatus(equip.status);
    setPurchaseDate(equip.purchase_date || "");
    setLastMaintenance(equip.last_maintenance || "");
    setNextMaintenance(equip.next_maintenance || "");
    setNotes(equip.notes || "");
    setModalOpen(true);
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEquipment = async () => {
    if (equipmentToDelete) {
      try {
        await removeEquipment(equipmentToDelete);
        setDeleteDialogOpen(false);
        setEquipmentToDelete(null);
      } catch (error) {
        console.error("Error deleting equipment:", error);
      }
    }
  };

  const resetForm = () => {
    setEquipmentName("");
    setSerialNumber("");
    setCategoryId("");
    setDepartmentId("");
    setStatus("operational");
    setPurchaseDate("");
    setLastMaintenance("");
    setNextMaintenance("");
    setNotes("");
  };

  const validateForm = () => {
    if (!equipmentName) {
      alert("Equipment name is required");
      return false;
    }
    if (!categoryId) {
      alert("Category is required");
      return false;
    }
    if (!departmentId) {
      alert("Department is required");
      return false;
    }
    return true;
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (selectedEquipment) {
        // Update existing equipment
        const equipmentUpdate: EquipmentUpdate = {
          name: equipmentName,
          serial_number: serialNumber,
          category_id: categoryId,
          department_id: departmentId,
          status: status,
          purchase_date: purchaseDate || null,
          last_maintenance: lastMaintenance || null,
          next_maintenance: nextMaintenance || null,
          notes: notes,
        };
        await editEquipment(selectedEquipment.id, equipmentUpdate);
      } else {
        // Create new equipment
        const newEquipment: EquipmentInsert = {
          name: equipmentName,
          serial_number: serialNumber,
          category_id: categoryId,
          department_id: departmentId,
          status: status,
          purchase_date: purchaseDate || null,
          last_maintenance: lastMaintenance || null,
          next_maintenance: nextMaintenance || null,
          notes: notes,
        };
        await addEquipment(newEquipment);
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const handleExportData = () => {
    // In a real application, you would generate and download a CSV/Excel file
    console.log("Exporting equipment data");
    alert("Export functionality would be implemented here");
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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "Unknown Department";
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
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              {department.name}
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
                          <SelectItem value="operational">
                            Operational
                          </SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="out-of-service">
                            Out of Service
                          </SelectItem>
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
                        {equipmentLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-10"
                            >
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading equipment...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : equipmentError ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-6 text-red-500"
                            >
                              Error loading equipment. Please try again.
                            </TableCell>
                          </TableRow>
                        ) : filteredEquipment.length > 0 ? (
                          filteredEquipment.map((equip) => (
                            <TableRow key={equip.id}>
                              <TableCell className="font-medium">
                                {equip.name}
                              </TableCell>
                              <TableCell>{equip.serial_number}</TableCell>
                              <TableCell>
                                {getCategoryName(equip.category_id)}
                              </TableCell>
                              <TableCell>
                                {getDepartmentName(equip.department_id)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadgeColor(equip.status)}
                              </TableCell>
                              <TableCell>{equip.last_maintenance}</TableCell>
                              <TableCell>{equip.next_maintenance}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditEquipment(equip)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteEquipment(equip.id)
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

      {/* Equipment Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEquipment ? "Edit Equipment" : "Add New Equipment"}
            </DialogTitle>
            <DialogDescription>
              {selectedEquipment
                ? "Update the equipment details below."
                : "Fill in the details to add new equipment."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEquipmentSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment-name">Equipment Name *</Label>
                  <Input
                    id="equipment-name"
                    placeholder="Enter equipment name"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial-number">Serial Number</Label>
                  <Input
                    id="serial-number"
                    placeholder="Enter serial number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={departmentId}
                    onValueChange={setDepartmentId}
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading departments...
                        </SelectItem>
                      ) : (
                        departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(
                      value: "operational" | "maintenance" | "out-of-service",
                    ) => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-service">
                        Out of Service
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase Date</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-maintenance">
                    Last Maintenance Date
                  </Label>
                  <Input
                    id="last-maintenance"
                    type="date"
                    value={lastMaintenance}
                    onChange={(e) => setLastMaintenance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-maintenance">
                    Next Maintenance Date
                  </Label>
                  <Input
                    id="next-maintenance"
                    type="date"
                    value={nextMaintenance}
                    onChange={(e) => setNextMaintenance(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter any additional notes about this equipment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedEquipment ? "Update Equipment" : "Add Equipment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this equipment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              equipment and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEquipment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EquipmentManagement;
