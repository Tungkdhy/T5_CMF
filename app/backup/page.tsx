"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// API giả lập
import { getBackups, deleteBackup, restoreBackup, createBackup } from "@/api/backup";

interface Backup {
  id: string;
  name: string;
  type: number;
  path: string;
  is_active: boolean;
  created_by: string | null;
  created_by_user: { id: string; display_name: string } | null;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const showAlert = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => {
      setMessage(null);
      setStatus(null);
    }, 3000);
  };

  const fetchBackups = async (page: number) => {
    try {
      const res = await getBackups({ pageIndex: page, pageSize });
      setBackups(res.data.rows);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách backup thất bại", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBackup(id);
    showAlert("Xóa bản backup thành công", "success");
    fetchBackups(pageIndex);
  };

  const handleRestore = async (id: string) => {
    await restoreBackup(id);
    showAlert("Phục hồi dữ liệu thành công", "success");
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup({type:0}); // Gọi API tạo backup
      showAlert("Backup thành công", "success");
      fetchBackups(pageIndex);
    } catch (err) {
      console.error(err);
      showAlert("Tạo backup thất bại", "error");
    }
  };

  useEffect(() => {
    fetchBackups(pageIndex);
  }, [pageIndex]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
          <Alert
            className={`rounded-xl shadow-lg ${
              status === "success"
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
        {/* Nút backup dữ liệu */}
        <div className="flex justify-end mb-3">
          <Button size="sm" variant="default" onClick={handleCreateBackup} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Backup dữ liệu
          </Button>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên bản sao lưu</TableHead>
              <TableHead>Đường dẫn</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead className="w-[180px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.map((b, i) => (
              <TableRow key={b.id}>
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.path}</TableCell>
                <TableCell>
                  <Switch checked={b.is_active} disabled />
                </TableCell>
                <TableCell>{b.created_by_user?.display_name || "-"}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleRestore(b.id)}>
                    <RefreshCcw className="w-4 h-4" /> Phục hồi
                  </Button>
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
    </div>
  );
}
