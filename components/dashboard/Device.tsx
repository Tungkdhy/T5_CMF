"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceStatistics } from "@/api/dashboard"; // API call
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
const COLORS = [
  "#ef4444", // đỏ
  "#3b82f6", // xanh dương
  "#facc15", // vàng
  "#10b981", // xanh lá
  "#8b5cf6", // tím
  "#f97316", // cam
  "#9ca3af", // xám
  "#4f46e5", // xanh đậm
];

export default function DeviceStatistics() {
  // Tính ngày mặc định: 3 tháng trước đến hôm nay
  const today = new Date();
  const endDateDefault = today.toISOString().split("T")[0];
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const startDateDefault = threeMonthsAgo.toISOString().split("T")[0];

  const [chartData, setChartData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [startDate, setStartDate] = useState<string>(startDateDefault);
  const [endDate, setEndDate] = useState<string>(endDateDefault);

  const fetchData = async () => {
    try {
      const res = await getDeviceStatistics({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const apiData = res.data;

      setSummary(apiData.summary || {});
      setRawData(apiData.raw_data || []);

      // Convert chart_data
      const labels = apiData.chart_data.labels;
      const values = apiData.chart_data.datasets[0].data;

      const formatted = labels.map((label: string, idx: number) => ({
        name: label || "Chưa phân loại",
        value: values[idx],
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("Lỗi fetch dữ liệu thiết bị:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return (
    <>
      {/* Bộ lọc */}


      <div className="flex flex-wrap gap-4 items-end mb-6">
        {/* Ngày bắt đầu */}
        <div>
          <label className="block text-sm font-medium">Từ ngày</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          // className="w-[180px]"
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label className="block text-sm font-medium">Đến ngày</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          // className="w-[180px]"
          />
        </div>

        {/* Button */}
        <Button onClick={fetchData}>Lọc</Button>
      </div>



      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.total_devices || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Số loại thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.device_types_count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ + Bảng 50/50 */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar chart */}
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng chi tiết */}
            <div className="border-l pl-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại thiết bị</TableHead>
                    <TableHead>Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="flex items-center gap-2">
                        {/* Ô màu khớp với chart */}
                        <span
                          className="w-3 h-3 inline-block rounded"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                        {row.device_type_name || "Chưa phân loại"}
                      </TableCell>
                      <TableCell>{row.device_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
