"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, X, XCircle, CheckCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Config {
  id: string;
  display_name: string;
  value: string;
  description: string;
  data: {
    min?: number;
    max?: number;
    unit?: string;
    default_value?: string;
    display_value?: string;
    options?: string[];
  };
}

// Fake API dùng dữ liệu mẫu
let configData: Config[] = [
  {
    id: "3f99b10d-f8ab-485c-8796-ae6d568ae5d5",
    display_name: "Max File Upload Size",
    value: "max_file_upload_size",
    description: "Maximum file size allowed for upload (in bytes) - Default: 25MB",
    data: { max: 104857600, min: 1048576, unit: "bytes", default_value: "26214400", display_value: "25 MB" },
  },
  {
    id: "fab989af-a810-4484-aaef-f99d1e408df8",
    display_name: "Auto Backup Interval",
    value: "auto_backup_interval",
    description: "Automatic backup interval in hours - Default: 24 hours",
    data: { max: 168, min: 1, unit: "hours", default_value: "24", display_value: "24 hours" },
  },
  {
    id: "bf2ac19c-8b92-4f66-8b06-0d462d23f75d",
    display_name: "Backup Retention Days",
    value: "backup_retention_days",
    description: "Number of days to keep backup files - Default: 30 days",
    data: { max: 365, min: 1, unit: "days", default_value: "30", display_value: "30 days" },
  },
];

// Fake API functions
const getConfigs = async ({ pageSize = 10, pageIndex = 1 }) => {
  const start = (pageIndex - 1) * pageSize;
  const end = start + pageSize;
  return { data: configData.slice(start, end), count: configData.length };
};

const updateConfig = async (id: string, updated: Partial<Config>) => {
  configData = configData.map((c) => (c.id === id ? { ...c, ...updated, data: { ...c.data, ...updated.data } } : c));
  return true;
};

const deleteConfig = async (id: string) => {
  configData = configData.filter((c) => c.id !== id);
  return true;
};

// Component chính
export default function ConfigManagement() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState<Config | null>(null);
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

  const fetchConfigs = async (page = 1) => {
    try {
      const res = await getConfigs({ pageIndex: page, pageSize });
      let filtered = res.data;
      if (searchTerm) {
        filtered = filtered.filter((c) => c.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setConfigs(filtered);
      setTotalPages(Math.ceil(res.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchConfigs(pageIndex);
  }, [pageIndex, searchTerm]);

  const handleEdit = (c: Config) => {
    setEditingConfig(c);
    setFormData({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteConfig(id);
    fetchConfigs(pageIndex);
    showAlert("Xóa cấu hình thành công", "success");
  };

  const handleSave = async () => {
    if (editingConfig && formData) {
      await updateConfig(editingConfig.id, formData);
      showAlert("Cập nhật cấu hình thành công", "success");
      fetchConfigs(pageIndex);
      setIsModalOpen(false);
      setEditingConfig(null);
    }
  };

  const handleChange = (field: string, value: any, nested = false) => {
    if (!formData) return;
    if (nested) {
      setFormData({ ...formData, data: { ...formData.data, [field]: value } });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

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
        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm cấu hình..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên</TableHead>
              {/* <TableHead>Key</TableHead> */}
              <TableHead>Giá trị hiển thị</TableHead>
              <TableHead>Tối thiểu</TableHead>
              <TableHead>Tối đa</TableHead>
              <TableHead>Mặc định</TableHead>
              <TableHead>Đơn vị</TableHead>
              {/* <TableHead>Mô tả</TableHead> */}
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>{c.display_name}</TableCell>
                {/* <TableCell>{c.value}</TableCell> */}
                <TableCell>{c.data.display_value}</TableCell>
                <TableCell>{c.data.min ?? "-"}</TableCell>
                <TableCell>{c.data.max ?? "-"}</TableCell>
                <TableCell>{c.data.default_value ?? "-"}</TableCell>
                <TableCell>{c.data.unit ?? "-"}</TableCell>
                {/* <TableCell>{c.description}</TableCell> */}
                <TableCell className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>
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
                        <Button size="sm" variant="outline" onClick={() => {}}>
                          Hủy
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
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

      {/* Modal sửa full */}
      {isModalOpen && formData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Sửa cấu hình</h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Tên hiển thị</Label>
                <Input value={formData.display_name} onChange={(e) => handleChange("display_name", e.target.value)} />
              </div>
              <div>
                <Label>Key</Label>
                <Input value={formData.value} onChange={(e) => handleChange("value", e.target.value)} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min</Label>
                  <Input
                    type="number"
                    value={formData.data.min ?? ""}
                    onChange={(e) => handleChange("min", Number(e.target.value), true)}
                  />
                </div>
                <div>
                  <Label>Max</Label>
                  <Input
                    type="number"
                    value={formData.data.max ?? ""}
                    onChange={(e) => handleChange("max", Number(e.target.value), true)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Default</Label>
                  <Input
                    value={formData.data.default_value ?? ""}
                    onChange={(e) => handleChange("default_value", e.target.value, true)}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={formData.data.unit ?? ""} onChange={(e) => handleChange("unit", e.target.value, true)} />
                </div>
              </div>
              <div>
                <Label>Giá trị hiển thị</Label>
                <Input
                  value={formData.data.display_value ?? ""}
                  onChange={(e) => handleChange("display_value", e.target.value, true)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave}>Cập nhật</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
