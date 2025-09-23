"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ListTodo, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getTSCS } from "@/api/dashboard";
import { getCategory } from "@/api/categor";

// Mock danh sách category
const categories = [
  { id: "81702378-aa45-421a-b4f1-87447944f02b", name: "Tác chiến chuyên sâu" },
  { id: "99999999-aa45-421a-b4f1-87447944f0aa", name: "Huấn luyện" },
];

// Mock API data mới
const apiData = {
  statusCode: "10000",
  message: "Reconnaissance statistics retrieved successfully",
  data: {
    category: {
      id: "81702378-aa45-421a-b4f1-87447944f02b",
      name: "Tác chiến chuyên sâu",
      value: "INTENSIVE_COMBAT",
      description: "Nhiệm vụ Tác chiến chuyên sâu",
    },
    period: {
      start_date: "2024-01-01",
      end_date: "2025-10-31",
    },
    summary: {
      total_tasks: 4,
      assigned_tasks: 4,
      completed_tasks: 0,
      in_progress_tasks: 0,
      pending_tasks: 0,
      avg_progress: 0,
    },
    tasks_by_status: {
      assigned: {
        count: 4,
        tasks: [
          {
            id: "7600234b-3bc2-4a53-9f93-05354f5bd8bc",
            code: "Task-00000041",
            title: "Trinh sát K2",
            start_date: "2025-09-18",
            due_date: "2025-09-21",
            status_name: "Open",
            priority_name: "Medium",
            assignee_name: "DEV1",
            created_by_name: "nobita",
          },
          {
            id: "91fdf0ed-3e7f-48de-afd6-f72f301f714a",
            code: "Task-00000040",
            title: "Trinh sát K",
            start_date: "2025-09-18",
            due_date: "2025-09-21",
            status_name: "Open",
            priority_name: "Medium",
            assignee_name: "DEV1",
            created_by_name: "nobita",
          },
          {
            id: "7c9c194b-1666-4dae-8b57-0a76fe28eeb9",
            code: "TASK-00000033",
            title: "Trinh sát IND",
            start_date: "2025-09-18",
            due_date: "2025-09-20",
            status_name: "In Progress",
            priority_name: "Low",
            assignee_name: "Ht5",
            created_by_name: "nobita",
          },
          {
            id: "76ad06fc-ec71-4cdb-9e70-142ff6a93267",
            code: "TASK-00000032",
            title: "Khai thác MAL",
            start_date: "2025-09-18",
            due_date: "2025-09-20",
            status_name: "Open",
            priority_name: "Low",
            assignee_name: "Ht5",
            created_by_name: "nobita",
          },
        ],
      },
      completed: { count: 0, tasks: [] },
      in_progress: { count: 0, tasks: [] },
      pending: { count: 0, tasks: [] },
    },
    timeline: [
      {
        date: "2025-09-18",
        total_tasks: 4,
        assigned_tasks: 4,
        completed_tasks: 0,
      },
    ],
  },
};

export default function TaskOverview() {
  const [data, setData] = useState<any>(apiData);
  const [categoryTask, setCategoryTask] = useState<any>([])
  // Bộ lọc
  const [filters, setFilters] = useState({
    category_id: categories[0].id,
    start_date: "2024-01-01",
    end_date: "2025-10-31",
  });

  // Mock fetch API
  const fetchData = async () => {
   const res = await getTSCS({
    start_date: filters.start_date,
    end_date: filters.end_date,
    category_id: filters.category_id,
   });
   setData(res);
    // gọi API thật thì thay ở đây
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary stats
  const summaryStats = [
    { title: "Tổng nhiệm vụ", value: data.data.summary?.total_tasks, icon: ListTodo, color: "bg-blue-500" },
    { title: "Đã giao", value: data.data.summary?.assigned_tasks, icon: AlertCircle, color: "bg-yellow-500" },
    { title: "Hoàn thành", value: data.data.summary?.completed_tasks, icon: CheckCircle, color: "bg-green-500" },
    { title: "Đang xử lý", value: data.data.summary?.in_progress_tasks, icon: Clock, color: "bg-red-500" },
  ];

  // Chart data (timeline)
  const chartData = data.data.timeline.map((t: any) => ({
    date: t.date,
    "Tổng nhiệm vụ": t.total_tasks,
    "Đã giao": t.assigned_tasks,
    "Hoàn thành": t.completed_tasks,
  }));
  const fetchStatus = async () => {
    try {

      const category_task = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "MISSION" });
  
      setCategoryTask(category_task.data.rows)
    
    } catch (err) {
      console.error(err);

    }
  }
  useEffect(() => {
    fetchStatus();
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Loại nhiệm vụ</label>
            <Select
              value={filters.category_id}
              onValueChange={(v) => setFilters({ ...filters, category_id: v })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn category" />
              </SelectTrigger>
              <SelectContent>
                {categoryTask.map((c:any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-medium">Từ ngày</label>
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                setFilters({ ...filters, start_date: e.target.value })
              }
              className="w-[180px]"
            />
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) =>
                setFilters({ ...filters, end_date: e.target.value })
              }
              className="w-[180px]"
            />
          </div>

          <Button onClick={fetchData}>Lọc</Button>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="flex flex-col items-center justify-center py-6">
              <div className={`w-14 h-14 flex items-center justify-center rounded-full ${stat.color} mb-4`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-2">{stat.title}</div>
            </Card>
          );
        })}
      </div>

      {/* Biểu đồ */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Tổng nhiệm vụ" fill="rgba(54, 162, 235, 0.6)" />
                <Bar dataKey="Đã giao" fill="rgba(255, 205, 86, 0.6)" />
                <Bar dataKey="Hoàn thành" fill="rgba(75, 192, 192, 0.6)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhiệm vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Mã</th>
                <th className="p-2 border">Tên</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Ưu tiên</th>
                <th className="p-2 border">Người thực hiện</th>
                <th className="p-2 border">Người giao</th>
                <th className="p-2 border">Ngày bắt đầu</th>
                <th className="p-2 border">Hạn</th>
              </tr>
            </thead>
            <tbody>
              {data.data.tasks_by_status.assigned.tasks.map((task: any, idx: number) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{task.code}</td>
                  <td className="p-2 border">{task.title}</td>
                  <td className="p-2 border">{task.status_name}</td>
                  <td className="p-2 border">{task.priority_name}</td>
                  <td className="p-2 border">{task.assignee_name}</td>
                  <td className="p-2 border">{task.created_by_name}</td>
                  <td className="p-2 border">{task.start_date}</td>
                  <td className="p-2 border">{task.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
