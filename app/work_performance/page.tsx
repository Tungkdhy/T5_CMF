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
import { set } from "react-hook-form";

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
  const [data2, setData2] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>("2025-01-01");
  const [endDate, setEndDate] = useState<string>("2025-12-31");
  const [loading, setLoading] = useState<boolean>(false);
  const [levelPerformance, setLevelPerformance] = useState<any>(null);
  // state cho Dialog chi tiết
  const [selectedUser, setSelectedUser] = useState<Performance | null>(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const result = await api.get(
        `/tasks/performance/completion-time?start_date=${startDate}&end_date=${endDate}`
      );
      const result2 = await api.get(
        `/tasks/performance/completion-volume?start_date=${startDate}&end_date=${endDate}`
      );


      setData(result.data.data);
      setData2(result2.data.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSelectedUser = async (user: Performance) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/tasks/performance/completion-level?start_date=${startDate}&end_date=${endDate}&user_id=${user.assignee_id}`);
      setLevelPerformance(res.data.data);
    }
    catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    fetchPerformance();
  }, []);
  console.log(data2);

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
                  onClick={() => handleSelectedUser(item)}
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
                {/* <TableHead>Assignee ID</TableHead> */}
                <TableHead>Tổng số task</TableHead>
                <TableHead>Tổng giờ ước lượng</TableHead>
                <TableHead>Tổng giờ thực tế</TableHead>
                <TableHead>Giờ TB ước lượng</TableHead>
                <TableHead>Giờ TB thực tế</TableHead>
                <TableHead>Giờ ước lượng đã hoàn thành</TableHead>
                <TableHead>Giờ thực tế đã hoàn thành</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data2.map((item, i) => (
                <TableRow key={item.assignee_id ?? i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.assignee_name ?? "-"}</TableCell>
                  {/* <TableCell>{item.assignee_id ?? "-"}</TableCell> */}
                  <TableCell>{item.total_tasks ?? "-"}</TableCell>
                  <TableCell>{item.total_estimated_hours ?? "-"}</TableCell>
                  <TableCell>{item.total_actual_hours ?? "-"}</TableCell>
                  <TableCell>{item.avg_estimated_hours ?? "-"}</TableCell>
                  <TableCell>{item.avg_actual_hours ?? "-"}</TableCell>
                  <TableCell>{item.completed_estimated_hours ?? "-"}</TableCell>
                  <TableCell>{item.completed_actual_hours ?? "-"}</TableCell>
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
          {levelPerformance && (
            levelPerformance.map((level: any, index: number) => {
              return <div key={index} className="space-y-2 text-sm">
                <p><b>Tổng số task:</b> {level.total_tasks}</p>
                <p><b>Số task hoàn thành:</b> {level.completed_tasks}</p>
                <p><b>Task tiến độ cao:</b> {level.high_progress_tasks}</p>
                <p><b>Task tiến độ trung bình:</b> {level.medium_progress_tasks}</p>
                <p><b>Task tiến độ thấp:</b> {level.low_progress_tasks}</p>
                <p><b>Hoàn thành TB:</b> {parseFloat(level.avg_progress_percent).toFixed(2)}%</p>
              </div>
            }
            ))}
        </DialogContent>
      </Dialog>

    </div>
  );
}
