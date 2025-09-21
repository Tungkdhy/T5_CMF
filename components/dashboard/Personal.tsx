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
import { Users, UserCheck, UserX, Wifi } from "lucide-react";
import { getPersonalStatistics } from "@/api/dashboard";

// Mock danh sách trung tâm
const units = [
  { id: "b11b0a3b-3ca3-4721-80b9-4598dfcbe7ff", name: "TT586" },
  { id: "c22c0a3b-3ca3-4721-80b9-4598dfcbe7aa", name: "TT123" },
];

// Mock API data
const apiData = {
  period: { start_date: "2025-08-08", end_date: "2025-09-07", group_by: "week" },
  unit_info: { id: "b11b0a3b-3ca3-4721-80b9-4598dfcbe7ff", display_name: "TT586", description: "Đơn vị Trung tâm 5" },
  summary: { total_personnel: 3, total_active: 2, total_online: 0, total_inactive: 1, avg_active_percentage: 50 },
  chart_data: {
    labels: ["2025-W34", "2025-W35"],
    datasets: [
      { label: "Tổng số lực lượng", data: [2, 1], backgroundColor: "rgba(54, 162, 235, 0.6)" },
      { label: "Lực lượng hoạt động", data: [2, 0], backgroundColor: "rgba(75, 192, 192, 0.6)" },
      { label: "Lực lượng online", data: [0, 0], backgroundColor: "rgba(255, 205, 86, 0.6)" },
      { label: "Lực lượng không hoạt động", data: [0, 1], backgroundColor: "rgba(255, 99, 132, 0.6)" },
    ],
  },
  raw_data: [
    { period: "2025-W34", total_personnel: "2", active_personnel: "2", online_personnel: "0", inactive_personnel: "0", active_percentage: "100.00" },
    { period: "2025-W35", total_personnel: "1", active_personnel: "0", online_personnel: "0", inactive_personnel: "1", active_percentage: "0.00" },
  ],
};

export default function PersonnelOverview() {
  const [data, setData] = useState<any>(apiData);

  // Bộ lọc
  const [filters, setFilters] = useState({
    unit_id: units[0].id,
    start_date: "2025-08-08",
    end_date: "2025-09-07",
    group_by: "week",
  });

  // Hàm fetch API (mock)
  const fetchData = async () => {
    const res = await getPersonalStatistics({
      unit_id: filters.unit_id,
      group_by: filters.group_by,
    })
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summaryStats = [
    { title: "Tổng lực lượng", value: data.summary?.total_personnel, icon: Users, color: "bg-blue-500" },
    { title: "Hoạt động", value: data.summary?.total_active, icon: UserCheck, color: "bg-green-500" },
    { title: "Online", value: data.summary?.total_online, icon: Wifi, color: "bg-yellow-500" },
    { title: "Không hoạt động", value: data.summary?.total_inactive, icon: UserX, color: "bg-red-500" },
  ];

  const chartData = data.chart_data.labels.map((label: string, index: number) => {
    const entry: any = { period: label };
    data.chart_data.datasets.forEach((ds: any) => {
      entry[ds.label] = ds.data[index];
    });
    return entry;
  });

  return (
    <div className="min-h-screen bg-gray-50  space-y-6">
      {/* Bộ lọc gọn */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-lg shadow-sm">
        {/* Trung tâm */}
        <select
          className="border p-2 rounded text-sm"
          value={filters.unit_id}
          onChange={(e) => setFilters({ ...filters, unit_id: e.target.value })}
        >
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {/* Ngày bắt đầu */}


        {/* Group by */}
        <select
          className="border p-2 rounded text-sm"
          value={filters.group_by}
          onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
        >
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
        </select>

        {/* Button */}
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Áp dụng
        </button>
      </div>

      {/* Thông tin đơn vị */}
      <Card>
        <CardHeader>
          <CardTitle>{data.unit_info?.display_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.unit_info?.description}</p>
          <p className="text-sm text-gray-500">
            {filters.start_date} → {filters.end_date} ({filters.group_by})
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
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
          <CardTitle>Thống kê theo {filters.group_by}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.chart_data.datasets.map((ds: any, i: number) => (
                  <Bar key={i} dataKey={ds.label} fill={ds.backgroundColor} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Kỳ</th>
                <th className="p-2 border">Tổng</th>
                <th className="p-2 border">Hoạt động</th>
                <th className="p-2 border">Online</th>
                <th className="p-2 border">Không hoạt động</th>
                <th className="p-2 border">Tỷ lệ hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {data.raw_data?.map((row: any, idx: number) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{row.period}</td>
                  <td className="p-2 border">{row.total_personnel}</td>
                  <td className="p-2 border">{row.active_personnel}</td>
                  <td className="p-2 border">{row.online_personnel}</td>
                  <td className="p-2 border">{row.inactive_personnel}</td>
                  <td className="p-2 border">{row.active_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
