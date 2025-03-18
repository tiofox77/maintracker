import { useState, useEffect } from "react";
import {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
  Area,
  AreaInsert,
  AreaUpdate,
} from "../api/areas";
import { toast } from "../utils/toast";

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAreas();
      setAreas(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load areas");
      console.error("Error in fetchAreas:", err);
    } finally {
      setLoading(false);
    }
  };

  const addArea = async (area: AreaInsert) => {
    try {
      const newArea = await createArea(area);
      setAreas((prev) => [...prev, newArea]);
      toast.success("Area added successfully");
      return newArea;
    } catch (err) {
      toast.error("Failed to add area");
      console.error("Error in addArea:", err);
      throw err;
    }
  };

  const editArea = async (id: string, area: AreaUpdate) => {
    try {
      const updatedArea = await updateArea(id, area);
      setAreas((prev) => prev.map((a) => (a.id === id ? updatedArea : a)));
      toast.success("Area updated successfully");
      return updatedArea;
    } catch (err) {
      toast.error("Failed to update area");
      console.error("Error in editArea:", err);
      throw err;
    }
  };

  const removeArea = async (id: string) => {
    try {
      await deleteArea(id);
      setAreas((prev) => prev.filter((a) => a.id !== id));
      toast.success("Area deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete area");
      console.error("Error in removeArea:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return {
    areas,
    loading,
    error,
    fetchAreas,
    addArea,
    editArea,
    removeArea,
  };
}
