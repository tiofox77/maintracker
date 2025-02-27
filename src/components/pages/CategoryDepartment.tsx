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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  equipmentCount: number;
}

interface Department {
  id: string;
  name: string;
  description: string;
  location: string;
  equipmentCount: number;
}

const CategoryDepartment = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Mock data for categories
  const categories: Category[] = [
    {
      id: "1",
      name: "Production",
      description: "Equipment used in production processes",
      equipmentCount: 25,
    },
    {
      id: "2",
      name: "Facility",
      description: "Building infrastructure and systems",
      equipmentCount: 18,
    },
    {
      id: "3",
      name: "Transportation",
      description: "Vehicles and material handling equipment",
      equipmentCount: 12,
    },
    {
      id: "4",
      name: "IT",
      description: "Computing and networking equipment",
      equipmentCount: 30,
    },
    {
      id: "5",
      name: "Office",
      description: "Office equipment and furniture",
      equipmentCount: 45,
    },
  ];

  // Mock data for departments
  const departments: Department[] = [
    {
      id: "1",
      name: "Manufacturing",
      description: "Main production department",
      location: "Building A, Floor 1",
      equipmentCount: 35,
    },
    {
      id: "2",
      name: "Assembly",
      description: "Final product assembly",
      location: "Building A, Floor 2",
      equipmentCount: 22,
    },
    {
      id: "3",
      name: "Building Services",
      description: "Facility maintenance and operations",
      location: "Building B, Floor 1",
      equipmentCount: 15,
    },
    {
      id: "4",
      name: "Warehouse",
      description: "Storage and logistics",
      location: "Building C",
      equipmentCount: 18,
    },
    {
      id: "5",
      name: "IT Services",
      description: "Information technology support",
      location: "Building B, Floor 2",
      equipmentCount: 28,
    },
    {
      id: "6",
      name: "Administration",
      description: "Administrative offices",
      location: "Building D",
      equipmentCount: 40,
    },
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      category.description
        .toLowerCase()
        .includes(categorySearchQuery.toLowerCase()),
  );

  // Filter departments based on search
  const filteredDepartments = departments.filter(
    (department) =>
      department.name
        .toLowerCase()
        .includes(departmentSearchQuery.toLowerCase()) ||
      department.description
        .toLowerCase()
        .includes(departmentSearchQuery.toLowerCase()) ||
      department.location
        .toLowerCase()
        .includes(departmentSearchQuery.toLowerCase()),
  );

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    // In a real application, you would show a confirmation dialog and delete the category
    console.log(`Delete category with ID: ${id}`);
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setDepartmentModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setDepartmentModalOpen(true);
  };

  const handleDeleteDepartment = (id: string) => {
    // In a real application, you would show a confirmation dialog and delete the department
    console.log(`Delete department with ID: ${id}`);
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
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              {/* Categories Tab */}
              <TabsContent value="categories" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Equipment Categories</h2>
                  <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search categories..."
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
                              <TableHead>Equipment Count</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                  <TableCell className="font-medium">
                                    {category.name}
                                  </TableCell>
                                  <TableCell>{category.description}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {category.equipmentCount}
                                    </Badge>
                                  </TableCell>
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
                                  colSpan={4}
                                  className="text-center py-6 text-gray-500"
                                >
                                  No categories found matching your search.
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
                              <TableHead>Equipment Count</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDepartments.length > 0 ? (
                              filteredDepartments.map((department) => (
                                <TableRow key={department.id}>
                                  <TableCell className="font-medium">
                                    {department.name}
                                  </TableCell>
                                  <TableCell>
                                    {department.description}
                                  </TableCell>
                                  <TableCell>{department.location}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {department.equipmentCount}
                                    </Badge>
                                  </TableCell>
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
                                  colSpan={5}
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
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the category details below."
                : "Fill in the details to create a new category."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="category-name"
                placeholder="Enter category name"
                defaultValue={selectedCategory?.name || ""}
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
                placeholder="Enter category description"
                defaultValue={selectedCategory?.description || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedCategory ? "Update Category" : "Add Category"}
            </Button>
          </DialogFooter>
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="department-name" className="text-sm font-medium">
                Department Name
              </label>
              <Input
                id="department-name"
                placeholder="Enter department name"
                defaultValue={selectedDepartment?.name || ""}
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
                defaultValue={selectedDepartment?.description || ""}
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
                defaultValue={selectedDepartment?.location || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepartmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedDepartment ? "Update Department" : "Add Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryDepartment;
