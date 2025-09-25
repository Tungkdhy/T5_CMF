"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, X, XCircle, CheckCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ⚡️ Thay bằng API thật của bạn
import {
    getReport,
    getReportById,
    createReport,
    updateReport,
    deleteReport
} from "@/api/reports";
import { getCategory } from "@/api/categor";
import api from "@/api/base";
import axios from "axios";
// Report Data Interface
interface Report {
    id: string;
    report_name: string;
    level_id: string;
    report_status: "draft" | "published";
    description: string;
    level_name?: string;
    url?: string;
}

export default function ReportManagementPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [level, setLevel] = useState<any>([])
    const [reload, setReload] = useState(false)
    const [formData, setFormData] = useState<Report>({
        id: "",
        report_name: "",
        level_id: "",
        report_status: "draft",
        description: "",
        url: "",

    });

    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 3000);
    };

    // Search
    const filteredReports = reports.filter(
        (report) =>
            report.report_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (report: Report) => {
        setEditingReport(report);
        setFormData(report);
        setErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteReport(id);
        if (res) {
            setReports((prev) => prev.filter((r) => r.id !== id));
            showAlert("Xóa thành công", "success");
        } else {
            showAlert("Xóa thất bại", "error");
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.report_name.trim()) newErrors.report_name = "Tên báo cáo bắt buộc";
        if (!formData.description.trim()) newErrors.description = "Mô tả bắt buộc";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddReport = () => {
        setEditingReport(null);
        setFormData({
            id: "",
            report_name: "",
            level_id: "",
            report_status: "draft",
            description: "",
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSaveReport = async () => {
        if (!validateForm()) return;

        if (editingReport) {
            const res = await updateReport(formData.id, formData);
            if (res) {
                setReports((prev) =>
                    prev.map((r) => (r.id === formData.id ? { ...r, ...formData } : r))
                );
                showAlert("Cập nhật thành công", "success");
                setReload(!reload)
            }
        } else {
            const res = await createReport(formData);
            if (res) {
                setReports((prev) => [...prev, { ...formData, id: res.data.id }]);
                showAlert("Thêm mới thành công", "success");
                setReload(!reload)
            }
        }
        setIsModalOpen(false);
    };

    const handleChange = (field: keyof Report, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    const downloadFile = async (fileUrl: string, filename: string) => {
        try {
            console.log(fileUrl);
            
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const response = await axios.get(fileUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Accept: "application/octet-stream", // thường cần cho API download
                },
                responseType: "blob", // quan trọng để nhận file nhị phân
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        }
    };
    // Fetch reports
    useEffect(() => {
        const fetchReports = async () => {
            const data = await getReport({
                pageSize: 10,
                pageIndex: 1,
                name: searchTerm,
            });
            setReports(data.data.rows);
        };
        fetchReports();
    }, [searchTerm, reload]);
    useEffect(() => {
        const fetchLevel = async () => {
            const data = await getCategory({
                pageSize: 10,
                pageIndex: 1,
                scope: "LEVEL_REPORT",
            });
            setLevel(data.data.rows);
        };
        fetchLevel();
    }, [searchTerm]);
    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {/* Alert */}
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

            <div className="mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* Search + Add */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative ">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm báo cáo..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddReport} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm báo cáo
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        STT
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tên báo cáo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Mô tả
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Cấp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        File
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReports.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.report_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.report_status}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.level_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <button
                                                onClick={() => downloadFile(`http://10.10.53.58:3002/${item.url}`, `${item.url}`)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Tải file
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Sửa
                                                </Button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Xóa
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56">
                                                        <p className="text-sm mb-3">Bạn có chắc muốn xóa báo cáo này?</p>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm">
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {reports.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Không tìm thấy báo cáo
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Không có báo cáo nào phù hợp với tìm kiếm của bạn.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-semibold">
                                {editingReport ? "Chỉnh sửa báo cáo" : "Thêm báo cáo mới"}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="p-0 h-auto"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <Label className="mb-3">Chọn file</Label>
                                <Input
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // upload file lên server
                                            const formDataUpload = new FormData();
                                            formDataUpload.append("file", file);

                                            try {
                                                const res = await api.post("/documents/upload", formDataUpload, {
                                                    headers: {
                                                        "Content-Type": "multipart/form-data",
                                                    },
                                                });
                                                console.log(res);
                                                const data = res.data.data;

                                                // giả sử API trả về { file_path: "...", file_name: "..." }
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    // file_name: data.file_name || file.name,
                                                    url: data.file_path,
                                                    // file_size: data.file_size || file.size.toString(),
                                                    // description: data.description || "",
                                                    // document_type: data.file_path.split(".")[1] || "",
                                                }));
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <Label className="mb-3" htmlFor="report_name">
                                    Tên báo cáo
                                </Label>
                                <Input
                                    id="report_name"
                                    value={formData.report_name || ""}
                                    onChange={(e) => handleChange("report_name", e.target.value)}
                                    className={errors.report_name ? "border-red-500" : ""}
                                />
                                {errors.report_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.report_name}</p>
                                )}
                            </div>

                            <div>
                                <Label className="mb-3" htmlFor="description">
                                    Mô tả
                                </Label>
                                <Input
                                    id="description"
                                    value={formData.description || ""}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <Label className="mb-3" htmlFor="report_status">
                                    Trạng thái
                                </Label>
                                <Select
                                    value={formData.report_status}

                                    onValueChange={(value) => handleChange("report_status", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-3" htmlFor="level_id">
                                    Cấp
                                </Label>
                                <Select
                                    value={formData.level_id}
                                    onValueChange={(value) => handleChange("level_id", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn cấp báo cáo" />
                                    </SelectTrigger>
                                    <SelectContent>

                                        {
                                            level.map((item: any) => <SelectItem value={item.id}>{item.display_name}</SelectItem>)
                                        }


                                    </SelectContent>
                                </Select>
                                {/* {errors.level_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.level_id}</p>
                            )} */}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-4 border-t">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSaveReport}>
                                {editingReport ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
