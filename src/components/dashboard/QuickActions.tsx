import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Wrench,
  ClipboardList,
  BarChart3,
  Plus,
  Building2,
} from "lucide-react";
import { MaintenanceSchedulingModal } from "../maintenance/MaintenanceSchedulingModal";
import { EquipmentManagementModal } from "../equipment/EquipmentManagementModal";
import { CategoryManagementModal } from "../management/CategoryManagementModal";
import { DepartmentManagementModal } from "../management/DepartmentManagementModal";

const QuickActions = () => {
  const navigate = useNavigate();
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);

  const actions = [
    {
      title: "Schedule Maintenance",
      icon: <Calendar className="h-5 w-5" />,
      description: "Create a new maintenance task",
      action: () => setMaintenanceModalOpen(true),
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Add Equipment",
      icon: <Wrench className="h-5 w-5" />,
      description: "Register new equipment",
      action: () => setEquipmentModalOpen(true),
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Add Category",
      icon: <ClipboardList className="h-5 w-5" />,
      description: "Create a new category",
      action: () => setCategoryModalOpen(true),
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Add Department",
      icon: <Building2 className="h-5 w-5" />,
      description: "Create a new department",
      action: () => setDepartmentModalOpen(true),
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "View Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "View maintenance reports",
      action: () => navigate("/reports"),
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 px-4 justify-start flex-col items-start space-y-2 border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={action.action}
              >
                <div className={`p-2 rounded-full ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <MaintenanceSchedulingModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
      />

      <EquipmentManagementModal
        open={equipmentModalOpen}
        onOpenChange={setEquipmentModalOpen}
      />

      <CategoryManagementModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
      />

      <DepartmentManagementModal
        open={departmentModalOpen}
        onOpenChange={setDepartmentModalOpen}
      />
    </>
  );
};

export default QuickActions;
