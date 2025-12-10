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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
    updated_at:string
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
        updated_at: new Date().toISOString(),
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
            await updateAlert(editingAlert.id, {
                title: formData.title,
                description: formData.description,
                severity: formData.severity,
                status: formData.status,
                alert_type: formData.alert_type

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

    // Helper function to get severity badge style
    const getSeverityBadge = (severity: string) => {
        const styles: Record<string, string> = {
            low: "bg-green-100 text-green-700",
            medium: "bg-yellow-100 text-yellow-700",
            high: "bg-orange-100 text-orange-700",
            critical: "bg-red-100 text-red-700",
        };
        return styles[severity] || "bg-gray-100 text-gray-700";
    };

    // Helper function to get status badge style
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: "bg-blue-100 text-blue-700",
            investigating: "bg-purple-100 text-purple-700",
            confirmed: "bg-orange-100 text-orange-700",
            false_positive: "bg-gray-100 text-gray-700",
            resolved: "bg-green-100 text-green-700",
            dismissed: "bg-gray-100 text-gray-500",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {message && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Alert
                        className={cn(
                            "rounded-xl shadow-lg transition-all",
                            status === "success"
                                ? "bg-green-100 border-green-500 text-green-800"
                                : "bg-red-100 border-red-500 text-red-800"
                        )}
                    >
                        {status === "success" ? (
                            <CheckCircle className="h-5 w-5 animate-bounce" />
                        ) : (
                            <XCircle className="h-5 w-5 animate-shake" />
                        )}
                        <AlertTitle>
                            {status === "success" ? "Thành công" : "Lỗi"}
                        </AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <TableRow className="bg-gray-50">
                            <TableHead>STT</TableHead>
                            <TableHead>Mã cảnh báo</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Mức độ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAlerts
                            .map((a, i) => (
                                <TableRow 
                                    key={a.id}
                                    className="animate-in fade-in slide-in-from-left-2 hover:bg-blue-50/50 transition-colors"
                                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                                >
                                    <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {a.alert_code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{a.title}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            getSeverityBadge(a.severity)
                                        )}>
                                            {a.severity}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            getStatusBadge(a.status)
                                        )}>
                                            {a.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {a.alert_type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(a.updated_at ?? "").toLocaleDateString("en-GB")}
                                    </TableCell>

                                    <TableCell className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(a)}
                                            className="transition-all hover:scale-105 hover:border-blue-400 hover:text-blue-600"
                                        >
                                            <Edit className="w-4 h-4" /> Sửa
                                        </Button>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size="sm" variant="destructive" className="transition-all hover:scale-105">
                                                    <Trash2 className="w-4 h-4" /> Xóa
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="animate-in fade-in zoom-in-95 duration-200">
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
                        className="p-1 transition-all hover:scale-105 hover:border-blue-400 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="flex items-center px-3 py-1 bg-gray-100 rounded-md font-medium">
                        Trang {pageIndex} / {totalPages}
                    </span>

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={pageIndex === totalPages}
                        onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
                        className="p-1 transition-all hover:scale-105 hover:border-blue-400 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Modal thêm/sửa alert */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold">
                                {editingAlert ? "Sửa Alert" : "Thêm Alert"}
                            </h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCancel}
                                className="hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '50ms' }}>
                                <Label className="mb-3">Tiêu đề</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    className="transition-all focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                                <Label className="mb-3">Mô tả</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                    className="transition-all focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                                <div>
                                    <Label className="mb-3">Mức độ</Label>
                                    <Select
                                        value={formData.severity}
                                        onValueChange={(value: any) => handleChange("severity", value)}
                                    >
                                        <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-blue-300">
                                            <SelectValue placeholder="Chọn mức độ" />
                                        </SelectTrigger>
                                        <SelectContent className="animate-in fade-in zoom-in-95 duration-200">
                                            <SelectItem value="low" className="hover:bg-green-50">Low</SelectItem>
                                            <SelectItem value="medium" className="hover:bg-yellow-50">Medium</SelectItem>
                                            <SelectItem value="high" className="hover:bg-orange-50">High</SelectItem>
                                            <SelectItem value="critical" className="hover:bg-red-50">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                                <div>
                                    <Label className="mb-3">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: any) => handleChange("status", value)}
                                    >
                                        <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-blue-300">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent className="animate-in fade-in zoom-in-95 duration-200">
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="investigating">Investigating</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="false_positive">False Positive</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                                <Label className="mb-3">Alert Type</Label>
                                <Input
                                    value={formData.alert_type}
                                    onChange={(e) =>
                                        handleChange("alert_type", e.target.value)
                                    }
                                    className="transition-all focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
                            <Button 
                                variant="outline" 
                                onClick={handleCancel}
                                className="transition-all hover:scale-105"
                            >
                                Hủy
                            </Button>
                            <Button 
                                onClick={handleSave}
                                className="transition-all hover:scale-105 hover:shadow-md"
                            >
                                {editingAlert ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
