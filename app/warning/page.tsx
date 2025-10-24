"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// API giả lập
import axios from "axios";
import api from "@/api/base";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Resource {
    id: string;
    display_name: string;
    usage: number;
    total: number;
    created_at: string;
    created_by_user: { display_name: string };
}

export default function ResourceManagement() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState<Resource | null>(null);
    const [editName, setEditName] = useState("");
    const [reloadFlag, setReloadFlag] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);

    const pageSize = 10;
    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 3000);
    };
    const fetchResources = async (page: number) => {
        try {
            const res = await api.get("/warning", {
                params: { pageSize, pageIndex: page },
                // headers: {
                //   Authorization: `Bearer ${localStorage.getItem("token")}`,
                // },
            });
            setResources(res.data.data.rows);
            setTotalPages(Math.ceil(res.data.data.count / pageSize));
        } catch (err) {
            console.error("Fetch resources error:", err);
        }
    };

    useEffect(() => {
        fetchResources(pageIndex);
    }, [pageIndex]);

    // Xoá resource
    const handleDelete = async (id: string) => {
        // if (!confirm("Bạn có chắc muốn xoá mục này?")) return;
        try {
            await api.delete(`/warning/${id}`, {
                // headers: {
                //   Authorization: `Bearer ${localStorage.getItem("token")}`,
                // },
            });
            fetchResources(pageIndex);
            showAlert("Xoá mục thành công", "success");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // Bắt đầu sửa
    const handleEdit = (resource: Resource) => {
        setEditing(resource);
        setEditName(resource.display_name);
    };

    // Lưu chỉnh sửa
    const handleSave = async (r: any) => {
        if (!r) return;
        try {
            await api.put(
                `/warning/${r.id}`,
                { is_process: true },
                // {
                //   headers: {
                //     Authorization: `Bearer ${localStorage.getItem("token")}`,
                //   },
                // }
            );
            setEditing(null);
            fetchResources(pageIndex);
            showAlert("Cập nhật mục thành công", "success");
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {message && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
                    <Alert
                        className={`rounded-xl shadow-lg ${status === "success"
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "bg-red-100 border-red-500 text-red-800"
                            }`}
                    >
                        {status === "success" ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                        <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                {/* Search */}
                <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Sử dụng</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Người tạo</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources
                            .filter((r) =>
                                r.display_name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((r, i) => (
                                <TableRow key={r.id}>
                                    <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                    <TableCell>
                                        {editing?.id === r.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-40"
                                            />
                                        ) : (
                                            r.display_name
                                        )}
                                    </TableCell>
                                    <TableCell>{r.usage.toFixed(2)}</TableCell>
                                    <TableCell>{r.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {r.created_by_user?.display_name || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(r.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        {editing?.id === r.id ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleSave}
                                                >
                                                    Lưu
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditing(null)}
                                                >
                                                    Huỷ
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSave(r)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="w-4 h-4" /> Xóa
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <p>Bạn có chắc muốn xóa?</p>
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <Button size="sm" variant="outline" onClick={() => { }}>Hủy</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Xóa</Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-end mt-4 space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={pageIndex === 1}
                        onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))}
                        className="p-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="flex items-center px-2">
                        Trang {pageIndex} / {totalPages}
                    </span>

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={pageIndex === totalPages}
                        onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
                        className="p-1"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}