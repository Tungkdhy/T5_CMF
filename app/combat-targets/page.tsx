"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getCombatTargets,
  createCombatTarget,
  updateCombatTarget,
  deleteCombatTarget,
} from "@/api/combat-targets";
import { getCategory } from "@/api/categor";

interface CombatTarget {
  id: string;
  target_name: string;
  target_url: string;
  combat_status: string;
  description: string;
  created_at: string;
  type_target?: string;
  target_tctt?: string;
  type_target_name?: string;
  target_tctt_name?: string;
}

const COMBAT_STATUS_OPTIONS = [
  { value: "monitoring", label: "Đang theo dõi" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "completed", label: "Hoàn thành" },
];

export default function CombatTargetsPage() {
  const [targets, setTargets] = useState<CombatTarget[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<CombatTarget | null>(null);
  const [typeTarget, setTypeTarget] = useState<any[]>([]);
  const [typeTargetTC, setTypeTargetTC] = useState<any[]>([]);
  const [formData, setFormData] = useState<Omit<CombatTarget, "id" | "created_at">>({
    target_name: "",
    target_url: "",
    combat_status: "monitoring",
    description: "",
    type_target: "",
    target_tctt: "",
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

  const handleEdit = (target: CombatTarget) => {
    setEditingTarget(target);
    const { id, created_at, ...rest } = target;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCombatTarget(id);
      fetchTargets(pageIndex, searchTerm);
      showAlert("Xóa mục tiêu thành công", "success");
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Xóa mục tiêu thất bại", "error");
    }
  };

  const handleSave = async () => {
    try {
      // Loại bỏ các field _name khi gửi lên server
      const { type_target_name, target_tctt_name,type_target,target_tctt, ...dataToSend } = formData;
      
      if (editingTarget) {
        await updateCombatTarget(editingTarget.id, dataToSend);
        showAlert("Cập nhật mục tiêu thành công", "success");
      } else {
        await createCombatTarget(dataToSend);
        showAlert("Thêm mục tiêu thành công", "success");
      }
      setIsModalOpen(false);
      setEditingTarget(null);
      fetchTargets(pageIndex, searchTerm);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Lưu mục tiêu thất bại", "error");
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTarget(null);
  };

  const fetchTargets = async (page: number, search: string) => {
    try {
      const res = await getCombatTargets({ pageSize, pageIndex: page });
      const data = res.data.data;
      setTargets(data.items || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Lấy danh sách thất bại", "error");
    }
  };

  const fetchSelect = async () => {
    try {
      const res = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "OBJECT_TCTT" });
      const res2 = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "OBJECT" });
      setTypeTarget(res.data.rows);
      setTypeTargetTC(res2.data.rows);
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchSelect();
  }, []);

  useEffect(() => {
    fetchTargets(pageIndex, searchTerm);
  }, [pageIndex]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchTargets(1, searchTerm);
  };

  const getStatusLabel = (status: string) => {
    const option = COMBAT_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "monitoring":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mục tiêu tác chiến</h1>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setEditingTarget(null);
              setFormData({
                target_name: "",
                target_url: "",
                combat_status: "monitoring",
                description: "",
                type_target: "",
                target_tctt: "",
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm mục tiêu
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên mục tiêu..."
              className="pl-10"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              onKeyPress={(e: any) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Tìm kiếm
          </Button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{total}</span> mục tiêu
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead>Tên mục tiêu</TableHead>
              <TableHead>URL mục tiêu</TableHead>
              <TableHead>Loại mục tiêu</TableHead>
              <TableHead>Hướng tác chiến</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              targets.map((target, i) => (
                <TableRow key={target.id}>
                  <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium">{target.target_name}</TableCell>
                  <TableCell>
                    <a
                      href={target.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {target.target_url}
                    </a>
                  </TableCell>
                  <TableCell>{target.type_target_name || "-"}</TableCell>
                  <TableCell>{target.target_tctt_name || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        target.combat_status
                      )}`}
                    >
                      {getStatusLabel(target.combat_status)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{target.description || "-"}</TableCell>
                  <TableCell>{new Date(target.created_at).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(target)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <p className="mb-2">Bạn có chắc muốn xóa mục tiêu này?</p>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            Hủy
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(target.id)}>
                            Xóa
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
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
            disabled={pageIndex === totalPages || totalPages === 0}
            onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
            className="p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingTarget ? "Sửa mục tiêu tác chiến" : "Thêm mục tiêu tác chiến"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label className="mb-1">
                  Tên mục tiêu <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.target_name}
                  onChange={(e) => handleChange("target_name", e.target.value)}
                  placeholder="Nhập tên mục tiêu"
                />
              </div>

              <div>
                <Label className="mb-1">
                  URL mục tiêu <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.target_url}
                  onChange={(e) => handleChange("target_url", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* <div>
                <Label className="mb-1">Loại mục tiêu</Label>
                <Select
                  value={formData.type_target ?? ""}
                  onValueChange={(val) => handleChange("type_target", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại mục tiêu">
                      {typeTarget?.find((x: any) => x.id === formData.type_target)?.display_name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {typeTarget?.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div>
                <Label className="mb-1">Hướng tác chiến</Label>
                <Select
                  value={formData.target_tctt ?? ""}
                  onValueChange={(val) => handleChange("target_tctt", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn hướng tác chiến">
                      {typeTargetTC?.find((x: any) => x.id === formData.target_tctt)?.display_name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {typeTargetTC?.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1">Trạng thái tác chiến</Label>
                <Select
                  value={formData.combat_status}
                  onValueChange={(val) => handleChange("combat_status", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMBAT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1">Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Nhập mô tả về mục tiêu..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.target_name || !formData.target_url}
              >
                {editingTarget ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

