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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useCategories, useDepartments } from "../../lib/hooks";
import {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "../../lib/api/categories";
import {
  Department,
  DepartmentInsert,
  DepartmentUpdate,
} from "../../lib/api/departments";

const CategoryDepartment = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "category" | "department";
  } | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentLocation, setDepartmentLocation] = useState("");

  // Get categories and departments from hooks
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    addDepartment,
    editDepartment,
    removeDepartment,
  } = useDepartments();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      (category.description &&
        category.description
          .toLowerCase()
          .includes(categorySearchQuery.toLowerCase())),
  );

  // Filter departments based on search
  const filteredDepartments = departments.filter(
    (department) =>
      department.name
        .toLowerCase()
        .includes(departmentSearchQuery.toLowerCase()) ||
      (department.description &&
        department.description
          .toLowerCase()
          .includes(departmentSearchQuery.toLowerCase())) ||
      (department.location &&
        department.location
          .toLowerCase()
          .includes(departmentSearchQuery.toLowerCase())),
  );

  // Category CRUD operations
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setItemToDelete({ id, type: "category" });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (itemToDelete && itemToDelete.type === "category") {
      try {
        await removeCategory(itemToDelete.id);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedCategory) {
        // Update existing category
        const categoryUpdate: CategoryUpdate = {
          name: categoryName,
          description: categoryDescription,
        };
        await editCategory(selectedCategory.id, categoryUpdate);
      } else {
        // Create new category
        const newCategory: CategoryInsert = {
          name: categoryName,
          description: categoryDescription,
        };
        await addCategory(newCategory);
      }
      setCategoryModalOpen(false);
      setCategoryName("");
      setCategoryDescription("");
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Department CRUD operations
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setDepartmentName("");
    setDepartmentDescription("");
    setDepartmentLocation("");
    setDepartmentModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description || "");
    setDepartmentLocation(department.location || "");
    setDepartmentModalOpen(true);
  };

  const handleDeleteDepartment = (id: string) => {
    setItemToDelete({ id, type: "department" });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (itemToDelete && itemToDelete.type === "department") {
      try {
        await removeDepartment(itemToDelete.id);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    }
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedDepartment) {
        // Update existing department
        const departmentUpdate: DepartmentUpdate = {
          name: departmentName,
          description: departmentDescription,
          location: departmentLocation,
        };
        await editDepartment(selectedDepartment.id, departmentUpdate);
      } else {
        // Create new department
        const newDepartment: DepartmentInsert = {
          name: departmentName,
          description: departmentDescription,
          location: departmentLocation,
        };
        await addDepartment(newDepartment);
      }
      setDepartmentModalOpen(false);
      setDepartmentName("");
      setDepartmentDescription("");
      setDepartmentLocation("");
    } catch (error) {
      console.error("Error saving department:", error);
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
          title="Category & Department Management"
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
                <TabsTrigger value="categories">Areas</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              {/* Categories Tab */}
              <TabsContent value="categories" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Equipment Areas</h2>
                  <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" /> Add Area
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search areas..."
                          className="pl-10"
                          value={categorySearchQuery}
                          onChange={(e) =>
                            setCategorySearchQuery(e.target.value)
                          }
                        />
                      </div>

                      {/* Categories Table */}
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoriesLoading ? (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-center py-10"
                                >
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading areas...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : categoriesError ? (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-center py-6 text-red-500"
                                >
                                  Error loading areas. Please try again.
                                </TableCell>
                              </TableRow>
                            ) : filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                  <TableCell className="font-medium">
                                    {category.name}
                                  </TableCell>
                                  <TableCell>{category.description}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleEditCategory(category)
                                        }
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
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
                                  colSpan={3}
                                  className="text-center py-6 text-gray-500"
                                >
                                  No areas found matching your search.
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

              {/* Departments Tab */}
              <TabsContent value="departments" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Departments</h2>
                  <Button onClick={handleAddDepartment}>
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search departments..."
                          className="pl-10"
                          value={departmentSearchQuery}
                          onChange={(e) =>
                            setDepartmentSearchQuery(e.target.value)
                          }
                        />
                      </div>

                      {/* Departments Table */}
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {departmentsLoading ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-10"
                                >
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading departments...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : departmentsError ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-6 text-red-500"
                                >
                                  Error loading departments. Please try again.
                                </TableCell>
                              </TableRow>
                            ) : filteredDepartments.length > 0 ? (
                              filteredDepartments.map((department) => (
                                <TableRow key={department.id}>
                                  <TableCell className="font-medium">
                                    {department.name}
                                  </TableCell>
                                  <TableCell>
                                    {department.description}
                                  </TableCell>
                                  <TableCell>{department.location}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleEditDepartment(department)
                                        }
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleDeleteDepartment(department.id)
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
                                  colSpan={4}
                                  className="text-center py-6 text-gray-500"
                                >
                                  No departments found matching your search.
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
            </Tabs>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Area" : "Add New Area"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the area details below."
                : "Fill in the details to create a new area."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="category-name" className="text-sm font-medium">
                  Area Name
                </label>
                <Input
                  id="category-name"
                  placeholder="Enter area name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="category-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="category-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter area description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedCategory ? "Update Area" : "Add Area"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Department Modal */}
      <Dialog open={departmentModalOpen} onOpenChange={setDepartmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? "Edit Department" : "Add New Department"}
            </DialogTitle>
            <DialogDescription>
              {selectedDepartment
                ? "Update the department details below."
                : "Fill in the details to create a new department."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDepartmentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="department-name"
                  className="text-sm font-medium"
                >
                  Department Name
                </label>
                <Input
                  id="department-name"
                  placeholder="Enter department name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="department-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="department-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter department description"
                  value={departmentDescription}
                  onChange={(e) => setDepartmentDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="department-location"
                  className="text-sm font-medium"
                >
                  Location
                </label>
                <Input
                  id="department-location"
                  placeholder="Enter department location"
                  value={departmentLocation}
                  onChange={(e) => setDepartmentLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDepartmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedDepartment ? "Update Department" : "Add Department"}
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
              Are you sure you want to delete this {itemToDelete?.type}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {itemToDelete?.type}
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                itemToDelete?.type === "category"
                  ? confirmDeleteCategory()
                  : confirmDeleteDepartment()
              }
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

export default CategoryDepartment;
