import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  TaskMaintenance,
  TaskMaintenanceInsert,
  TaskMaintenanceUpdate,
} from "../../lib/api/taskMaintenance";
import { format } from "date-fns";
import { useEquipment } from "../../lib/hooks/useEquipment";
import { useAreas } from "../../lib/hooks/useAreas";
import { useLines } from "../../lib/hooks/useLines";
import { useTasks } from "../../lib/hooks/useTasks";
import { useUsers } from "../../lib/hooks/useUsers";
import { getUsersByRole } from "../../lib/api/users";

interface TaskCorrectiveModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  task: TaskMaintenance | null;
  onAddTask: (task: TaskMaintenanceInsert) => Promise<TaskMaintenance>;
  onEditTask: (
    id: string,
    task: TaskMaintenanceUpdate,
  ) => Promise<TaskMaintenance>;
}

const TaskCorrectiveModal: React.FC<TaskCorrectiveModalProps> = ({
  isOpen,
  onClose,
  task,
  onAddTask,
  onEditTask,
}) => {
  const [formData, setFormData] = useState<
    TaskMaintenanceInsert | TaskMaintenanceUpdate
  >({
    equipment_id: "",
    line_id: null,
    area_id: null,
    scheduled_date: format(new Date(), "yyyy-MM-dd"),
    frequency: null,
    custom_days: null,
    priority: "medium",
    status: "scheduled",
    type: "corrective",
    assigned_to: null,
    description: null,
    notes: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [technicianLoading, setTechnicianLoading] = useState(true);
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { areas, loading: areasLoading } = useAreas();
  const { lines, loading: linesLoading } = useLines();
  const { tasks: tasksList, loading: tasksLoading } = useTasks();

  useEffect(() => {
    if (task) {
      setFormData({
        equipment_id: task.equipment_id,
        line_id: task.line_id,
        area_id: task.area_id,
        scheduled_date: task.scheduled_date
          ? format(new Date(task.scheduled_date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        frequency: task.frequency,
        custom_days: task.custom_days,
        priority: task.priority,
        status: task.status,
        type: "corrective",
        assigned_to: task.assigned_to,
        description: task.description,
        notes: task.notes,
      });
    } else {
      setFormData({
        equipment_id: "",
        line_id: null,
        area_id: null,
        scheduled_date: format(new Date(), "yyyy-MM-dd"),
        frequency: null,
        custom_days: null,
        priority: "medium",
        status: "scheduled",
        type: "corrective",
        assigned_to: null,
        description: null,
        notes: null,
      });
    }
    setErrors({});
  }, [task]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setTechnicianLoading(true);
        const technicianUsers = await getUsersByRole("technician");
        setTechnicians(technicianUsers);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      } finally {
        setTechnicianLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipment_id) {
      newErrors.equipment_id = "Equipment is required";
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = "Scheduled date is required";
    }

    if (formData.frequency === "custom" && !formData.custom_days) {
      newErrors.custom_days =
        "Custom days is required when frequency is custom";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (task) {
        await onEditTask(task.id, formData);
      } else {
        await onAddTask(formData as TaskMaintenanceInsert);
      }
      onClose(true);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const isLoading =
    equipmentLoading ||
    areasLoading ||
    linesLoading ||
    tasksLoading ||
    technicianLoading;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {task
              ? "Edit Corrective Maintenance Task"
              : "Add Corrective Maintenance Task"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <p>Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment_id">Equipment *</Label>
                <Select
                  value={formData.equipment_id as string}
                  onValueChange={(value) => handleChange("equipment_id", value)}
                >
                  <SelectTrigger
                    id="equipment_id"
                    className={errors.equipment_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipment_id && (
                  <p className="text-red-500 text-xs">{errors.equipment_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_id">Area</Label>
                <Select
                  value={(formData.area_id as string) || "none"}
                  onValueChange={(value) =>
                    handleChange("area_id", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger id="area_id">
                    <SelectValue placeholder="Select area (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {areas.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="line_id">Line</Label>
                <Select
                  value={(formData.line_id as string) || "none"}
                  onValueChange={(value) =>
                    handleChange("line_id", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger id="line_id">
                    <SelectValue placeholder="Select line (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {lines.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Intervention Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date as string}
                  onChange={(e) =>
                    handleChange("scheduled_date", e.target.value)
                  }
                  className={errors.scheduled_date ? "border-red-500" : ""}
                />
                {errors.scheduled_date && (
                  <p className="text-red-500 text-xs">
                    {errors.scheduled_date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority as string}
                  onValueChange={(value) => handleChange("priority", value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status as string}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={(formData.assigned_to as string) || "none"}
                  onValueChange={(value) =>
                    handleChange("assigned_to", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger id="assigned_to">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.first_name} {tech.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  handleChange("description", e.target.value || null)
                }
                placeholder="Task description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value || null)}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit">
                {task ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskCorrectiveModal;
