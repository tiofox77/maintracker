import React, { useState, useEffect } from "react";
import DashboardHeader from "../../dashboard/DashboardHeader";
import Sidebar from "../../layout/Sidebar";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Label } from "../../ui/label";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { toast } from "../../../lib/utils/toast";
import {
  useMaterialRequests,
  useSupplyChainDepartments,
} from "../../../lib/hooks";
import { MaterialRequest, MaterialRequestInsert } from "../../../lib/api";

const MaterialRequests = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaterialRequest | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    requester_name: "",
    department: "",
    request_date: "",
    notes: "",
    status: "pending" as const,
    items: [{ item_name: "", quantity: 1, unit: "pcs", description: "" }],
  });

  // Get departments from the hook
  const { departments } = useSupplyChainDepartments();

  // Use the custom hook for material requests
  const {
    materialRequests,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    setCurrentPage,
    fetchMaterialRequests,
    addMaterialRequest,
    editMaterialRequest,
    removeMaterialRequest,
    approveRequest,
    rejectRequest,
  } = useMaterialRequests({
    status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
    department: selectedDepartment !== "all" ? selectedDepartment : undefined,
    search: searchQuery || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
    autoFetch: true,
  });

  // Refetch when filters change
  useEffect(() => {
    fetchMaterialRequests();
  }, [
    fetchMaterialRequests,
    searchQuery,
    selectedStatus,
    selectedDepartment,
    dateRange,
  ]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle item changes in the form
  const handleItemChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "quantity" ? Number(value) : value,
    };
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Add a new item row
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { item_name: "", quantity: 1, unit: "pcs", description: "" },
      ],
    });
  };

  // Remove an item row
  const removeItemRow = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData({
        ...formData,
        items: updatedItems,
      });
    } else {
      toast.error("At least one item is required");
    }
  };

  // Handle create form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.requester_name ||
      !formData.department ||
      !formData.request_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.items.some((item) => !item.item_name || item.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    try {
      // Prepare data for API
      const newRequest: MaterialRequestInsert = {
        requester_name: formData.requester_name,
        department: formData.department,
        request_date: new Date(formData.request_date).toISOString(),
        status: "pending",
        notes: formData.notes || null,
        items: formData.items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description || null,
        })),
      };

      await addMaterialRequest(newRequest);
      setCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating material request:", error);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequest) return;

    // Validate form
    if (
      !formData.requester_name ||
      !formData.department ||
      !formData.request_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.items.some((item) => !item.item_name || item.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    try {
      // Update the material request
      await editMaterialRequest(selectedRequest.id, {
        requester_name: formData.requester_name,
        department: formData.department,
        request_date: new Date(formData.request_date).toISOString(),
        notes: formData.notes || null,
        status: formData.status,
      });

      // TODO: Handle updating items - this would require additional API calls
      // to update, add, or remove items as needed

      setEditModalOpen(false);
      resetForm();
      fetchMaterialRequests();
    } catch (error) {
      console.error("Error updating material request:", error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedRequest) return;

    try {
      await removeMaterialRequest(selectedRequest.id);
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting material request:", error);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      requester_name: "",
      department: "",
      request_date: "",
      notes: "",
      status: "pending",
      items: [{ item_name: "", quantity: 1, unit: "pcs", description: "" }],
    });
  };

  // Handle view request
  const handleViewRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  // Handle edit request
  const handleEditRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setFormData({
      requester_name: request.requester_name,
      department: request.department,
      request_date: new Date(request.request_date).toISOString().split("T")[0],
      notes: request.notes || "",
      status: request.status,
      items: request.items?.map((item) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        description: item.description || "",
      })) || [{ item_name: "", quantity: 1, unit: "pcs", description: "" }],
    });
    setEditModalOpen(true);
  };

  // Handle delete request
  const handleDeleteRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  // Handle approve request
  const handleApproveRequest = async (request: MaterialRequest) => {
    try {
      await approveRequest(request.id);
      setViewModalOpen(false);
      fetchMaterialRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (request: MaterialRequest) => {
    try {
      await rejectRequest(request.id);
      setViewModalOpen(false);
      fetchMaterialRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
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
          title="Material Requests"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Material Requests</h2>
              <Button
                onClick={() => {
                  resetForm();
                  setCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> New Request
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
                        placeholder="Search by ID or requester..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="start-date" className="text-xs">
                          Start Date
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={dateRange.start}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              start: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="end-date" className="text-xs">
                          End Date
                        </Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={dateRange.end}
                          onChange={(e) =>
                            setDateRange({ ...dateRange, end: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => setDateRange({ start: "", end: "" })}
                      >
                        Clear Dates
                      </Button>
                    </div>
                  </div>

                  {/* Material Requests Table */}
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Requester</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-10"
                            >
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-10 text-red-500"
                            >
                              <div className="flex justify-center items-center">
                                <span>
                                  Error loading requests. Please try again.
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : materialRequests.length > 0 ? (
                          materialRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.request_id}
                              </TableCell>
                              <TableCell>{request.requester_name}</TableCell>
                              <TableCell>{request.department}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(request.request_date),
                                  "MMM d, yyyy",
                                )}
                              </TableCell>
                              <TableCell>
                                {request.items?.length || 0} items
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(request.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewRequest(request)}
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditRequest(request)}
                                    title="Edit"
                                    disabled={request.status !== "pending"}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRequest(request)}
                                    title="Delete"
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
                              No material requests found matching your criteria.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalCount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalCount)} of{" "}
                        {totalCount} entries
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((number) => (
                          <Button
                            key={number}
                            variant={
                              currentPage === number ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Material Request Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Material Request</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new material request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester_name">Requester Name *</Label>
                  <Input
                    id="requester_name"
                    name="requester_name"
                    placeholder="Enter requester name"
                    value={formData.requester_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_date">Request Date *</Label>
                  <Input
                    id="request_date"
                    name="request_date"
                    type="date"
                    value={formData.request_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItemRow}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md"
                    >
                      <div className="col-span-4 space-y-1">
                        <Label
                          htmlFor={`item_name_${index}`}
                          className="text-xs"
                        >
                          Item Name *
                        </Label>
                        <Input
                          id={`item_name_${index}`}
                          placeholder="Enter item name"
                          value={item.item_name}
                          onChange={(e) =>
                            handleItemChange(index, "item_name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label
                          htmlFor={`quantity_${index}`}
                          className="text-xs"
                        >
                          Quantity *
                        </Label>
                        <Input
                          id={`quantity_${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor={`unit_${index}`} className="text-xs">
                          Unit *
                        </Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            handleItemChange(index, "unit", value)
                          }
                        >
                          <SelectTrigger id={`unit_${index}`}>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="liters">liters</SelectItem>
                            <SelectItem value="meters">meters</SelectItem>
                            <SelectItem value="rolls">rolls</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label
                          htmlFor={`description_${index}`}
                          className="text-xs"
                        >
                          Description
                        </Label>
                        <Input
                          id={`description_${index}`}
                          placeholder="Enter description"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemRow(index)}
                          disabled={formData.items.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Material Request Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Material Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="flex justify-between items-center mt-2">
                  <span>Request ID: {selectedRequest.request_id}</span>
                  {getStatusBadge(selectedRequest?.status)}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Requester
                  </h3>
                  <p>{selectedRequest.requester_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Department
                  </h3>
                  <p>{selectedRequest.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Request Date
                  </h3>
                  <p>
                    {format(
                      new Date(selectedRequest.request_date),
                      "MMMM d, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="capitalize">{selectedRequest.status}</p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Items
                </h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.items &&
                      selectedRequest.items.length > 0 ? (
                        selectedRequest.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>{item.description || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-4 text-gray-500"
                          >
                            No items found for this request.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => handleApproveRequest(selectedRequest)}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleRejectRequest(selectedRequest)}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Request Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Material Request</DialogTitle>
            <DialogDescription>
              Update the material request details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester_name">Requester Name *</Label>
                  <Input
                    id="requester_name"
                    name="requester_name"
                    placeholder="Enter requester name"
                    value={formData.requester_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_date">Request Date *</Label>
                  <Input
                    id="request_date"
                    name="request_date"
                    type="date"
                    value={formData.request_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "pending" | "approved" | "rejected",
                    ) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItemRow}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md"
                    >
                      <div className="col-span-4 space-y-1">
                        <Label
                          htmlFor={`item_name_${index}`}
                          className="text-xs"
                        >
                          Item Name *
                        </Label>
                        <Input
                          id={`item_name_${index}`}
                          placeholder="Enter item name"
                          value={item.item_name}
                          onChange={(e) =>
                            handleItemChange(index, "item_name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label
                          htmlFor={`quantity_${index}`}
                          className="text-xs"
                        >
                          Quantity *
                        </Label>
                        <Input
                          id={`quantity_${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor={`unit_${index}`} className="text-xs">
                          Unit *
                        </Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            handleItemChange(index, "unit", value)
                          }
                        >
                          <SelectTrigger id={`unit_${index}`}>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="liters">liters</SelectItem>
                            <SelectItem value="meters">meters</SelectItem>
                            <SelectItem value="rolls">rolls</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label
                          htmlFor={`description_${index}`}
                          className="text-xs"
                        >
                          Description
                        </Label>
                        <Input
                          id={`description_${index}`}
                          placeholder="Enter description"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemRow(index)}
                          disabled={formData.items.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Request"
                )}
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
              Are you sure you want to delete this request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              material request and all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaterialRequests;
