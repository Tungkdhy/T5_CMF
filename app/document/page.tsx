"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGlobalContext } from "@/context/GlobalContext";

import { createDocument, deleteDocument, getDocuments, updateDocument } from "@/api/document";
import { getCategory } from "@/api/categor";
import api from "@/api/base";
import axios from "axios";

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_size: string;
  file_path: string;
  description: string;
  created_by_user: { display_name: string };
  document_type_category: { display_name: string };
  reload?: boolean;
}

export default function DocumentManagement() {
  const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Omit<Document, "id" | "created_by_user">>({
    document_type: "",
    file_name: "",
    file_size: "",
    file_path: "",
    description: "",
    document_type_category: { display_name: "" },
    reload: false,
  });
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
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

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    const { id, created_by_user, ...rest } = doc;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    fetchDocuments(pageIndex);
    setIsRefreshMenu(!isRefreshMenu);
    showAlert("Xóa tài liệu thành công", "success");
  };

  const handleSave = async () => {
    if (editingDocument) {
      await updateDocument(editingDocument.id, formData);
      showAlert("Cập nhật tài liệu thành công", "success");
    } else {
      await createDocument(formData);
      showAlert("Thêm tài liệu thành công", "success");
    }
    setIsModalOpen(false);
    setEditingDocument(null);
    fetchDocuments(pageIndex);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const fetchDocuments = async (page: number) => {
    try {
      const res = await getDocuments({ pageSize, pageIndex: page });
      let filtered = res.data.rows;
      if (searchTerm) {
        filtered = filtered.filter((d: Document) =>
          d.file_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setDocuments(filtered);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchDocuments(pageIndex);
  }, [pageIndex, formData.reload, searchTerm]);
  useEffect(() => {
    const fetchCategoryOptions = async () => {
      const res = await getCategory({ pageIndex: 1, pageSize: 100, scope: "DOCUMENT_TYPE" });
      setCategoryOptions(res.data.rows);
    };
    fetchCategoryOptions();
  }, []);
      const downloadFile = async (fileUrl: string, filename: string) => {
        try {
            console.log(fileUrl);
            
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const response = await axios.get('http://10.10.53.58:3002/' + fileUrl, {
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
              placeholder="Tìm kiếm tài liệu..."
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setFormData({
                document_type: "",
                file_name: "",
                file_size: "",
                file_path: "",
                description: "",
                document_type_category: { display_name: "" },
              });
            }}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Thêm tài liệu
          </Button>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>STT</TableHead>
              <TableHead>Tên file</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Loại tài liệu</TableHead>
              <TableHead>Link file</TableHead>
              <TableHead>Người tải lên</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((d, i) => (
              <TableRow 
                key={d.id}
                className="transition-all duration-200 hover:bg-blue-50 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {d.file_name}
                  </span>
                </TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell>
                  {d.document_type_category?.display_name ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {d.document_type_category.display_name}
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {d.file_path ? (
                    <a onClick={() => downloadFile(d.file_path, d.file_name)} style={{cursor: "pointer"}} className="text-blue-500 underline transition-colors duration-200 hover:text-blue-700">
                      Tải file
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{d.created_by_user?.display_name || "-"}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(d)}
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
                        <Button size="sm" variant="outline" onClick={() => { }}>
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

      {/* Modal thêm/sửa tài liệu */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold">
                {editingDocument ? "Sửa tài liệu" : "Thêm tài liệu"}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="transition-transform duration-200 hover:scale-110 hover:rotate-90">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {/* Upload file */}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "100ms" }}>
                <Label className="mb-3">Chọn file</Label>
                <Input
                  type="file"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
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
                          file_name: data.file_name || file.name,
                          file_path: data.file_path,
                          file_size: data.file_size || file.size.toString(),
                          description: data.description || "",
                          // document_type: data.file_path.split(".")[1] || "",
                        }));
                      } catch (err) {
                        console.error("Upload failed", err);
                      }
                    }
                  }}
                />
              </div>

              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "150ms" }}>
                <Label className="mb-3">Tên file</Label>
                <Input
                  value={formData.file_name}
                  onChange={(e) => handleChange("file_name", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "200ms" }}>
                <Label className="mb-3">Mô tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "250ms" }}>
                <Label className="mb-3">Loại tài liệu</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(v) => setFormData({ ...formData, document_type: v })}
                >
                  <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn loại tài liệu" />
                  </SelectTrigger>
                  <SelectContent className="animate-in zoom-in-95 fade-in duration-200">
                    {categoryOptions.map((item: any) => (
                      <SelectItem key={item.id} value={item.id} className="transition-colors duration-150 hover:bg-blue-50">
                        {item.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "300ms" }}>
                <Label className="mb-3">Đường dẫn file</Label>
                <Input
                  value={formData.file_path}
                  disabled // không cho nhập tay, chỉ fill sau khi upload
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button variant="outline" onClick={handleCancel} className="transition-all duration-200 hover:scale-105">
                Hủy
              </Button>
              <Button onClick={handleSave} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
                {editingDocument ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
