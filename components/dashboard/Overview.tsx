"use client";
import { useEffect, useState } from "react";
import { Package, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getOverview } from "@/api/dashboard";

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
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function Overview() {
  const [overviewData, setOverviewData] = useState<any>(apiData.overview);

  const statsData = [
    {
      title: "Tổng công việc",
      value: overviewData.tasks?.total,
      icon: CheckCircle,
      color: "bg-yellow-500",
    },
    {
      title: "Đang làm",
      value: overviewData.tasks?.in_progress,
      icon: Clock,
      color: "bg-blue-500",
    },
    {
      title: "Hoàn thành",
      value: overviewData.tasks?.completed,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Thiết bị",
      value: overviewData.devices?.total,
      icon: Package,
      color: "bg-purple-500",
    },
  ];

  const taskChartData = [
    { name: "Hoàn thành", value: overviewData.tasks?.completed, color: "#10b981" },
    { name: "Đang làm", value: overviewData.tasks?.in_progress, color: "#3b82f6" },
    { name: "Mới", value: overviewData.tasks?.new, color: "#f59e0b" },
  ];

  const fetchData = async () => {
    try {
      const data = await getOverview();
      setOverviewData(data.data.overview); // tuỳ API trả về
    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className=" bg-gray-50">
      <main className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow flex flex-col"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${stat.color}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Doughnut Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(2)}%`
                      }
                    >
                      {taskChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Phân loại thiết bị</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewData.devices?.by_type || []}
                      dataKey="count"
                      nameKey="type_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {overviewData.devices?.by_type?.map(
                        (entry: any, index: number) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {overviewData.recent_activity?.map(
                (activity: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center gap-2">
                      {activity.type === "task" ? (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Package className="h-4 w-4 text-purple-500" />
                      )}
                      <span>{activity.description}</span>
                    </div>
                    <span className="font-semibold">{activity.count}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
