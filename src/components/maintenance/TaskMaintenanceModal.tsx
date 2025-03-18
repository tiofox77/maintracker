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
import {
  useTaskMaintenance,
  useEquipment,
  useLines,
  useAreas,
  useTasks,
} from "../../lib/hooks";
import {
  TaskMaintenance,
  TaskMaintenanceInsert,
  TaskMaintenanceUpdate,
  getTaskMaintenanceById,
} from "../../lib/api/taskMaintenance";
import { toast } from "../../lib/utils/toast";

interface TaskMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskMaintenanceId?: string | null;
  mode?: "create" | "edit" | "complete";
}

export const TaskMaintenanceModal = ({
  open,
  onOpenChange,
  taskMaintenanceId: initialTaskId = null,
  mode = "create",
}: TaskMaintenanceModalProps) => {
  // Form states
  const [taskId, setTaskId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [lineId, setLineId] = useState("");
  const [type, setType] = useState<"predictive" | "corrective" | "conditional">(
    "corrective",
  );
  const [areaId, setAreaId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [frequency, setFrequency] = useState<
    "custom" | "weekly" | "monthly" | "yearly" | ""
  >("");
  const [customDays, setCustomDays] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [status, setStatus] = useState<
    "scheduled" | "in-progress" | "completed" | "cancelled" | "partial"
  >("scheduled");
  const [assignedTo, setAssignedTo] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addTask, editTask, completeTask } = useTaskMaintenance();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { lines, loading: linesLoading } = useLines();
  const { areas, loading: areasLoading } = useAreas();
  const { tasks, loading: tasksLoading } = useTasks();

  // Fetch task data if editing or completing
  useEffect(() => {
    const fetchTaskData = async () => {
      if (initialTaskId && open) {
        try {
          setLoading(true);
          const task = await getTaskMaintenanceById(initialTaskId);

          if (mode === "complete") {
            // Only set minimal data for completion
            setEquipmentId(task.equipment_id);
            setTaskId(task.task_id || "");
            setNotes("");
          } else {
            // Set all data for editing
            setTaskId(task.task_id || "");
            setEquipmentId(task.equipment_id);
            setLineId(task.line_id || "");
            setType(task.type || "corrective");
            setAreaId(task.area_id || "");
            setScheduledDate(task.scheduled_date || "");
            setFrequency(task.frequency || "");
            setCustomDays(task.custom_days ? task.custom_days.toString() : "");
            setPriority(task.priority || "medium");
            setStatus(task.status || "scheduled");
            setAssignedTo(task.assigned_to || "");
            setDescription(task.description || "");
            setNotes(task.notes || "");
          }
        } catch (error) {
          console.error("Error fetching task:", error);
          toast.error("Failed to load task details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTaskData();
  }, [initialTaskId, open, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setTaskId("");
    setEquipmentId("");
    setLineId("");
    setAreaId("");
    setScheduledDate("");
    setFrequency("");
    setCustomDays("");
    setPriority("medium");
    setStatus("scheduled");
    setAssignedTo("");
    setDescription("");
    setNotes("");
    setType("corrective");
  };

  const validateForm = () => {
    if (mode === "complete") {
      return true;
    }

    if (!equipmentId) {
      toast.error("Equipment is required");
      return false;
    }
    if (!scheduledDate) {
      toast.error("Scheduled date is required");
      return false;
    }
    if (!type) {
      toast.error("Maintenance type is required");
      return false;
    }
    if (frequency === "custom" && !customDays) {
      toast.error("Custom days is required when frequency is custom");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (mode === "complete" && initialTaskId) {
        // Complete task
        await completeTask(initialTaskId, notes);
        toast.success("Task completed successfully");
      } else if (initialTaskId) {
        // Update existing task
        const taskUpdate: TaskMaintenanceUpdate = {
          task_id: taskId || null,
          equipment_id: equipmentId,
          line_id: lineId || null,
          area_id: areaId || null,
          type: type,
          scheduled_date: scheduledDate,
          frequency: frequency || null,
          custom_days: customDays ? parseInt(customDays) : null,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          description: description || null,
          notes: notes || null,
        };
        await editTask(initialTaskId, taskUpdate);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const newTask: TaskMaintenanceInsert = {
          task_id: taskId || null,
          equipment_id: equipmentId,
          line_id: lineId || null,
          area_id: areaId || null,
          type: type,
          scheduled_date: scheduledDate,
          frequency: frequency || null,
          custom_days: customDays ? parseInt(customDays) : null,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          description: description || null,
          notes: notes || null,
        };
        await addTask(newTask);
        toast.success("Task scheduled successfully");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  // Handle equipment selection to auto-select its area and line
  const handleEquipmentChange = (value: string) => {
    setEquipmentId(value);
    const selectedEquipment = equipment.find((e) => e.id === value);
    if (selectedEquipment) {
      setLineId(selectedEquipment.category_id || "");
      setAreaId(selectedEquipment.department_id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          mode === "complete" ? "sm:max-w-[500px]" : "sm:max-w-[800px]"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "complete"
              ? "Complete Maintenance Task"
              : mode === "edit"
                ? "Edit Maintenance Task"
                : "Schedule New Maintenance Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "complete"
              ? "Enter any completion notes."
              : mode === "edit"
                ? "Update the maintenance task details below."
                : "Fill in the details to schedule a new maintenance task."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === "complete" ? (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="completion-notes">Completion Notes</Label>
                  <textarea
                    id="completion-notes"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Enter any notes about the completed work"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task">Task</Label>
                    <Select value={taskId} onValueChange={setTaskId}>
                      <SelectTrigger id="task">
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasksLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading tasks...
                          </SelectItem>
                        ) : tasks.length > 0 ? (
                          tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-tasks" disabled>
                            No tasks available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment *</Label>
                    <Select
                      value={equipmentId}
                      onValueChange={handleEquipmentChange}
                      required
                    >
                      <SelectTrigger id="equipment">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading equipment...
                          </SelectItem>
                        ) : equipment.length > 0 ? (
                          equipment.map((equip) => (
                            <SelectItem key={equip.id} value={equip.id}>
                              {equip.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-equipment" disabled>
                            No equipment available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line">Line</Label>
                    <Select value={lineId} onValueChange={setLineId}>
                      <SelectTrigger id="line">
                        <SelectValue placeholder="Select line" />
                      </SelectTrigger>
                      <SelectContent>
                        {linesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading lines...
                          </SelectItem>
                        ) : lines.length > 0 ? (
                          lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-lines" disabled>
                            No lines available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Select value={areaId} onValueChange={setAreaId}>
                      <SelectTrigger id="area">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areasLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading areas...
                          </SelectItem>
                        ) : areas.length > 0 ? (
                          areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-areas" disabled>
                            No areas available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {frequency === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-days">Custom Days</Label>
                      <Input
                        id="custom-days"
                        type="number"
                        min="1"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="Enter number of days"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
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
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
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
                    <Label htmlFor="type">Type *</Label>
                    <Select value={type} onValueChange={setType} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="predictive">Predictive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned-to">Assigned To</Label>
                    <Input
                      id="assigned-to"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Enter assignee name"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      rows={3}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {mode === "complete"
                  ? "Complete Task"
                  : mode === "edit"
                    ? "Update Task"
                    : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
