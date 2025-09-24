"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    X,
    XCircle,
    CheckCircle,
    Search,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { deleteAlert, getAlerts, updateAlert } from "@/api/alert";
// Giả lập API gọi alert
// file chứa data bạn đưa ở trên

interface AlertItem {
    id: string;
    alert_code: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    alert_type: string;
    created_at: string;
}

export default function AlertManagement() {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<AlertItem | null>(null);
    const [formData, setFormData] = useState<Omit<AlertItem, "id">>({
        alert_code: "",
        title: "",
        description: "",
        severity: "medium",
        status: "new",
        alert_type: "",
        created_at: new Date().toISOString(),
    });

    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const pageSize = 10;

    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 2500);
    };

    const handleEdit = (item: AlertItem) => {
        setEditingAlert(item);
        const { id, ...rest } = item;
        setFormData(rest);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAlert(id)
            setAlerts((prev) => prev.filter((a) => a.id !== id));
            showAlert("Xóa alert thành công", "success");
        }
        catch (e) {

        }
    };

    const handleSave = async () => {
        if (editingAlert) {
            // update
            await updateAlert(editingAlert.id,{
                title: formData.title,
                description: formData.description,
                severity: formData.severity,
                status: formData.status,
               
            })
            showAlert("Cập nhật alert thành công", "success");
        } else {
            // create
            const newAlert: AlertItem = {
                id: crypto.randomUUID(),
                ...formData,
            };
            setAlerts((prev) => [newAlert, ...prev]);
            showAlert("Thêm alert thành công", "success");
        }
        setIsModalOpen(false);
        setEditingAlert(null);
        fetchAlerts(pageIndex)
    };

    const handleChange = (
        field: keyof typeof formData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingAlert(null);
    };

    const fetchAlerts = async (page: number) => {
        try {
            const rows = await getAlerts({ limit: 10, page: pageIndex });
            setAlerts(rows.data.alerts);
            setTotalPages(Math.ceil(rows.data.pagination.total / pageSize));
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };

    useEffect(() => {
        fetchAlerts(pageIndex);
    }, [pageIndex]);

    const filteredAlerts = alerts.filter(
        (a) =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.alert_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <AlertTitle>
                            {status === "success" ? "Thành công" : "Lỗi"}
                        </AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                    {/* <div className="relative ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm alert..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div> */}
                    {/* <Button
                        onClick={() => {
                            setIsModalOpen(true);
                            setFormData({
                                alert_code: "",
                                title: "",
                                description: "",
                                severity: "medium",
                                status: "new",
                                alert_type: "",
                                created_at: new Date().toISOString(),
                            });
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm alert
                    </Button> */}
                </div>

                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Mã Alert</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Mức độ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAlerts
                            .slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                            .map((a, i) => (
                                <TableRow key={a.id}>
                                    <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                    <TableCell>{a.alert_code}</TableCell>
                                    <TableCell>{a.title}</TableCell>
                                    <TableCell>{a.severity}</TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell>{a.alert_type}</TableCell>
                                    <TableCell className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(a)}
                                        >
                                            <Edit className="w-4 h-4" /> Sửa
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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { }}
                                                    >
                                                        Hủy
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(a.id)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                {/* Phân trang */}
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

            {/* Modal thêm/sửa alert */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                {editingAlert ? "Sửa Alert" : "Thêm Alert"}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* <div>
                <Label className="mb-3">Mã Alert</Label>
                <Input
                  value={formData.alert_code}
                  onChange={(e) =>
                    handleChange("alert_code", e.target.value)
                  }
                />
              </div> */}
                            <div>
                                <Label className="mb-3">Tiêu đề</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-3">Severity</Label>
                                <Input
                                    value={formData.severity}
                                    onChange={(e) =>
                                        handleChange("severity", e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-3">Status</Label>
                                <Input
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="mb-3">Alert Type</Label>
                                <Input
                                    value={formData.alert_type}
                                    onChange={(e) =>
                                        handleChange("alert_type", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>
                                {editingAlert ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
