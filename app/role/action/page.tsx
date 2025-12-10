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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
import { useGlobalContext } from "@/context/GlobalContext";

// TODO: Đổi sang API thực tế của bạn
import {
    getRolesAction,
    createAction,
    updateAction,
    deleteAction,
} from "@/api/role";
import { getCategory } from "@/api/categor";

interface Action {
    id: string;
    display_name: string;
    url: string;
    description?: string | null;
    method: string;
    is_active: boolean;
    created_at?:string;
    method_category: {
        id: string;
        category_type_id: string;
        display_name: string;
    };
}

export default function ActionManagement() {
    const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
    const [method, setMethod] = useState<any>([])
    const [actions, setActions] = useState<Action[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAction, setEditingAction] = useState<Action | null>(null);

    const [formData, setFormData] = useState<
        Omit<Action, "id" | "method_category">
    >({
        display_name: "",
        url: "",
        description: "",
        method: "",
        is_active: true,
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
        }, 3000);
    };

    const handleEdit = (action: Action) => {
        setEditingAction(action);
        const { id, method_category, ...rest } = action;
        setFormData(rest);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteAction(id);
        fetchActions(pageIndex);
        setIsRefreshMenu(!isRefreshMenu);
        showAlert("Xóa action thành công", "success");
    };

    const handleSave = async () => {
        if (editingAction) {
            const {created_at,...rest} = formData
            await updateAction(editingAction.id, rest);
            showAlert("Cập nhật action thành công", "success");
        } else {
            await createAction(formData);
            showAlert("Thêm action thành công", "success");
        }
        setIsModalOpen(false);
        setEditingAction(null);
        fetchActions(pageIndex);
        setIsRefreshMenu(!isRefreshMenu);
    };

    const handleChange = (
        field: keyof typeof formData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleActiveToggle = async (action: Action) => {
        await updateAction(action.id, {
            ...action,
            is_active: !action.is_active,
        });
        fetchActions(pageIndex);
        showAlert("Cập nhật trạng thái thành công", "success");
    };
    const fetchSelect = async (page: number) => {
        try {
            const res = await getCategory({ pageSize: 1000, pageIndex: page, scope: "ACTION" });
            setMethod(res.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })));

        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };
    const fetchActions = async (page: number) => {
        try {
            const res = await getRolesAction({ pageSize, pageIndex: page });
            setActions(res.data.rows);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };

    useEffect(() => {
        fetchActions(pageIndex);
    }, [pageIndex]);
    useEffect(() => {
        fetchSelect(1);
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 p-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {message && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <Alert
                        className={`rounded-xl shadow-lg ${status === "success"
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "bg-red-100 border-red-500 text-red-800"
                            }`}
                    >
                        {status === "success" ? (
                            <CheckCircle className="h-5 w-5 animate-bounce" />
                        ) : (
                            <XCircle className="h-5 w-5 animate-pulse" />
                        )}
                        <AlertTitle>
                            {status === "success" ? "Thành công" : "Lỗi"}
                        </AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                {/* Thanh search + Thêm mới */}
                <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm hành động..."
                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setIsModalOpen(true);
                            setFormData({
                                display_name: "",
                                url: "",
                                description: "",
                                method: "",
                                is_active: true,
                            });
                        }}
                        className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" /> Thêm hành động
                    </Button>
                </div>

                {/* Table */}
                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>STT</TableHead>
                            <TableHead>Đường dẫn</TableHead>
                            <TableHead>Tên hiển thị</TableHead>
                            <TableHead>Phương thức</TableHead>
                            <TableHead>Mô tả</TableHead>
                            {/* <TableHead>Hoạt động</TableHead> */}
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {actions.map((a, i) => (
                            <TableRow 
                                key={a.id}
                                className="transition-all duration-200 hover:bg-blue-50 animate-in fade-in slide-in-from-left-4"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs px-2 py-1 bg-gray-100 rounded">
                                        {a.url}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        {a.display_name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {a.method_category?.display_name ? (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {a.method_category.display_name}
                                        </span>
                                    ) : "-"}
                                </TableCell>
                                <TableCell>{a.description || "-"}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={a.is_active}
                                        onCheckedChange={() => handleActiveToggle(a)}
                                        className="transition-transform duration-200 hover:scale-110"
                                    />
                                </TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(a)}
                                        className="transition-all duration-200 hover:scale-105 hover:border-blue-500"
                                    >
                                        <Edit className="w-4 h-4" /> Sửa
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                className="transition-all duration-200 hover:scale-105"
                                            >
                                                <Trash2 className="w-4 h-4" /> Xóa
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="animate-in zoom-in-95 fade-in duration-200">
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

                {/* Pagination */}
                <div className="flex items-center justify-end mt-4 space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={pageIndex === 1}
                        onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))}
                        className="p-1 transition-all duration-200 hover:scale-105 hover:border-blue-500"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={pageIndex === totalPages}
                        onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
                        className="p-1 transition-all duration-200 hover:scale-105 hover:border-blue-500"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Modal thêm/sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold">
                                {editingAction ? "Sửa action" : "Thêm action"}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="transition-transform duration-200 hover:scale-110 hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "100ms" }}>
                                <Label className="mb-3">Tên hiển thị</Label>
                                <Input
                                    value={formData.display_name}
                                    onChange={(e) =>
                                        handleChange("display_name", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "150ms" }}>
                                <Label className="mb-3">Endpoint (URL)</Label>
                                <Input
                                    value={formData.url}
                                    onChange={(e) => handleChange("url", e.target.value)}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "200ms" }}>
                                <Label className="mb-3">Phương thức</Label>
                                <Select
                                    value={formData.method}
                                    onValueChange={(val) => handleChange("method", val)}
                                >
                                    <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                                        <SelectValue placeholder="Chọn phương thức" />
                                    </SelectTrigger>
                                    <SelectContent className="animate-in zoom-in-95 fade-in duration-200">
                                        {
                                            method.map((item: any) => (
                                                <SelectItem key={item.value} value={item.value} className="transition-colors duration-150 hover:bg-blue-50">{item.label}</SelectItem>
                                            ))
                                        }
                                        {/* <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                        <SelectItem value="PATCH">PATCH</SelectItem> */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "250ms" }}>
                                <Label className="mb-3">Mô tả</Label>
                                <Input
                                    value={formData.description || ""}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <Label>Hoạt động</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        handleChange("is_active", checked)
                                    }
                                />
                            </div> */}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="transition-all duration-200 hover:scale-105"
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleSave} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
                                {editingAction ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
