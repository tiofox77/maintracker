import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "../api/categories";
import { toast } from "../utils/toast";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load categories");
      console.error("Error in fetchCategories:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: CategoryInsert) => {
    try {
      const newCategory = await createCategory(category);
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category added successfully");
      return newCategory;
    } catch (err) {
      toast.error("Failed to add category");
      console.error("Error in addCategory:", err);
      throw err;
    }
  };

  const editCategory = async (id: string, category: CategoryUpdate) => {
    try {
      const updatedCategory = await updateCategory(id, category);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat)),
      );
      toast.success("Category updated successfully");
      return updatedCategory;
    } catch (err) {
      toast.error("Failed to update category");
      console.error("Error in editCategory:", err);
      throw err;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete category");
      console.error("Error in removeCategory:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}
