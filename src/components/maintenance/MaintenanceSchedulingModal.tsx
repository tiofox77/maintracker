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
  useMaintenanceTasks,
  useEquipment,
  useLines,
  useAreas,
  useTasks,
} from "../../lib/hooks";
import {
  MaintenanceTask,
  MaintenanceTaskInsert,
  MaintenanceTaskUpdate,
  getMaintenanceTaskById,
} from "../../lib/api/maintenance";
import { toast } from "../../lib/utils/toast";

interface MaintenanceSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceTaskId?: string | null;
  mode?: "create" | "edit" | "complete";
}

export const MaintenanceSchedulingModal = ({
  open,
  onOpenChange,
  maintenanceTaskId: initialTaskId = null,
  mode = "create",
}: MaintenanceSchedulingModalProps) => {
  // Form states
  const [taskId, setTaskId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [lineId, setLineId] = useState("");
  const [type, setType] = useState<"predictive" | "corrective" | "conditional">(
    "corrective",
  );
  const [areaId, setAreaId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [status, setStatus] = useState<
    "scheduled" | "in-progress" | "completed" | "cancelled" | "partial"
  >("scheduled");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Get data from hooks
  const { addTask, editTask, completeTask } = useMaintenanceTasks();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { lines, loading: linesLoading } = useLines();
  const { areas, loading: areasLoading } = useAreas();
  const { tasks, loading: tasksListLoading } = useTasks();

  // Fetch task data if editing or completing
  useEffect(() => {
    const fetchTaskData = async () => {
      if (initialTaskId && open) {
        try {
          setLoading(true);
          const task = await getMaintenanceTaskById(initialTaskId);

          if (mode === "complete") {
            // Only set minimal data for completion
            setTaskTitle(task.title);
            setEquipmentId(task.equipment_id);
            setNotes("");
            setActualDuration("");
          } else {
            // Set all data for editing
            setTaskId(task.task_id || "");
            setTaskTitle(task.title);
            setTaskDescription(task.description || "");
            setEquipmentId(task.equipment_id);
            setLineId(task.category_id || "");
            setType(task.type || "corrective");

            // Get department ID from equipment
            const equipmentItem = equipment.find(
              (e) => e.id === task.equipment_id,
            );
            if (equipmentItem) {
              setAreaId(equipmentItem.department_id);
            }

            setScheduledDate(task.scheduled_date || "");
            setEstimatedDuration(
              task.estimated_duration ? task.estimated_duration.toString() : "",
            );
            setPriority(task.priority || "medium");
            setStatus(task.status || "scheduled");
            setAssignedTo(task.assigned_to || "");
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
  }, [initialTaskId, open, mode, equipment]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Update task title when tasks are loaded
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const selectedTask = tasks.find((task) => task.id === taskId);
      if (selectedTask) {
        setTaskTitle(selectedTask.name);
        setTaskDescription(selectedTask.description || "");
      }
    }
  }, [taskId, tasks]);

  const resetForm = () => {
    setTaskId("");
    setTaskTitle("");
    setTaskDescription("");
    setEquipmentId("");
    setLineId("");
    setAreaId("");
    setScheduledDate("");
    setEstimatedDuration("");
    setActualDuration("");
    setPriority("medium");
    setStatus("scheduled");
    setAssignedTo("");
    setNotes("");
    setType("corrective");
  };

  const validateForm = () => {
    if (mode === "complete") {
      if (!actualDuration) {
        toast.error("Actual duration is required");
        return false;
      }
      return true;
    }

    if (!taskId) {
      toast.error("Task selection is required");
      return false;
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (mode === "complete" && initialTaskId) {
        // Complete task
        await completeTask(initialTaskId, parseFloat(actualDuration), notes);
        toast.success("Task completed successfully");
      } else if (initialTaskId) {
        // Update existing task
        const taskUpdate: MaintenanceTaskUpdate = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          category_id: lineId,
          task_id: taskId || null,
          type: type,
          scheduled_date: scheduledDate,
          estimated_duration: estimatedDuration
            ? parseFloat(estimatedDuration)
            : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
        };
        await editTask(initialTaskId, taskUpdate);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const newTask: MaintenanceTaskInsert = {
          title: taskTitle,
          description: taskDescription,
          equipment_id: equipmentId,
          category_id: lineId,
          task_id: taskId || null,
          type: type,
          scheduled_date: scheduledDate,
          estimated_duration: estimatedDuration
            ? parseFloat(estimatedDuration)
            : undefined,
          priority: priority,
          status: status,
          assigned_to: assignedTo || null,
          notes: notes,
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

  // Handle equipment selection to auto-select its area and department
  const handleEquipmentChange = (value: string) => {
    setEquipmentId(value);
    const selectedEquipment = equipment.find((e) => e.id === value);
    if (selectedEquipment) {
      setLineId(selectedEquipment.area_id);
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
              ? "Enter the actual duration and any completion notes."
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
                  <Label htmlFor="task-title">Task</Label>
                  <Input id="task-title" value={taskTitle} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual-duration">
                    Actual Duration (hours) *
                  </Label>
                  <Input
                    id="actual-duration"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Enter actual hours spent"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(e.target.value)}
                    required
                  />
                </div>
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
                    <Label htmlFor="task">Task *</Label>
                    <Select
                      value={taskId}
                      onValueChange={(value) => {
                        setTaskId(value);
                        const selectedTask = tasks.find(
                          (task) => task.id === value,
                        );
                        if (selectedTask) {
                          setTaskTitle(selectedTask.name);
                          setTaskDescription(selectedTask.description || "");
                        }
                      }}
                      required
                    >
                      <SelectTrigger id="task">
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasksListLoading ? (
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
                    <Label htmlFor="estimated-duration">
                      Estimated Duration (hours)
                    </Label>
                    <Input
                      id="estimated-duration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="Enter estimated hours"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(
                        value: "low" | "medium" | "high" | "critical",
                      ) => setPriority(value)}
                    >
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
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={type}
                      onValueChange={(
                        value: "predictive" | "corrective" | "conditional",
                      ) => setType(value)}
                      required
                    >
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(
                        value:
                          | "scheduled"
                          | "in-progress"
                          | "completed"
                          | "cancelled"
                          | "partial",
                      ) => setStatus(value)}
                    >
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
                    <Label htmlFor="assigned-to">Assigned To</Label>
                    <Input
                      id="assigned-to"
                      placeholder="Enter technician ID"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Enter any additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-500">* Required fields</div>
              </div>
            )}
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
                    {mode === "complete" ? "Completing..." : "Saving..."}
                  </>
                ) : mode === "complete" ? (
                  "Complete Task"
                ) : mode === "edit" ? (
                  "Update Task"
                ) : (
                  "Schedule Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
