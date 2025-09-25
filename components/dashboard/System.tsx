"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/api/base";

export default function StatisticsDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // filter state
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-08-31");
  const [groupBy, setGroupBy] = useState("day");

  const fetchData = () => {
    setLoading(true);
    api
      .get("/dashboard/system/statistics", {
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy,
        },
      })
      .then((res) => {
        console.log(res.data);
        
        setStatsData(res.data.data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  if (!statsData) {
    return <div className="p-6 text-center text-red-500">Không lấy được dữ liệu</div>;
  }

  const { summary, chart_data, raw_data } = statsData;

  // Chuẩn hóa dữ liệu chart cho recharts
  const chartData =
    chart_data.labels.map((label: string, i: number) => {
      const point: any = { date: label };
      chart_data.datasets.forEach((ds: any) => {
        point[ds.label] = ds.data[i];
      });
      return point;
    }) || [];

  return (
    <div className="space-y-6">
      {/* Bộ lọc */}
      
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Từ ngày</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nhóm theo</label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chọn group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Ngày</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchData}>Lọc</Button>
        </div>


      {/* Tổng quan */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>CPU trung bình</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.avg_cpu_usage}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory trung bình</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.avg_memory_usage}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disk trung bình</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.avg_disk_usage}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.total_activities}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.total_login_activities}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tạo mới</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.total_create_activities}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          {chart_data.labels.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Không có dữ liệu trong khoảng thời gian đã chọn
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chart_data.datasets.map((ds: any, idx: number) =>
                  ds.label.includes("Usage") ? (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={ds.label}
                      stroke={ds.borderColor || "#000"}
                      name={ds.label}
                    />
                  ) : (
                    <Bar
                      key={idx}
                      dataKey={ds.label}
                      fill={ds.backgroundColor || "#8884d8"}
                      name={ds.label}
                    />
                  )
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <CardHeader>
          <CardTitle>Dữ liệu chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Tổng hoạt động</TableHead>
                <TableHead>Đăng nhập</TableHead>
                <TableHead>Tạo mới</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Xóa</TableHead>
                <TableHead>CPU (%)</TableHead>
                <TableHead>Memory (%)</TableHead>
                <TableHead>Disk (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raw_data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                raw_data.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.total_activities}</TableCell>
                    <TableCell>{row.login_activities}</TableCell>
                    <TableCell>{row.create_activities}</TableCell>
                    <TableCell>{row.update_activities}</TableCell>
                    <TableCell>{row.delete_activities}</TableCell>
                    <TableCell>{row.avg_cpu_usage}%</TableCell>
                    <TableCell>{row.avg_memory_usage}%</TableCell>
                    <TableCell>{row.avg_disk_usage}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
