"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import { Edit, Trash2, X, XCircle, CheckCircle, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/api/base";
import { getCategory } from "@/api/categor";
import { exportExcel } from "@/api/excel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---- Types ----
interface Config {
  id: string;
  display_name: string;
  value: string;
  description: string;
  category_type_id?: string;
  data: {
    min?: number;
    max?: number;
    unit?: string;
    default_value?: string;
    display_value?: string;
    options?: string[];
  };
}

// ---- API Functions ----
export async function getParams({ pageSize = 10, pageIndex = 1, name = "", scope = "" }) {
  const res = await api.get("/category", {
    params: { pageSize, pageIndex, name, scope },
  });
  return res.data;
}

// Update parameter, bỏ các giá trị null
export async function updateParam(id: string, data: any, info: { display_name: string; value: string; description: string; category_type_id?: string }) {
  const cleanedData: any = {};
  Object.keys(data).forEach((k) => {
    if (data[k] !== null && data[k] !== undefined) cleanedData[k] = data[k];
  });
  const res = await api.put(`/system-parameters/${id}`, { ...info, data: cleanedData });
  return res.data;
}

// Create parameter mới, bỏ các giá trị null
export async function createParam(param: any) {
  const cleanedData: any = {};
  Object.keys(param.data || {}).forEach((k) => {
    if (param.data[k] !== null && param.data[k] !== undefined) cleanedData[k] = param.data[k];
  });
  const res = await api.post("/system-parameters", { ...param, data: cleanedData });
  return res.data;
}

// ---- Component ----
export default function ConfigManagement() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState<Config | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<Config>>({ data: {} });
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [unit, setUnit] = useState<any>([])
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
      const res = await getCategory({ pageSize, pageIndex: page, scope: "SYSTEM_PARAMS", name: searchTerm });
      setConfigs(res.data.rows || []);
      setTotalPages(Math.ceil((res.data.count || 0) / pageSize) || 1);
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchConfigs(pageIndex);
  }, [pageIndex, searchTerm]);

  // ---- CRUD Handlers ----
  const handleEdit = (c: Config) => {
    setEditingConfig(c);
    setFormData({ ...c });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/system-parameters/${id}`);
      showAlert("Xóa cấu hình thành công", "success");
      fetchConfigs(pageIndex);
    } catch {
      showAlert("Xóa thất bại", "error");
    }
  };

  const handleSaveEdit = async () => {
    if (editingConfig && formData) {
      await updateParam(editingConfig.id, { ...formData.data }, {
        description: formData.description,
        display_name: formData.display_name,
        value: formData.value,
        category_type_id: formData.category_type_id,
      });
      showAlert("Cập nhật cấu hình thành công", "success");
      fetchConfigs(pageIndex);
      setIsEditModalOpen(false);
      setEditingConfig(null);
    }
  };

  const handleAddNew = () => {
    setNewConfig({ data: {} });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = async () => {
    if (!newConfig.display_name || !newConfig.value) {
      showAlert("Tên hiển thị và Key là bắt buộc", "error");
      return;
    }
    try {
      await createParam(newConfig);
      showAlert("Thêm cấu hình thành công", "success");
      fetchConfigs(pageIndex);
      setIsAddModalOpen(false);
      setNewConfig({ data: {} });
    } catch {
      showAlert("Thêm cấu hình thất bại", "error");
    }
  };

  // ---- Form Helpers ----
  const handleChange = (field: string, value: any, nested = false) => {
    if (!formData) return;
    if (nested) setFormData({ ...formData, data: { ...formData.data, [field]: value } });
    else setFormData({ ...formData, [field]: value });
  };

  const handleNewChange = (field: string, value: any, nested = false) => {
    if (nested) setNewConfig({ ...newConfig, data: { ...newConfig.data, [field]: value } });
    else setNewConfig({ ...newConfig, [field]: value });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingConfig(null);
  };

  const handleCancelAdd = () => {
    setIsAddModalOpen(false);
    setNewConfig({ data: {} });
  };
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
      const res = await exportExcel("system-parameters");
      const workbook = XLSX.read(res, { type: "string" });

      // 2. Lấy sheet đầu tiên từ CSV
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // 3. Tạo workbook mới & append sheet với tên "Tham số"
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Tham số");

      // 4. Ghi workbook ra buffer Excel
      const excelBuffer = XLSX.write(newWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      // 5. Tạo file blob và tải về
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "tham_so_he_thong.xlsx");


    } catch (err) {
      console.error("Export failed:", err);
      showAlert("Xuất Excel thất bại", "error");
    }
  };
  const fetchStatus = async () => {
    try {
      const res = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "UNIT_OF_CALCULATION" });

      setUnit(res.data.rows);

    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchStatus();
  }, [])
  // ---- Render ----
  return (
    <div className="min-h-screen bg-gray-50 p-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <Alert className={`rounded-xl shadow-lg ${status === "success" ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800"}`}>
            {status === "success" ? <CheckCircle className="h-5 w-5 animate-bounce" /> : <XCircle className="h-5 w-5 animate-pulse" />}
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
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mb-3">
            <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Xuất csv
            </Button>
            <Button onClick={handleAddNew} className="transition-all duration-200 hover:scale-105 hover:shadow-md">+ Thêm mới</Button>
          </div>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Giá trị hiển thị</TableHead>
              <TableHead>Tối thiểu</TableHead>
              <TableHead>Tối đa</TableHead>
              <TableHead>Mặc định</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((c, i) => (
              <TableRow 
                key={c.id}
                className="transition-all duration-200 hover:bg-blue-50 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {c.display_name}
                  </span>
                </TableCell>
                <TableCell>{c.data?.display_value}</TableCell>
                <TableCell>{c.data?.min ?? "-"}</TableCell>
                <TableCell>{c.data?.max ?? "-"}</TableCell>
                <TableCell>{c.data?.default_value ?? "-"}</TableCell>
                <TableCell>
                  {c.data?.unit ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {c.data.unit}
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(c)}
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
                        <Button size="sm" variant="outline" onClick={() => { }}>Hủy</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Xóa</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end mt-4 space-x-2">
          <Button size="sm" variant="outline" disabled={pageIndex === 1} onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))} className="transition-all duration-200 hover:scale-105 hover:border-blue-500">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">Trang {pageIndex} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={pageIndex === totalPages} onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))} className="transition-all duration-200 hover:scale-105 hover:border-blue-500">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal sửa */}
      {isEditModalOpen && formData && (
        <ModalForm
          title="Sửa cấu hình"
          config={formData}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
          onChange={handleChange}
          unit={unit}
        />
      )}

      {/* Modal thêm mới */}
      {isAddModalOpen && (
        <ModalForm
          title="Thêm cấu hình mới"
          config={newConfig}
          onCancel={handleCancelAdd}
          onSave={handleSaveNew}
          onChange={handleNewChange}
          unit={unit}
        />
      )}
    </div>
  );
}

// ---- Component ModalForm ----
interface ModalFormProps {
  title: string;
  config: Partial<Config>;
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: string, value: any, nested?: boolean) => void;
  unit: any
}

function ModalForm({ title, config, onCancel, onSave, onChange, unit }: ModalFormProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onCancel} className="transition-transform duration-200 hover:scale-110 hover:rotate-90">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "100ms" }}>
            <Label className="mb-3">Tên hiển thị</Label>
            <Input value={config.display_name || ""} onChange={(e) => onChange("display_name", e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "150ms" }}>
            <Label className="mb-3">Key</Label>
            <Input value={config.value || ""} onChange={(e) => onChange("value", e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "200ms" }}>
            <Label className="mb-3">Mô tả</Label>
            <Input value={config.description || ""} onChange={(e) => onChange("description", e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "250ms" }}>
            <div>
              <Label className="mb-3">Tối thiểu</Label>
              <Input type="number" value={config.data?.min ?? ""} onChange={(e) => onChange("min", Number(e.target.value), true)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <Label className="mb-3">Tối đa</Label>
              <Input type="number" value={config.data?.max ?? ""} onChange={(e) => onChange("max", Number(e.target.value), true)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "300ms" }}>
            <div>
              <Label className="mb-3">Mặc định</Label>
              <Input value={config.data?.default_value ?? ""} onChange={(e) => onChange("default_value", e.target.value, true)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <Label className="mb-3">Đơn vị tính</Label>
              <Select
                value={config.data?.unit ?? ""}
                onValueChange={(value: any) => onChange("unit", value, true)}
              >
                <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn đơn vị tính" />
                </SelectTrigger>
                {/* low, medium, high, critical */}
                <SelectContent className="animate-in zoom-in-95 fade-in duration-200">
                  {
                    unit.map((item: any) => (<SelectItem key={item.id} value={item.value} className="transition-colors duration-150 hover:bg-blue-50">{item.display_name}</SelectItem>))
                  }

                  {/* <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

          </div>
          <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "350ms" }}>
            <Label className="mb-3">Giá trị hiển thị</Label>
            <Input value={config.data?.display_value ?? ""} onChange={(e) => onChange("display_value", e.target.value, true)} className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onCancel} className="transition-all duration-200 hover:scale-105">Hủy</Button>
          <Button onClick={onSave} className="transition-all duration-200 hover:scale-105 hover:shadow-md">Lưu</Button>
        </div>
      </div>
    </div>
  );
}
