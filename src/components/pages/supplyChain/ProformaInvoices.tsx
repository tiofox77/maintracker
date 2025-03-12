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
  Eye,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "../../../lib/utils/toast";
import {
  useProformaInvoices,
  useSupplyChainDepartments,
} from "../../../lib/hooks";
import { ProformaInvoice, ProformaInvoiceInsert } from "../../../lib/api";
import { getFilenameFromUrl } from "../../../lib/utils/fileUtils";

const ProformaInvoices = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<ProformaInvoice | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    supplier_name: "",
    invoice_number: "",
    total_amount: "",
    currency: "USD",
    issue_date: "",
    expiry_date: "",
    payment_status: "pending",
    document_url: "",
    notes: "",
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get departments from the hook
  const { departments } = useSupplyChainDepartments();

  // Use the custom hook for proforma invoices
  const {
    proformaInvoices,
    totalCount,
    currentPage: hookCurrentPage,
    pageSize,
    loading,
    error,
    setCurrentPage: setHookCurrentPage,
    fetchProformaInvoices,
    addProformaInvoice,
    editProformaInvoice,
    removeProformaInvoice,
    markAsPaid,
    cancelInvoice,
  } = useProformaInvoices({
    status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
    currency: selectedCurrency !== "all" ? selectedCurrency : undefined,
    search: searchQuery || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
    autoFetch: true,
  });

  // Refetch when filters change
  useEffect(() => {
    fetchProformaInvoices();
  }, [
    fetchProformaInvoices,
    searchQuery,
    selectedStatus,
    selectedCurrency,
    dateRange,
  ]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginate = (pageNumber) => setHookCurrentPage(pageNumber);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "total_amount" ? (value === "" ? "" : Number(value)) : value,
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }

      setSelectedFile(file);
      // Don't set document_url for the form data as it will be set after upload
      toast.success("File selected successfully");
    }
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.supplier_name ||
      !formData.invoice_number ||
      !formData.total_amount ||
      !formData.issue_date ||
      !formData.expiry_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUploading(true);

      // Prepare data for API
      const newInvoice: ProformaInvoiceInsert = {
        supplier_name: formData.supplier_name,
        invoice_number: formData.invoice_number,
        total_amount: Number(formData.total_amount),
        currency: formData.currency,
        issue_date: new Date(formData.issue_date).toISOString(),
        expiry_date: new Date(formData.expiry_date).toISOString(),
        payment_status: "pending",
        document_url: null, // Will be set by the API if a file is uploaded
        notes: formData.notes || null,
      };

      // Pass the selected file to the API function
      await addProformaInvoice(newInvoice, selectedFile || undefined);
      setCreateModalOpen(false);
      resetForm();
      setSelectedFile(null);
    } catch (error) {
      console.error("Error creating proforma invoice:", error);
      toast.error("Failed to create proforma invoice");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInvoice) return;

    // Validate form
    if (
      !formData.supplier_name ||
      !formData.invoice_number ||
      !formData.total_amount ||
      !formData.issue_date ||
      !formData.expiry_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUploading(true);

      // Update the proforma invoice
      const updateData = {
        supplier_name: formData.supplier_name,
        invoice_number: formData.invoice_number,
        total_amount: Number(formData.total_amount),
        currency: formData.currency,
        issue_date: new Date(formData.issue_date).toISOString(),
        expiry_date: new Date(formData.expiry_date).toISOString(),
        payment_status: formData.payment_status,
        notes: formData.notes || null,
      };

      // Only include document_url in the update if it's not from a selected file
      // (because the file will be uploaded separately)
      if (
        !selectedFile &&
        formData.document_url !== selectedInvoice.document_url
      ) {
        updateData["document_url"] = formData.document_url || null;
      }

      await editProformaInvoice(
        selectedInvoice.id,
        updateData,
        selectedFile || undefined,
      );

      setEditModalOpen(false);
      resetForm();
      setSelectedFile(null);
      fetchProformaInvoices();
    } catch (error) {
      console.error("Error updating proforma invoice:", error);
      toast.error("Failed to update proforma invoice");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;

    try {
      await removeProformaInvoice(selectedInvoice.id);
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Error deleting proforma invoice:", error);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      supplier_name: "",
      invoice_number: "",
      total_amount: "",
      currency: "USD",
      issue_date: "",
      expiry_date: "",
      payment_status: "pending",
      document_url: "",
      notes: "",
    });
    setSelectedFile(null);
  };

  // Handle view invoice
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  // Handle edit invoice
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      supplier_name: invoice.supplier_name,
      invoice_number: invoice.invoice_number,
      total_amount: invoice.total_amount,
      currency: invoice.currency,
      issue_date: invoice.issue_date,
      expiry_date: invoice.expiry_date,
      payment_status: invoice.payment_status,
      document_url: invoice.document_url || "",
      notes: invoice.notes || "",
    });
    setEditModalOpen(true);
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Proforma Invoices"
          onMenuToggle={handleToggleSidebar}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Proforma Invoices</h2>
              <Button
                onClick={() => {
                  resetForm();
                  setCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> New Invoice
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
                        placeholder="Search by ID, supplier, or invoice number..."
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
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Currencies</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
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
                          Issue Date From
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
                          Issue Date To
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

                  {/* Proforma Invoices Table */}
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-10"
                            >
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading invoices...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-10 text-red-500"
                            >
                              <div className="flex justify-center items-center">
                                <span>
                                  Error loading invoices. Please try again.
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : proformaInvoices.length > 0 ? (
                          proformaInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">
                                {invoice.pi_id}
                              </TableCell>
                              <TableCell>{invoice.supplier_name}</TableCell>
                              <TableCell>{invoice.invoice_number}</TableCell>
                              <TableCell>
                                {formatCurrency(
                                  invoice.total_amount,
                                  invoice.currency,
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(invoice.issue_date),
                                  "MMM d, yyyy",
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(invoice.expiry_date),
                                  "MMM d, yyyy",
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(invoice.payment_status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewInvoice(invoice)}
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditInvoice(invoice)}
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteInvoice(invoice)}
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
                              colSpan={8}
                              className="text-center py-6 text-gray-500"
                            >
                              No proforma invoices found matching your criteria.
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
                        Showing {(hookCurrentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(hookCurrentPage * pageSize, totalCount)} of{" "}
                        {totalCount} entries
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(hookCurrentPage - 1)}
                          disabled={hookCurrentPage === 1}
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
                              hookCurrentPage === number ? "default" : "outline"
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
                          onClick={() => paginate(hookCurrentPage + 1)}
                          disabled={hookCurrentPage === totalPages}
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

      {/* Create Proforma Invoice Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Proforma Invoice</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new proforma invoice.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <Input
                    id="supplier_name"
                    name="supplier_name"
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input
                    id="invoice_number"
                    name="invoice_number"
                    placeholder="Enter invoice number"
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount *</Label>
                  <Input
                    id="total_amount"
                    name="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter total amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                    required
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date *</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Payment Status *</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_status: value })
                    }
                    required
                  >
                    <SelectTrigger id="payment_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Invoice Document</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={handleFileUpload}
                    />
                    {selectedFile && (
                      <div className="text-xs text-green-600">
                        Selected file: {selectedFile.name} (
                        {Math.round(selectedFile.size / 1024)} KB)
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </div>
                  </div>
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

              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={loading || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isUploading}>
                {loading || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isUploading ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Create Invoice"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Proforma Invoice Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Proforma Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <div className="flex justify-between items-center mt-2">
                  <span>Invoice ID: {selectedInvoice.pi_id}</span>
                  {getStatusBadge(selectedInvoice?.payment_status)}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Supplier
                  </h3>
                  <p>{selectedInvoice.supplier_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Invoice Number
                  </h3>
                  <p>{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Amount
                  </h3>
                  <p>
                    {formatCurrency(
                      selectedInvoice.total_amount,
                      selectedInvoice.currency,
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Currency
                  </h3>
                  <p>{selectedInvoice.currency}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Issue Date
                  </h3>
                  <p>
                    {format(
                      new Date(selectedInvoice.issue_date),
                      "MMMM d, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Expiry Date
                  </h3>
                  <p>
                    {format(
                      new Date(selectedInvoice.expiry_date),
                      "MMMM d, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Payment Status
                  </h3>
                  <p className="capitalize">{selectedInvoice.payment_status}</p>
                </div>
                {selectedInvoice.document_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Document
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        window.open(selectedInvoice.document_url, "_blank")
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />{" "}
                      {getFilenameFromUrl(selectedInvoice.document_url)}
                    </Button>
                  </div>
                )}
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}

              {selectedInvoice.payment_status === "pending" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        await markAsPaid(selectedInvoice.id);
                        setViewModalOpen(false);
                        fetchProformaInvoices();
                      } catch (error) {
                        console.error("Error marking invoice as paid:", error);
                      }
                    }}
                  >
                    Mark as Paid
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={async () => {
                      try {
                        await cancelInvoice(selectedInvoice.id);
                        setViewModalOpen(false);
                        fetchProformaInvoices();
                      } catch (error) {
                        console.error("Error canceling invoice:", error);
                      }
                    }}
                  >
                    Cancel Invoice
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

      {/* Edit Proforma Invoice Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Proforma Invoice</DialogTitle>
            <DialogDescription>
              Update the proforma invoice details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <Input
                    id="supplier_name"
                    name="supplier_name"
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input
                    id="invoice_number"
                    name="invoice_number"
                    placeholder="Enter invoice number"
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount *</Label>
                  <Input
                    id="total_amount"
                    name="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter total amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                    required
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date *</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Payment Status *</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_status: value })
                    }
                    required
                  >
                    <SelectTrigger id="payment_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Invoice Document</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={handleFileUpload}
                    />
                    {selectedFile && (
                      <div className="text-xs text-green-600">
                        Selected file: {selectedFile.name} (
                        {Math.round(selectedFile.size / 1024)} KB)
                      </div>
                    )}
                    {formData.document_url && !selectedFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">
                          Current file:{" "}
                          {getFilenameFromUrl(formData.document_url)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(formData.document_url, "_blank")
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </div>
                  </div>
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

              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={loading || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isUploading}>
                {loading || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isUploading ? "Uploading..." : "Updating..."}
                  </>
                ) : (
                  "Update Invoice"
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
              Are you sure you want to delete this invoice?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              proforma invoice from the system.
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

export default ProformaInvoices;
