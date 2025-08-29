"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle,Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from '@/context/GlobalContext';
// API giả lập
import { createCategoryType, deleteCategoryType, getCategoryType, updateCategoryType } from "@/api/category_type";
import { updateCategory } from "@/api/categor";
import { set } from "react-hook-form";

interface Category {
    id: string;
    display_name: string;
    description: string;
    scope: string;
    visible: boolean;
    created_by_user: { display_name: string };
    reload?: boolean;
}

export default function CategoryManagement() {
    const { username, setUsername, theme, toggleTheme, isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Omit<Category, "id" | "created_by_user">>({
        display_name: "",
        description: "",
        scope: "",
        visible: true,
        reload: false,
    });

    const [status, setStatus] = useState<"success" | "error" | null>(null);
    
    const pageSize = 10;
    const [message, setMessage] = useState<string | null>(null);

    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 3000);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        const { id, created_by_user, ...rest } = category;
        setFormData(rest);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteCategoryType(id);
        fetchCategories(pageIndex);
        setIsRefreshMenu(!isRefreshMenu);
        showAlert("Xóa danh mục thành công", "success");
    };

    const handleSave = async () => {
        if (editingCategory) {
            const { reload, ...rest } = formData
            await updateCategoryType(editingCategory.id, {
                visible: rest.visible, display_name: rest.display_name, description: rest.description, scope: rest.scope
            });
            setIsRefreshMenu(!isRefreshMenu);
            showAlert("Cập nhật danh mục thành công", "success");
        } else {
            const { reload, ...rest } = formData
            await createCategoryType(rest);
            setIsRefreshMenu(!isRefreshMenu);
            // await createCategory(formData);
            showAlert("Thêm danh mục thành công", "success");
        }
        setIsModalOpen(false);
        setEditingCategory(null);
        fetchCategories(pageIndex);
    };

    const handleChange = (field: keyof typeof formData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleVisibleToggle = async (category: any) => {
        setCategories((prev) =>
            prev.map((c) => (c.id === category.id ? { ...c, visible: !c.visible } : c))
        );
        // TODO: Gọi API update visible tại đây
        await updateCategoryType(category.id, { visible: !category.visible, display_name: category.display_name, description: category.description, scope: category.scope });
        setFormData((prev) => ({ ...prev, reload: !prev.reload }));
        showAlert("Cập nhật danh mục thành công", "success");
        setIsRefreshMenu(!isRefreshMenu);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const fetchCategories = async (page: number) => {
        try {
            const res = await getCategoryType({ pageSize, pageIndex: page });
            setCategories(res.data.rows);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };

    useEffect(() => {
        fetchCategories(pageIndex);
    }, [pageIndex, formData.reload]);

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
                    <div className="relative ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => {
                        setIsModalOpen(true);
                        setFormData({ display_name: "", description: "", scope: "", visible: true });
                    }} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Thêm danh mục
                    </Button>
                </div>

                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên danh mục</TableHead>
                            <TableHead>Mô tả</TableHead>
                            {/* <TableHead>Scope</TableHead> */}
                            <TableHead>Hiển thị</TableHead>
                            <TableHead>Người tạo</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((c, i) => (
                            <TableRow key={c.id}>
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>{c.display_name}</TableCell>
                                <TableCell>{c.description}</TableCell>
                                {/* <TableCell>{c.scope}</TableCell> */}
                                <TableCell>
                                    <Switch checked={c.visible} onCheckedChange={() => handleVisibleToggle(c)} />
                                </TableCell>
                                <TableCell>{c.created_by_user?.display_name || "-"}</TableCell>
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

                    <span className="flex items-center px-2">Trang {pageIndex} / {totalPages}</span>

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

            {/* Modal thêm/sửa danh mục */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{editingCategory ? "Sửa danh mục" : "Thêm danh mục"}</h3>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <Label className="mb-3">Tên danh mục</Label>
                                <Input value={formData.display_name} onChange={(e) => handleChange("display_name", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Scope</Label>
                                <Input value={formData.scope} onChange={(e) => handleChange("scope", e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Hiển thị</Label>
                                <Switch checked={formData.visible} onCheckedChange={(checked) => handleChange("visible", checked)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>Hủy</Button>
                            <Button onClick={handleSave}>{editingCategory ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
