import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Note: In a real application, you would use a charting library like Chart.js, Recharts, or D3.js
// For this example, we'll create simple chart components that could be replaced with actual chart implementations

interface BarChartProps {
  title: string;
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
}

export const BarChart = ({ title, data, height = 300 }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.1; // Add 10% padding

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="relative">
          <div className="flex h-full items-end justify-between gap-2">
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-t-sm ${item.color || "bg-primary"}`}
                    style={{ height: `${barHeight}%` }}
                  ></div>
                  <div className="text-xs mt-2 text-center truncate w-full">
                    {item.label}
                  </div>
                  <div className="text-xs font-medium">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PieChartProps {
  title: string;
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  height?: number;
}

export const PieChart = ({ title, data, height = 300 }: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center" style={{ height: `${height}px` }}>
          <div className="relative w-40 h-40">
            {/* Simple pie chart representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                // This is a simplified representation - in a real app, you'd calculate actual SVG paths
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${percentage} 100`}
                    strokeDashoffset={`-${index * 25}`}
                    transform="rotate(-90 50 50)"
                  />
                );
              })}
            </svg>
          </div>
          <div className="ml-8">
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">
                    {item.label}: {item.value} (
                    {((item.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface LineChartProps {
  title: string;
  data: {
    label: string;
    value: number;
  }[];
  height?: number;
}

export const LineChart = ({ title, data, height = 300 }: LineChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.1; // Add 10% padding

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="relative">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${data.length * 50} 100`}
            preserveAspectRatio="none"
          >
            <polyline
              points={data
                .map(
                  (item, index) =>
                    `${index * 50 + 25},${100 - (item.value / maxValue) * 100}`,
                )
                .join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            {data.map((item, index) => (
              <circle
                key={index}
                cx={index * 50 + 25}
                cy={100 - (item.value / maxValue) * 100}
                r="3"
                fill="hsl(var(--primary))"
              />
            ))}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="text-xs text-center"
                style={{ width: "50px" }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
}

export const MetricCard = ({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  icon,
}: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div
              className={`p-2 rounded-full ${
                trend === "up"
                  ? "bg-green-100 text-green-600"
                  : trend === "down"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {icon}
            </div>
          )}
        </div>
        {trendValue && (
          <div className="mt-2 flex items-center">
            <span
              className={`text-sm ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
