import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCategories } from "../../lib/hooks";
import {
  Category,
  CategoryInsert,
  CategoryUpdate,
  getCategoryById,
} from "../../lib/api/categories";
import { toast } from "../../lib/utils/toast";

interface CategoryManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string | null;
}

export const CategoryManagementModal = ({
  open,
  onOpenChange,
  categoryId = null,
}: CategoryManagementModalProps) => {
  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addCategory, editCategory } = useCategories();

  // Fetch category data if editing
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (categoryId && open) {
        try {
          setLoading(true);
          const category = await getCategoryById(categoryId);

          setCategoryName(category.name);
          setCategoryDescription(category.description || "");
        } catch (error) {
          console.error("Error fetching category:", error);
          toast.error("Failed to load category details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategoryData();
  }, [categoryId, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
  };

  const validateForm = () => {
    if (!categoryName) {
      toast.error("Category name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (categoryId) {
        // Update existing category
        const categoryUpdate: CategoryUpdate = {
          name: categoryName,
          description: categoryDescription || null,
        };
        await editCategory(categoryId, categoryUpdate);
        toast.success("Category updated successfully");
      } else {
        // Create new category
        const newCategory: CategoryInsert = {
          name: categoryName,
          description: categoryDescription || null,
        };
        await addCategory(newCategory);
        toast.success("Category added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {categoryId
              ? "Update the category details below."
              : "Fill in the details to create a new category."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <textarea
                  id="category-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">* Required fields</div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : categoryId ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
