import { supabase } from "../supabase";

// Function to get maintenance summary data
export async function getMaintenanceSummary(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (error) {
    console.error("Error fetching maintenance summary:", error);
    throw error;
  }

  // Process the data to create summary statistics
  const summary = {
    total: data.length,
    completed: data.filter((task) => task.status === "completed").length,
    inProgress: data.filter((task) => task.status === "in-progress").length,
    scheduled: data.filter((task) => task.status === "scheduled").length,
    cancelled: data.filter((task) => task.status === "cancelled").length,
    partial: data.filter((task) => task.status === "partial").length,
    byPriority: {
      critical: data.filter((task) => task.priority === "critical").length,
      high: data.filter((task) => task.priority === "high").length,
      medium: data.filter((task) => task.priority === "medium").length,
      low: data.filter((task) => task.priority === "low").length,
    },
    totalEstimatedHours: data.reduce(
      (sum, task) => sum + (task.estimated_duration || 0),
      0,
    ),
    totalActualHours: data.reduce(
      (sum, task) => sum + (task.actual_duration || 0),
      0,
    ),
  };

  return summary;
}

// Function to get equipment performance data
export async function getEquipmentPerformance(
  startDate: string,
  endDate: string,
) {
  // Get all equipment
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("*");

  if (equipmentError) {
    console.error("Error fetching equipment:", equipmentError);
    throw equipmentError;
  }

  // Get maintenance tasks for the period
  const { data: tasks, error: tasksError } = await supabase
    .from("maintenance_tasks")
    .select("*")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (tasksError) {
    console.error("Error fetching maintenance tasks:", tasksError);
    throw tasksError;
  }

  // Calculate performance metrics for each equipment
  const performanceData = equipment.map((equip) => {
    const equipmentTasks = tasks.filter(
      (task) => task.equipment_id === equip.id,
    );
    const completedTasks = equipmentTasks.filter(
      (task) => task.status === "completed",
    );
    const cancelledTasks = equipmentTasks.filter(
      (task) => task.status === "cancelled",
    );

    return {
      id: equip.id,
      name: equip.name,
      status: equip.status,
      totalTasks: equipmentTasks.length,
      completedTasks: completedTasks.length,
      cancelledTasks: cancelledTasks.length,
      maintenanceRate:
        equipmentTasks.length > 0
          ? (completedTasks.length / equipmentTasks.length) * 100
          : 0,
      downtime:
        cancelledTasks.length > 0
          ? (cancelledTasks.length / equipmentTasks.length) * 100
          : 0,
      lastMaintenance: equip.last_maintenance,
      nextMaintenance: equip.next_maintenance,
    };
  });

  return performanceData;
}

// Function to get department analysis data
export async function getDepartmentAnalysis(
  startDate: string,
  endDate: string,
) {
  // Get all departments
  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("*");

  if (departmentsError) {
    console.error("Error fetching departments:", departmentsError);
    throw departmentsError;
  }

  // Get all equipment with their departments
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("*, departments(*)");

  if (equipmentError) {
    console.error("Error fetching equipment:", equipmentError);
    throw equipmentError;
  }

  // Get maintenance tasks for the period
  const { data: tasks, error: tasksError } = await supabase
    .from("maintenance_tasks")
    .select("*, equipment(*)")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (tasksError) {
    console.error("Error fetching maintenance tasks:", tasksError);
    throw tasksError;
  }

  // Calculate metrics for each department
  const departmentData = departments.map((dept) => {
    const deptEquipment = equipment.filter(
      (equip) => equip.department_id === dept.id,
    );
    const deptEquipmentIds = deptEquipment.map((equip) => equip.id);
    const deptTasks = tasks.filter((task) =>
      deptEquipmentIds.includes(task.equipment_id),
    );

    return {
      id: dept.id,
      name: dept.name,
      location: dept.location,
      equipmentCount: deptEquipment.length,
      maintenanceTasks: deptTasks.length,
      completedTasks: deptTasks.filter((task) => task.status === "completed")
        .length,
      scheduledTasks: deptTasks.filter((task) => task.status === "scheduled")
        .length,
      criticalTasks: deptTasks.filter((task) => task.priority === "critical")
        .length,
      totalHours: deptTasks.reduce(
        (sum, task) =>
          sum + (task.actual_duration || task.estimated_duration || 0),
        0,
      ),
    };
  });

  return departmentData;
}

// Function to get technician performance data
export async function getTechnicianPerformance(
  startDate: string,
  endDate: string,
) {
  // Get all technicians (users with role 'technician')
  const { data: technicians, error: techniciansError } = await supabase
    .from("users")
    .select("*")
    .eq("role", "technician");

  if (techniciansError) {
    console.error("Error fetching technicians:", techniciansError);
    throw techniciansError;
  }

  // Get maintenance tasks for the period
  const { data: tasks, error: tasksError } = await supabase
    .from("maintenance_tasks")
    .select("*")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (tasksError) {
    console.error("Error fetching maintenance tasks:", tasksError);
    throw tasksError;
  }

  // Calculate performance metrics for each technician
  const technicianData = technicians.map((tech) => {
    const techTasks = tasks.filter((task) => task.assigned_to === tech.id);
    const completedTasks = techTasks.filter(
      (task) => task.status === "completed",
    );

    // Calculate efficiency (actual time vs estimated time)
    let efficiency = 0;
    let tasksWithBothTimes = 0;

    completedTasks.forEach((task) => {
      if (task.estimated_duration && task.actual_duration) {
        efficiency += task.estimated_duration / task.actual_duration;
        tasksWithBothTimes++;
      }
    });

    efficiency =
      tasksWithBothTimes > 0 ? (efficiency / tasksWithBothTimes) * 100 : 0;

    return {
      id: tech.id,
      name: `${tech.first_name} ${tech.last_name}`,
      totalTasks: techTasks.length,
      completedTasks: completedTasks.length,
      completionRate:
        techTasks.length > 0
          ? (completedTasks.length / techTasks.length) * 100
          : 0,
      efficiency: efficiency,
      totalHours: completedTasks.reduce(
        (sum, task) => sum + (task.actual_duration || 0),
        0,
      ),
      criticalTasks: techTasks.filter((task) => task.priority === "critical")
        .length,
      highPriorityTasks: techTasks.filter((task) => task.priority === "high")
        .length,
    };
  });

  return technicianData;
}

// Function to get maintenance calendar data
export async function getMaintenanceCalendar(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select(
      `
      *,
      equipment(*)
    `,
    )
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date");

  if (error) {
    console.error("Error fetching maintenance calendar data:", error);
    throw error;
  }

  // Format the data for calendar view
  const calendarData = data.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.scheduled_date,
    end: task.completed_date || task.scheduled_date,
    status: task.status,
    priority: task.priority,
    equipment: task.equipment.name,
    assignedTo: task.assigned_to,
  }));

  return calendarData;
}

// Function to export data to CSV format
export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) => {
      return headers
        .map((header) => {
          const cell = row[header];
          // Handle special cases (objects, arrays, etc.)
          if (cell === null || cell === undefined) {
            return "";
          } else if (typeof cell === "object") {
            return JSON.stringify(cell).replace(/"/g, '""');
          } else {
            // Escape quotes and wrap in quotes if the value contains commas or quotes
            const cellStr = String(cell).replace(/"/g, '""');
            return cellStr.includes(",") ||
              cellStr.includes('"') ||
              cellStr.includes("\n")
              ? `"${cellStr}"`
              : cellStr;
          }
        })
        .join(",");
    }),
  ].join("\n");

  // Create a download link and trigger the download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
