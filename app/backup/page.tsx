"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// API giả lập
import { getBackups, deleteBackup, restoreBackup, createBackup, deleteBackupAll } from "@/api/backup";

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
    } catch (err:any) {
      console.error(err);
      showAlert(err.response?.data.message, "error");
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
      await createBackup({ type: 0 }); // Gọi API tạo backup
      showAlert("Backup thành công", "success");
      fetchBackups(pageIndex);
    } catch (err) {
      console.error(err);
      showAlert("Tạo backup thất bại", "error");
    }
  };
  const handleDeleteBackup = async () => {
    try {
      await deleteBackupAll(); // Gọi API xóa backup
      showAlert("Xóa backup thành công", "success");
      fetchBackups(pageIndex);
    } catch (err) {
      console.error(err);
      showAlert("Xóa backup thất bại", "error");
    }
  };

  useEffect(() => {
    fetchBackups(pageIndex);
  }, [pageIndex]);

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
            {status === "success" ? <CheckCircle className="h-5 w-5 animate-bounce" /> : <XCircle className="h-5 w-5 animate-shake" />}
            <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Nút backup dữ liệu */}
        <div className="flex justify-end gap-2 mb-3">
          <Button 
            size="sm" 
            variant="default" 
            onClick={handleCreateBackup} 
            className="flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Backup dữ liệu
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleDeleteBackup} 
            className="flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md"
          >
            <Trash2 className="w-4 h-4" /> Xóa dữ liệu
          </Button>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-50">
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
              <TableRow 
                key={b.id}
                className="animate-in fade-in slide-in-from-left-2 hover:bg-blue-50/50 transition-colors"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
              >
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {b.path}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch checked={b.is_active} disabled className="transition-all" />
                </TableCell>
                <TableCell>{b.created_by_user?.display_name || "-"}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleRestore(b.id)}
                    className="transition-all hover:scale-105 hover:border-green-400 hover:text-green-600"
                  >
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
    </div>
  );
}
