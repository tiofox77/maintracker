import { useState, useEffect } from "react";
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
} from "../api/equipment";
import { toast } from "../utils/toast";

export function useEquipment() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await getEquipment();
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = async (equipmentData: EquipmentInsert) => {
    try {
      const newEquipment = await createEquipment(equipmentData);
      // Refetch to get the joined data
      fetchEquipment();
      toast.success("Equipment added successfully");
      return newEquipment;
    } catch (err) {
      toast.error("Failed to add equipment");
      throw err;
    }
  };

  const editEquipment = async (id: string, equipmentData: EquipmentUpdate) => {
    try {
      const updatedEquipment = await updateEquipment(id, equipmentData);
      // Refetch to get the joined data
      fetchEquipment();
      toast.success("Equipment updated successfully");
      return updatedEquipment;
    } catch (err) {
      toast.error("Failed to update equipment");
      throw err;
    }
  };

  const removeEquipment = async (id: string) => {
    try {
      await deleteEquipment(id);
      setEquipment((prev) => prev.filter((equip) => equip.id !== id));
      toast.success("Equipment deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete equipment");
      throw err;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    fetchEquipment,
    addEquipment,
    editEquipment,
    removeEquipment,
  };
}
