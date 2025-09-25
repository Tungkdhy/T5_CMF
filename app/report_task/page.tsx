"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategory } from "@/api/categor";
import { getCompletionOverview } from "@/api/task";

export default function TaskManagementPage() {
    const [overview, setOverview] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("2024-01-01");
    const [endDate, setEndDate] = useState<string>("2025-10-31");

    const fetchOverview = async () => {
        const res = await getCompletionOverview({
            category_id: selectedCategory || undefined,
            start_date: startDate,
            end_date: endDate,
        });
        setOverview(res.data);
    };

    const fetchCategories = async () => {
        const res = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "MISSION" });
        setCategories(res.data.rows);
    };

    useEffect(() => {
        fetchCategories();
        fetchOverview();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-4 items-end">
                <Select
                    value={selectedCategory || ""}
                    onValueChange={(value) => setSelectedCategory(value)}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.display_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    type="date"
                    className="w-[180px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <Input
                    type="date"
                    className="w-[180px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <Button onClick={fetchOverview}>Áp dụng</Button>
            </div>

            {/* Bảng quản lý theo mức độ ưu tiên */}

            <Card>
                <CardHeader>
                    <CardTitle>Tóm tắt nhiệm vụ</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tổng</TableHead>
                                <TableHead>Hoàn thành</TableHead>
                                <TableHead>Tỷ lệ (%)</TableHead>
                                <TableHead>Quá hạn</TableHead>
                                <TableHead>Tiến độ TB (%)</TableHead>
                                <TableHead>Số ngày HT TB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{overview?.summary?.total_tasks ?? 0}</TableCell>
                                <TableCell>{overview?.summary?.completed_tasks ?? 0}</TableCell>
                                <TableCell>{overview?.summary?.completion_rate ?? 0}%</TableCell>
                                <TableCell>{overview?.summary?.overdue_tasks ?? 0}</TableCell>
                                <TableCell>{overview?.summary?.avg_progress ?? 0}%</TableCell>
                                <TableCell>{overview?.summary?.avg_completion_days ?? 0}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quản lý thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tổng giờ ước lượng</TableHead>
                                <TableHead>Tổng giờ thực tế</TableHead>
                                <TableHead>Ước lượng TB</TableHead>
                                <TableHead>Thực tế TB</TableHead>
                                <TableHead>Hiệu suất (%)</TableHead>
                                <TableHead>Hiệu quả</TableHead>
                                <TableHead>Kém hiệu quả</TableHead>
                                <TableHead>Có dữ liệu time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{overview?.time_management?.total_estimated_hours ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.total_actual_hours ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.avg_estimated_hours ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.avg_actual_hours ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.efficiency_ratio ?? 0}%</TableCell>
                                <TableCell>{overview?.time_management?.efficient_tasks ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.inefficient_tasks ?? 0}</TableCell>
                                <TableCell>{overview?.time_management?.tasks_with_time_data ?? 0}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Nhiệm vụ theo mức độ ưu tiên</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mức độ ưu tiên</TableHead>
                                <TableHead>Tổng số nhiệm vụ</TableHead>
                                <TableHead>Hoàn thành</TableHead>
                                <TableHead>Tỷ lệ hoàn thành</TableHead>
                                <TableHead>Tiến độ TB (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overview?.completion_by_priority?.length > 0 ? (
                                overview.completion_by_priority.map((p: any) => (
                                    <TableRow key={p.priority_name}>
                                        <TableCell>{p.priority_name}</TableCell>
                                        <TableCell>{p.total_tasks}</TableCell>
                                        <TableCell>{p.completed_tasks}</TableCell>
                                        <TableCell>{p.completion_rate}%</TableCell>
                                        <TableCell>{p.avg_progress}%</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
