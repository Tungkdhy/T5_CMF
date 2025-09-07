"use client";
import {
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import Overview from "@/components/dashboard/Overview";
import TaskTimeline from "@/components/dashboard/TaskTimeline";
import DeviceStatistics from "@/components/dashboard/Device";
import PersonnelOverview from "@/components/dashboard/Personal";

// Mock API data
const apiData = {
  overview: {
    tasks: {
      total: 8,
      recent: 8,
      completed: 1,
      in_progress: 2,
      new: 5,
      avg_progress: 23.75,
    },
    devices: {
      total: 5,
      types_count: 4,
      by_type: [
        { type_name: "Phần mềm", count: 2 },
        { type_name: "Khác", count: 1 },
        { type_name: "Phần cứng", count: 1 },
        { type_name: "Chưa phân loại", count: 1 },
      ],
    },
    recent_activity: [
      { type: "task", count: "4", description: "Nhiệm vụ mới" },
      { type: "device", count: "1", description: "Thiết bị mới" },
    ],
  },
  data: {
    period: {
      start_date: "2025-08-08",
      end_date: "2025-09-07",
      group_by: "day",
    },
    summary: {
      total_tasks: 8,
      total_assigned: 8,
      total_completed: 1,
      avg_progress: 25.625,
    },
    chart_data: {
      labels: ["2025-08-27", "2025-08-28", "2025-08-29", "2025-09-05"],
      datasets: [
        {
          label: "Tổng số nhiệm vụ",
          data: [1, 1, 2, 4],
          color: "#3b82f6",
        },
        {
          label: "Nhiệm vụ đã giao",
          data: [1, 1, 2, 4],
          color: "#ef4444",
        },
        {
          label: "Nhiệm vụ hoàn thành",
          data: [0, 0, 1, 0],
          color: "#10b981",
        },
      ],
    },
    raw_data: [
      {
        period: "2025-08-27",
        task_count: "1",
        tasks_with_status: "1",
        assigned_tasks: "1",
        completed_tasks: "0",
        avg_progress: "40.00",
      },
      {
        period: "2025-08-28",
        task_count: "1",
        tasks_with_status: "1",
        assigned_tasks: "1",
        completed_tasks: "0",
        avg_progress: "0.00",
      },
      {
        period: "2025-08-29",
        task_count: "2",
        tasks_with_status: "2",
        assigned_tasks: "2",
        completed_tasks: "1",
        avg_progress: "50.00",
      },
      {
        period: "2025-09-05",
        task_count: "4",
        tasks_with_status: "4",
        assigned_tasks: "4",
        completed_tasks: "0",
        avg_progress: "12.50",
      },
    ],
  },
};

// 🎨 Màu cho công việc
const TASK_COLORS = {
  completed: "#10b981",
  in_progress: "#3b82f6",
  new: "#f59e0b",
};

// 🎨 Màu cho thiết bị
const DEVICE_COLORS = ["#ef4444", "#8b5cf6", "#14b8a6", "#6b7280"];

export default function Dashboard() {
  const { tasks, devices } = apiData.overview;
  const { chart_data, raw_data } = apiData.data;

  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-09-30");
  const [groupBy, setGroupBy] = useState("day");

  const statsData = [
    {
      title: "Tổng công việc",
      value: tasks.total,
      icon: CheckCircle,
      color: "bg-yellow-500",
    },
    {
      title: "Đang làm",
      value: tasks.in_progress,
      icon: Clock,
      color: "bg-blue-500",
    },
    {
      title: "Hoàn thành",
      value: tasks.completed,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Thiết bị",
      value: devices.total,
      icon: Package,
      color: "bg-purple-500",
    },
  ];

  const taskChartData = [
    { name: "Hoàn thành", value: tasks.completed, color: TASK_COLORS.completed },
    { name: "Đang làm", value: tasks.in_progress, color: TASK_COLORS.in_progress },
    { name: "Mới", value: tasks.new, color: TASK_COLORS.new },
  ];

  // Lọc dữ liệu theo ngày bắt đầu & kết thúc
  const filteredLineChartData = chart_data.labels
    .map((label, i) => ({
      date: label,
      total: chart_data.datasets[0].data[i],
      assigned: chart_data.datasets[1].data[i],
      completed: chart_data.datasets[2].data[i],
    }))
    .filter(
      (item) =>
        new Date(item.date) >= new Date(startDate) &&
        new Date(item.date) <= new Date(endDate)
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 space-y-6">
        {/* Thống kê nhanh */}

        <Overview />
        {/* Biểu đồ đường */}
        <TaskTimeline />
        <DeviceStatistics/>
        <PersonnelOverview/>
      </main>
    </div>
  );
}
