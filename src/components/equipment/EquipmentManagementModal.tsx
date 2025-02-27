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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEquipment, useCategories, useDepartments } from "../../lib/hooks";
import {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
  getEquipmentById,
} from "../../lib/api/equipment";
import { toast } from "../../lib/utils/toast";

interface EquipmentManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string | null;
}

export const EquipmentManagementModal = ({
  open,
  onOpenChange,
  equipmentId = null,
}: EquipmentManagementModalProps) => {
  // Form states
  const [equipmentName, setEquipmentName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<
    "operational" | "maintenance" | "out-of-service"
  >("operational");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addEquipment, editEquipment } = useEquipment();
  const { categories, loading: categoriesLoading } = useCategories();
  const { departments, loading: departmentsLoading } = useDepartments();

  // Fetch equipment data if editing
  useEffect(() => {
    const fetchEquipmentData = async () => {
      if (equipmentId && open) {
        try {
          setLoading(true);
          const equipment = await getEquipmentById(equipmentId);

          setEquipmentName(equipment.name);
          setSerialNumber(equipment.serial_number || "");
          setCategoryId(equipment.category_id);
          setDepartmentId(equipment.department_id);
          setStatus(equipment.status);
          setPurchaseDate(equipment.purchase_date || "");
          setLastMaintenance(equipment.last_maintenance || "");
          setNextMaintenance(equipment.next_maintenance || "");
          setNotes(equipment.notes || "");
        } catch (error) {
          console.error("Error fetching equipment:", error);
          toast.error("Failed to load equipment details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEquipmentData();
  }, [equipmentId, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setEquipmentName("");
    setSerialNumber("");
    setCategoryId("");
    setDepartmentId("");
    setStatus("operational");
    setPurchaseDate("");
    setLastMaintenance("");
    setNextMaintenance("");
    setNotes("");
  };

  const validateForm = () => {
    if (!equipmentName) {
      toast.error("Equipment name is required");
      return false;
    }
    if (!categoryId) {
      toast.error("Category is required");
      return false;
    }
    if (!departmentId) {
      toast.error("Department is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (equipmentId) {
        // Update existing equipment
        const equipmentUpdate: EquipmentUpdate = {
          name: equipmentName,
          serial_number: serialNumber || null,
          category_id: categoryId,
          department_id: departmentId,
          status: status,
          purchase_date: purchaseDate || null,
          last_maintenance: lastMaintenance || null,
          next_maintenance: nextMaintenance || null,
          notes: notes || null,
        };
        await editEquipment(equipmentId, equipmentUpdate);
        toast.success("Equipment updated successfully");
      } else {
        // Create new equipment
        const newEquipment: EquipmentInsert = {
          name: equipmentName,
          serial_number: serialNumber || null,
          category_id: categoryId,
          department_id: departmentId,
          status: status,
          purchase_date: purchaseDate || null,
          last_maintenance: lastMaintenance || null,
          next_maintenance: nextMaintenance || null,
          notes: notes || null,
        };
        await addEquipment(newEquipment);
        toast.success("Equipment added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("Failed to save equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {equipmentId ? "Edit Equipment" : "Add New Equipment"}
          </DialogTitle>
          <DialogDescription>
            {equipmentId
              ? "Update the equipment details below."
              : "Fill in the details to add new equipment."}
          </DialogDescription>
        </DialogHeader>

        {loading && !categories.length ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment-name">Equipment Name *</Label>
                  <Input
                    id="equipment-name"
                    placeholder="Enter equipment name"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial-number">Serial Number</Label>
                  <Input
                    id="serial-number"
                    placeholder="Enter serial number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={departmentId}
                    onValueChange={setDepartmentId}
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading departments...
                        </SelectItem>
                      ) : departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled>
                          No departments available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(
                      value: "operational" | "maintenance" | "out-of-service",
                    ) => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-service">
                        Out of Service
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase Date</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-maintenance">
                    Last Maintenance Date
                  </Label>
                  <Input
                    id="last-maintenance"
                    type="date"
                    value={lastMaintenance}
                    onChange={(e) => setLastMaintenance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-maintenance">
                    Next Maintenance Date
                  </Label>
                  <Input
                    id="next-maintenance"
                    type="date"
                    value={nextMaintenance}
                    onChange={(e) => setNextMaintenance(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Enter any additional notes about this equipment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                ) : equipmentId ? (
                  "Update Equipment"
                ) : (
                  "Add Equipment"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
