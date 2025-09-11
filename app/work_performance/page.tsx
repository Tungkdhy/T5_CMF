"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/api/base";

interface Performance {
  assignee_name: string;
  assignee_id: string;
  completed_tasks: string;
  avg_completion_days: string;
  min_completion_days: string;
  max_completion_days: string;
  total_actual_hours: string | null;
  avg_actual_hours: string | null;
}

export default function PerformanceTable() {
  const [data, setData] = useState<Performance[]>([]);
  const [startDate, setStartDate] = useState<string>("2024-12-01");
  const [endDate, setEndDate] = useState<string>("2024-12-31");
  const [loading, setLoading] = useState<boolean>(false);

  // state cho Dialog chi tiết
  const [selectedUser, setSelectedUser] = useState<Performance | null>(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const result = await api.get(
        `/tasks/performance/completion-time?start_date=${startDate}&end_date=${endDate}`
      );

      if (result.data.statusCode === "10000") {
        setData(result.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* Bộ lọc thời gian */}
      <div className="flex gap-4 mb-6 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Thời gian bắt đầu</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Thời gian kết thúc</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={fetchPerformance} disabled={loading}>
          {loading ? "Đang tải..." : "Lọc dữ liệu"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Hiệu suất người dùng</TabsTrigger>
          <TabsTrigger value="hours">Khối lượng hoàn thành</TabsTrigger>
        </TabsList>

        {/* Tab 1: Hiệu suất task */}
        <TabsContent value="tasks">
          <Table className="w-full mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Số task hoàn thành</TableHead>
                <TableHead>Thời gian TB (ngày)</TableHead>
                <TableHead>Min (ngày)</TableHead>
                <TableHead>Max (ngày)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, i) => (
                <TableRow
                  key={item.assignee_id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedUser(item)}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.assignee_name}</TableCell>
                  <TableCell>{item.completed_tasks}</TableCell>
                  <TableCell>
                    {parseFloat(item.avg_completion_days).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {parseFloat(item.min_completion_days).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {parseFloat(item.max_completion_days).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Tab 2: Số giờ thực tế */}
        <TabsContent value="hours">
          <Table className="w-full mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Tổng giờ thực tế</TableHead>
                <TableHead>Giờ TB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, i) => (
                <TableRow key={item.assignee_id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.assignee_name}</TableCell>
                  <TableCell>{item.total_actual_hours ?? "-"}</TableCell>
                  <TableCell>{item.avg_actual_hours ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Dialog chi tiết user */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết người dùng: {selectedUser?.assignee_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2 text-sm">
              <p><b>Số task hoàn thành:</b> {selectedUser.completed_tasks}</p>
              <p><b>Thời gian TB:</b> {parseFloat(selectedUser.avg_completion_days).toFixed(2)} ngày</p>
              <p><b>Thời gian Min:</b> {parseFloat(selectedUser.min_completion_days).toFixed(2)} ngày</p>
              <p><b>Thời gian Max:</b> {parseFloat(selectedUser.max_completion_days).toFixed(2)} ngày</p>
              <p><b>Tổng giờ thực tế:</b>
                {selectedUser.total_actual_hours
                  ? parseFloat(selectedUser.total_actual_hours).toFixed(2)
                  : "-"}
              </p>
              <p><b>Giờ TB:</b>
                {selectedUser.avg_actual_hours
                  ? parseFloat(selectedUser.avg_actual_hours).toFixed(2)
                  : "-"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
