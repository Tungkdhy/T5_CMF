"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, XCircle, CheckCircle, Search, FileSpreadsheet } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLogs, deleteLog } from "@/api/logs"; // API giả lập
import { exportExcel } from "@/api/excel";

interface Log {
    id: string;
    action_name: string;
    description: string | null;
    is_active: boolean;
    user: {
        display_name: string;
        user_name: string;
    };
    log_type: {
        id: string;
        display_name: string;
        value: string;
    } | null;
}

export default function LogManagement() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLogType, setSelectedLogType] = useState<string | null>(null);
    const [modalLog, setModalLog] = useState<Log | null>(null);

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

    const fetchLogs = async (page: number) => {
        try {
            const res = await getLogs({ pageSize, pageIndex: page, searchTerm, logTypeId: selectedLogType || "" });
            let filtered = res.data.rows;

            // if (searchTerm) {
            //     filtered = filtered.filter((log: Log) =>
            //         log.action_name.toLowerCase().includes(searchTerm.toLowerCase())
            //     );
            // }

            // if (selectedLogType) {
            //     filtered = filtered.filter((log: Log) => log.log_type?.display_name === selectedLogType);
            // }

            setLogs(filtered);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách log thất bại", "error");
        }
    };

    const handleDelete = async (id: string) => {
        await deleteLog(id);
        fetchLogs(pageIndex);
        showAlert("Xóa log thành công", "success");
    };

    useEffect(() => {
        fetchLogs(pageIndex);
    }, [pageIndex, searchTerm, selectedLogType]);
    const handleExportExcel = async () => {
        try {
            // const res = await api.get("/system-parameters/export", {
            //   params: { pageSize, pageIndex },
            // });
            // const url = window.URL.createObjectURL(new Blob([res.data]));
            // const link = document.createElement("a");
            // link.href = url;
            // link.setAttribute("download", "system_parameters.xlsx");
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            const res = await exportExcel("logs");
            const workbook = XLSX.read(res, { type: "string" });

            // 2. Lấy sheet đầu tiên từ CSV
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // 3. Tạo workbook mới & append sheet với tên "Tham số"
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Người dùng");

            // 4. Ghi workbook ra buffer Excel
            const excelBuffer = XLSX.write(newWorkbook, {
                bookType: "xlsx",
                type: "array",
            });

            // 5. Tạo file blob và tải về
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "nguoi_dung.xlsx");


        } catch (err) {
            console.error("Export failed:", err);
            showAlert("Xuất Excel thất bại", "error");
        }
    };
    // Lấy danh sách loại log duy nhất để lọc
    const logTypes = Array.from(new Set(logs.map((l) => l.log_type?.display_name).filter(Boolean))) as string[];

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
                        {status === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                <div className="flex flex-wrap items-center mb-3 gap-2">
                    <div className="relative  min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm log..."
                            className="pl-10 w-[240px]"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-[240px]">
                        <Select onValueChange={(v) => setSelectedLogType(v || null)} value={selectedLogType || ""}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Lọc theo loại log" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={'0'} value={'0'}>
                                    Hệ thống
                                </SelectItem>
                                <SelectItem key={'1'} value={'1'}>
                                    Đăng nhập
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Xuất Excel
                    </Button>
                </div>

                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Hành động</TableHead>
                            <TableHead>Loại log</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log, i) => (
                            <TableRow key={log.id}>
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>{log.user?.display_name}</TableCell>
                                <TableCell>{log.action_name}</TableCell>
                                <TableCell>{log.log_type?.display_name || "-"}</TableCell>
                                <TableCell>{log.description || "-"}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => setModalLog(log)}>
                                        Xem
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="w-4 h-4" /> Xóa
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <p>Bạn có chắc muốn xóa log này?</p>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button size="sm" variant="outline" onClick={() => { }}>
                                                    Hủy
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)}>
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

            {/* Modal chi tiết log */}
            {modalLog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Chi tiết log</h3>
                            <Button variant="ghost" size="sm" onClick={() => setModalLog(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-2">
                            <p>
                                <strong>Người dùng:</strong> {modalLog.user.display_name} ({modalLog.user.user_name})
                            </p>
                            <p>
                                <strong>Hành động:</strong> {modalLog.action_name}
                            </p>
                            <p>
                                <strong>Loại log:</strong> {modalLog.log_type?.display_name || "-"}
                            </p>
                            <p>
                                <strong>Mô tả:</strong> {modalLog.description || "-"}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong> {modalLog.is_active ? "Active" : "Inactive"}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={() => setModalLog(null)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
