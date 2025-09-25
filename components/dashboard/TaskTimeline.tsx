"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
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
import { getTaskStatistics } from "@/api/dashboard";

export default function TaskTimeline() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("day");
  const [chartData, setChartData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  // Gọi API
  const fetchData = async () => {
    try {
      const res = await getTaskStatistics({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
      });

      const apiData = res.data; // response structure
      console.log(res);
      
      const labels: string[] = apiData.chart_data.labels;
      const datasets = apiData.chart_data.datasets;

      // Mapping chart_data -> recharts format
      const formattedChart = labels.map((date, idx) => ({
        date,
        total: Number(datasets[0].data[idx]),
        assigned: Number(datasets[1].data[idx]),
        completed: Number(datasets[2].data[idx]),
      }));

      setChartData(formattedChart);
      setRawData(apiData.raw_data || []);
    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, groupBy]);

  return (
    <>
      {/* Biểu đồ công việc theo thời gian */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="gap-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  name="Tổng số"
                />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  stroke="#ef4444"
                  name="Đã giao"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  name="Hoàn thành"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle>Bảng chi tiết công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Tổng công việc</TableHead>
                <TableHead>Đã giao</TableHead>
                <TableHead>Hoàn thành</TableHead>
                <TableHead>Tiến độ TB (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{row.task_count}</TableCell>
                  <TableCell>{row.assigned_tasks}</TableCell>
                  <TableCell>{row.completed_tasks}</TableCell>
                  <TableCell>{row.avg_progress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
