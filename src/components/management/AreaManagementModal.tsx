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
import { useAreas } from "../../lib/hooks";
import { Area, AreaInsert, AreaUpdate, getAreaById } from "../../lib/api/areas";
import { toast } from "../../lib/utils/toast";

interface AreaManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId?: string | null;
}

export const AreaManagementModal = ({
  open,
  onOpenChange,
  areaId = null,
}: AreaManagementModalProps) => {
  // Form states
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");
  const [areaLocation, setAreaLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addArea, editArea } = useAreas();

  // Fetch area data if editing
  useEffect(() => {
    const fetchAreaData = async () => {
      if (areaId && open) {
        try {
          setLoading(true);
          const area = await getAreaById(areaId);

          setAreaName(area.name);
          setAreaDescription(area.description || "");
          setAreaLocation(area.location || "");
        } catch (error) {
          console.error("Error fetching area:", error);
          toast.error("Failed to load area details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAreaData();
  }, [areaId, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setAreaName("");
    setAreaDescription("");
    setAreaLocation("");
  };

  const validateForm = () => {
    if (!areaName) {
      toast.error("Area name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (areaId) {
        // Update existing area
        const areaUpdate: AreaUpdate = {
          name: areaName,
          description: areaDescription || null,
          location: areaLocation || null,
        };
        await editArea(areaId, areaUpdate);
        toast.success("Area updated successfully");
      } else {
        // Create new area
        const newArea: AreaInsert = {
          name: areaName,
          description: areaDescription || null,
          location: areaLocation || null,
        };
        await addArea(newArea);
        toast.success("Area added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving area:", error);
      toast.error("Failed to save area");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{areaId ? "Edit Area" : "Add New Area"}</DialogTitle>
          <DialogDescription>
            {areaId
              ? "Update the area details below."
              : "Fill in the details to create a new area."}
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
                <Label htmlFor="area-name">Area Name *</Label>
                <Input
                  id="area-name"
                  placeholder="Enter area name"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area-description">Description</Label>
                <textarea
                  id="area-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter area description"
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area-location">Location</Label>
                <Input
                  id="area-location"
                  placeholder="Enter area location"
                  value={areaLocation}
                  onChange={(e) => setAreaLocation(e.target.value)}
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
                ) : areaId ? (
                  "Update Area"
                ) : (
                  "Add Area"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
