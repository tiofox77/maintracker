import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  BarChart3,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
} from "lucide-react";

interface MetricProps {
  title: string;
  value: number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricProps) => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
          <div
            className={`p-2 rounded-full ${trend === "up" ? "bg-green-100 text-green-600" : trend === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
          >
            {icon}
          </div>
        </div>
        <div className="mt-2 flex items-center">
          <span
            className={`text-sm ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"}`}
          >
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricsOverviewProps {
  metrics?: MetricProps[];
}

const MetricsOverview = ({
  metrics = [
    {
      title: "Total Equipment",
      value: 128,
      change: "+3%",
      trend: "up" as const,
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      title: "Scheduled Tasks",
      value: 42,
      change: "+12%",
      trend: "up" as const,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Completed Tasks",
      value: 89,
      change: "+5%",
      trend: "up" as const,
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: "Overdue Tasks",
      value: 7,
      change: "-2%",
      trend: "down" as const,
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  ],
}: MetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default MetricsOverview;
