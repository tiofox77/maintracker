import { useState, useEffect } from "react";
import {
  getLines,
  createLine,
  updateLine,
  deleteLine,
  Line,
  LineInsert,
  LineUpdate,
} from "../api/lines";
import { toast } from "../utils/toast";

export function useLines() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLines = async () => {
    try {
      setLoading(true);
      const data = await getLines();
      setLines(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load lines");
      console.error("Error in fetchLines:", err);
    } finally {
      setLoading(false);
    }
  };

  const addLine = async (line: LineInsert) => {
    try {
      const newLine = await createLine(line);
      setLines((prev) => [...prev, newLine]);
      toast.success("Line added successfully");
      return newLine;
    } catch (err) {
      toast.error("Failed to add line");
      console.error("Error in addLine:", err);
      throw err;
    }
  };

  const editLine = async (id: string, line: LineUpdate) => {
    try {
      const updatedLine = await updateLine(id, line);
      setLines((prev) => prev.map((l) => (l.id === id ? updatedLine : l)));
      toast.success("Line updated successfully");
      return updatedLine;
    } catch (err) {
      toast.error("Failed to update line");
      console.error("Error in editLine:", err);
      throw err;
    }
  };

  const removeLine = async (id: string) => {
    try {
      await deleteLine(id);
      setLines((prev) => prev.filter((l) => l.id !== id));
      toast.success("Line deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete line");
      console.error("Error in removeLine:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  return {
    lines,
    loading,
    error,
    fetchLines,
    addLine,
    editLine,
    removeLine,
  };
}
