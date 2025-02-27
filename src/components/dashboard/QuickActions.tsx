import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarPlus,
  Clipboard,
  FileBarChart,
  Plus,
  Settings,
  Wrench,
} from "lucide-react";

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick?: () => void;
}

const QuickActionButton = ({
  title,
  icon,
  description,
  onClick,
}: QuickActionProps) => {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-center justify-center gap-2 w-full bg-white hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <span className="font-medium text-sm">{title}</span>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </Button>
  );
};

interface QuickActionsProps {
  onScheduleMaintenance?: () => void;
  onAddEquipment?: () => void;
  onGenerateReport?: () => void;
  onManageCategories?: () => void;
}

const QuickActions = ({
  onScheduleMaintenance,
  onAddEquipment,
  onGenerateReport,
  onManageCategories,
}: QuickActionsProps) => {
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const handleScheduleMaintenance = () => {
    if (onScheduleMaintenance) {
      onScheduleMaintenance();
    } else {
      setMaintenanceModalOpen(true);
    }
  };

  const handleAddEquipment = () => {
    if (onAddEquipment) {
      onAddEquipment();
    } else {
      setEquipmentModalOpen(true);
    }
  };

  const handleManageCategories = () => {
    if (onManageCategories) {
      onManageCategories();
    } else {
      setCategoryModalOpen(true);
    }
  };

  return (
    <Card className="bg-white shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Dialog
            open={maintenanceModalOpen}
            onOpenChange={setMaintenanceModalOpen}
          >
            <DialogTrigger asChild>
              <div>
                <QuickActionButton
                  title="Schedule Maintenance"
                  icon={<CalendarPlus size={20} />}
                  description="Create a new maintenance task"
                  onClick={handleScheduleMaintenance}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-center text-gray-500">
                  Maintenance scheduling form would go here
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={equipmentModalOpen}
            onOpenChange={setEquipmentModalOpen}
          >
            <DialogTrigger asChild>
              <div>
                <QuickActionButton
                  title="Add Equipment"
                  icon={<Plus size={20} />}
                  description="Register new equipment"
                  onClick={handleAddEquipment}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Equipment Management</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-center text-gray-500">
                  Equipment management form would go here
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <QuickActionButton
            title="Generate Report"
            icon={<FileBarChart size={20} />}
            description="Create maintenance reports"
            onClick={onGenerateReport || (() => {})}
          />

          <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
            <DialogTrigger asChild>
              <div>
                <QuickActionButton
                  title="Manage Categories"
                  icon={<Settings size={20} />}
                  description="Edit categories and departments"
                  onClick={handleManageCategories}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Category Management</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-center text-gray-500">
                  Category management form would go here
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <QuickActionButton
            title="Request Service"
            icon={<Wrench size={20} />}
            description="Submit service request"
            onClick={() => {}}
          />

          <QuickActionButton
            title="View Checklists"
            icon={<Clipboard size={20} />}
            description="Access maintenance checklists"
            onClick={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
