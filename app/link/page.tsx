"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGlobalContext } from "@/context/GlobalContext";

import { createSystemLink, deleteSystemLink, getSystemLinks, updateSystemLink } from "@/api/systemLink";

interface SystemLink {
  id: string;
  system_name: string;
  link_url: string;
  description: string;
}

export default function SystemLinkManagement() {
  const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
  const [links, setLinks] = useState<SystemLink[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SystemLink | null>(null);
  const [formData, setFormData] = useState<Omit<SystemLink, "id">>({
    system_name: "",
    link_url: "",
    description: "",
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

  const handleEdit = (link: SystemLink) => {
    setEditingLink(link);
    const { id, ...rest } = link;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSystemLink(id);
    fetchLinks(pageIndex);
    setIsRefreshMenu(!isRefreshMenu);
    showAlert("Xóa liên kết thành công", "success");
  };

  const handleSave = async () => {
    if (editingLink) {
      await updateSystemLink(editingLink.id, formData);
      showAlert("Cập nhật liên kết thành công", "success");
    } else {
      await createSystemLink(formData);
      showAlert("Thêm liên kết thành công", "success");
    }
    setIsModalOpen(false);
    setEditingLink(null);
    fetchLinks(pageIndex);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const fetchLinks = async (page: number) => {
    try {
      const res = await getSystemLinks({ pageSize, pageIndex: page });
      let filtered = res.data.rows;
      if (searchTerm) {
        filtered = filtered.filter((d: SystemLink) =>
          d.system_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setLinks(filtered);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchLinks(pageIndex);
  }, [pageIndex, searchTerm]);

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
              placeholder="Tìm kiếm hệ thống..."
              className="pl-10"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setFormData({ system_name: "", link_url: "", description: "" });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm liên kết
          </Button>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên hệ thống</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>{d.system_name}</TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell>
                  {d.link_url ? (
                    <a href={d.link_url} target="_blank" className="text-blue-500 underline">
                      Truy cập
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(d)}>
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
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>
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

      {/* Modal thêm/sửa liên kết */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{editingLink ? "Sửa liên kết" : "Thêm liên kết"}</h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label className="mb-3">Tên hệ thống</Label>
                <Input value={formData.system_name} onChange={(e) => handleChange("system_name", e.target.value)} />
              </div>
              <div>
                <Label className="mb-3">Mô tả</Label>
                <Input value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
              </div>
              <div>
                <Label className="mb-3">Link URL</Label>
                <Input value={formData.link_url} onChange={(e) => handleChange("link_url", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave}>{editingLink ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
