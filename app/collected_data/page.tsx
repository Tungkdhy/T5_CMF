"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
// giả lập API
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/api/collected_data";
import { getTargets } from "@/api/targets";
import { getDocuments as getDocument } from "@/api/document";
interface DocumentItem {
    id: string;
    document_id: string;
    target_id?: string | null;
    description: string;
    document: {
        id: string;
        file_name: string;
        file_size: string;
    };
    target?: any | null;
}

export default function DocumentManagement() {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [targets, setTargets] = useState<any[]>([]); // Giả sử bạn có API getTargets
    const [formData, setFormData] = useState<{
        file_id: string;
        target_id: string;
        description: string;
    }>({
        file_id: "",
        target_id: "",
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

    const fetchDocuments = async (page: number) => {
        try {
            const res = await getDocuments({ pageIndex: page, pageSize });
            setDocuments(res.data.items);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };

    useEffect(() => {
        fetchDocuments(pageIndex);
    }, [pageIndex]);

    const handleEdit = (doc: DocumentItem) => {
        setEditingDoc(doc);
        setFormData({
            file_id: doc.document.id,
            target_id: doc.target_id || "",
            description: doc.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteDocument(id);
        fetchDocuments(pageIndex);
        showAlert("Xóa document thành công", "success");
    };

    const handleSave = async () => {
        if (editingDoc) {
            await updateDocument(editingDoc.id, {
                document_id: formData.file_id,
                target_id: formData.target_id || null,
                description: formData.description,
            });
            showAlert("Cập nhật document thành công", "success");
        } else {
            await createDocument({
                document_id: formData.file_id,
                target_id: formData.target_id || null,
                description: formData.description,
            });
            showAlert("Thêm document thành công", "success");
        }
        setIsModalOpen(false);
        setEditingDoc(null);
        fetchDocuments(pageIndex);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingDoc(null);
    };
useEffect(() => {
  const fetchSelectData = async () => {
    try {
      // Lấy danh sách file từ API
      const fileRes = await getDocument({ pageIndex: 1, pageSize: 100 });
      setFiles(fileRes.data.rows);

      // Lấy danh sách target từ API (giả sử bạn có API getTargets)
      const targetRes = await getTargets({ pageIndex: 1, pageSize: 100 });
      setTargets(targetRes.data.items);

      // Set formData nếu đang edit
      if (editingDoc) {
        setFormData({
          file_id: editingDoc.document.id,
          target_id: editingDoc.target_id || "",
          description: editingDoc.description,
        });
      }
    } catch (error) {
      console.error("Lỗi khi load file hoặc target", error);
    }
  };

  fetchSelectData();
}, [editingDoc]);
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
                <div className="flex items-center justify-between mb-3">
                    {/* <h2 className="text-lg font-semibold">Danh sách Documents</h2> */}
                    <div></div>
                    <Button
                        onClick={() => {
                            setIsModalOpen(true);
                            setFormData({ file_id: "", target_id: "", description: "" });
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm tài liệu
                    </Button>
                </div>

                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên file</TableHead>
                            <TableHead>Kích thước (KB)</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Mục tiêu</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, i) => (
                            <TableRow key={doc.id}>
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>{doc.document?.file_name}</TableCell>
                                <TableCell>{(Number(doc.document?.file_size) / 1024).toFixed(2)}</TableCell>
                                <TableCell>{doc.description}</TableCell>
                                <TableCell>{doc.target ? doc.target.name : "-"}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>
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
                                                <Button size="sm" variant="outline">
                                                    Hủy
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
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

            {/* Modal thêm / sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{editingDoc ? "Sửa document" : "Thêm document"}</h3>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Lựa chọn file */}
                            <div>
                                <Label className="mb-3">Chọn tài liệu</Label>
                                <Select
                                    value={formData.file_id || ""}
                                    onValueChange={(value) =>
                                        setFormData((p) => ({ ...p, file_id: value }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Chọn file --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {files.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.file_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Lựa chọn mục tiêu */}
                            <div>
                                <Label className="mb-3">Chọn mục tiêu</Label>
                                <Select
                                    value={formData.target_id || ""}
                                    onValueChange={(value) =>
                                        setFormData((p) => ({ ...p, target_id: value }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Chọn mục tiêu --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targets.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.target_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input
                                    value={formData.description || ""}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, description: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>{editingDoc ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
