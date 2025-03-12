import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Wrench, Truck, CheckCircle, ArrowRight } from "lucide-react";

export default function ModuleSelectionStoryboard() {
  const modules = [
    {
      id: "maintenance",
      title: "Maintenance Management",
      description:
        "Schedule and track equipment maintenance, manage assets, and monitor performance metrics.",
      icon: <Wrench className="h-8 w-8" />,
      status: "active",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-500",
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: "supplychain",
      title: "Supply Chain Management",
      description:
        "Manage inventory, track orders, and optimize your supply chain operations.",
      icon: <Truck className="h-8 w-8" />,
      status: "coming-soon",
      color: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-500",
      badgeColor: "bg-yellow-100 text-yellow-800",
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Select a Module</h2>
        <p className="text-gray-500 mt-1">
          Choose which module you want to use in your system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card
            key={module.id}
            className={`${module.color} border-2 cursor-pointer transition-all ${module.id === "maintenance" ? "border-primary ring-2 ring-primary/20" : "hover:border-gray-300"}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div
                  className={`p-3 rounded-full ${module.iconColor} bg-white/80`}
                >
                  {module.icon}
                </div>
                <Badge className={module.badgeColor}>
                  {module.status === "active" ? "Active" : "Coming Soon"}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              {module.id === "maintenance" && (
                <div className="flex items-center text-primary text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" /> Selected
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
