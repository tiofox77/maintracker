import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";
import { useTaskStatusHistory } from "@/lib/hooks";
import { TaskStatusHistory } from "@/lib/api/taskStatusHistory";

interface TaskStatusHistoryTableProps {
  taskId?: string;
  startDate?: string;
  endDate?: string;
}

const TaskStatusHistoryTable: React.FC<TaskStatusHistoryTableProps> = ({
  taskId,
  startDate,
  endDate,
}) => {
  const {
    statusHistory,
    loading,
    error,
    fetchTaskStatusHistory,
    fetchStatusHistoryByDateRange,
  } = useTaskStatusHistory();
  const [historyData, setHistoryData] = useState<TaskStatusHistory[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (taskId) {
          // Check if this is a recurring instance ID (contains a date suffix)
          const isRecurringInstance = taskId.includes("-202");
          if (isRecurringInstance) {
            // Extract the original task ID (everything before the date)
            const originalId = taskId.split("-202")[0];
            const data = await fetchTaskStatusHistory(originalId);
            setHistoryData(data);
          } else {
            const data = await fetchTaskStatusHistory(taskId);
            setHistoryData(data);
          }
        } else if (startDate && endDate) {
          const data = await fetchStatusHistoryByDateRange(startDate, endDate);
          setHistoryData(data);
        }
      } catch (error) {
        console.error("Error loading task status history:", error);
      }
    };

    loadData();
  }, [
    taskId,
    startDate,
    endDate,
    fetchTaskStatusHistory,
    fetchStatusHistoryByDateRange,
  ]);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Cancelled
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Partial
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {taskId ? "Task Status History" : "Status History for Date Range"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading status history...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading status history. Please try again.
          </div>
        ) : historyData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Task ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{formatDate(history.status_date)}</TableCell>
                  <TableCell>{history.task_id}</TableCell>
                  <TableCell>{getStatusBadge(history.status)}</TableCell>
                  <TableCell>{history.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No status history found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskStatusHistoryTable;
