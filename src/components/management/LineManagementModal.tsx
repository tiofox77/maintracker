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
import { useLines } from "../../lib/hooks";
import { Line, LineInsert, LineUpdate, getLineById } from "../../lib/api/lines";
import { toast } from "../../lib/utils/toast";

interface LineManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineId?: string | null;
}

export const LineManagementModal = ({
  open,
  onOpenChange,
  lineId = null,
}: LineManagementModalProps) => {
  // Form states
  const [lineName, setLineName] = useState("");
  const [lineDescription, setLineDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addLine, editLine } = useLines();

  // Fetch line data if editing
  useEffect(() => {
    const fetchLineData = async () => {
      if (lineId && open) {
        try {
          setLoading(true);
          const line = await getLineById(lineId);

          setLineName(line.name);
          setLineDescription(line.description || "");
        } catch (error) {
          console.error("Error fetching line:", error);
          toast.error("Failed to load line details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLineData();
  }, [lineId, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setLineName("");
    setLineDescription("");
  };

  const validateForm = () => {
    if (!lineName) {
      toast.error("Line name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (lineId) {
        // Update existing line
        const lineUpdate: LineUpdate = {
          name: lineName,
          description: lineDescription || null,
        };
        await editLine(lineId, lineUpdate);
        toast.success("Line updated successfully");
      } else {
        // Create new line
        const newLine: LineInsert = {
          name: lineName,
          description: lineDescription || null,
        };
        await addLine(newLine);
        toast.success("Line added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving line:", error);
      toast.error("Failed to save line");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lineId ? "Edit Line" : "Add New Line"}</DialogTitle>
          <DialogDescription>
            {lineId
              ? "Update the line details below."
              : "Fill in the details to create a new line."}
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
                <Label htmlFor="line-name">Line Name *</Label>
                <Input
                  id="line-name"
                  placeholder="Enter line name"
                  value={lineName}
                  onChange={(e) => setLineName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line-description">Description</Label>
                <textarea
                  id="line-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter line description"
                  value={lineDescription}
                  onChange={(e) => setLineDescription(e.target.value)}
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
                ) : lineId ? (
                  "Update Line"
                ) : (
                  "Add Line"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
