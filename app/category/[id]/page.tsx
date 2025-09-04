"use client";
import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, X, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategoryType } from '@/api/category_type';
import { createCategory, deleteCategory, getCategory, updateCategory } from '@/api/categor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { useParams } from "next/navigation";

// Category Data Interface
interface Category {
    id: number;
    name: string;
    type: 'product' | 'service' | 'blog' | 'other';
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function CategoryManagementPage() {
    const params = useParams();
    const id_scope = params.id;

    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryTypes, setCategoryTypes] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState({
        status: "active",
        created_by_user: "",
        display_name: "",
        description: "",
        value: "",
        category_type_id: "",
        id: "",
        reload: true
    });

    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 👉 State cho phân trang
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 3000);
    };

    function getIdByScope(scope: any, data: any) {
        const item = data.find((i: any) => i.scope === scope);
        return item ? item.id : null;
    }

    const handleDelete = async (id: any) => {
        const res = await deleteCategory(id);
        if (res) {
            setFormData((prev) => ({ ...prev, reload: !prev.reload }));
            showAlert(`Xóa thành công`, "success");
        } else {
            showAlert(`Xóa thất bại`, "error");
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setFormData((prev) => ({
            ...prev,
            display_name: "",
            description: "",
            value: "",
            id: ""
        }));
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSaveCategory = async () => {
        // validate form ở đây...
    };

    useEffect(() => {
        const fetchCategoryTypes = async () => {
            const data = await getCategoryType({
                pageSize: 1000,
                pageIndex: 1,
                visible: true,
            });
            setCategoryTypes(data.data.rows);
            const categoryTypeId = getIdByScope(id_scope, data.data.rows);
            setFormData((prev) => ({ ...prev, category_type_id: categoryTypeId }));
        };
        fetchCategoryTypes();
    }, [id_scope]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const fetchCategories = async () => {
                const data = await getCategory({
                    pageSize,
                    pageIndex,
                    scope: id_scope,
                    name: searchTerm,
                });
                setCategories(data.data.rows);
                setTotalPages(Math.ceil(data.data.count/10) || 1); // API trả về tổng số trang
            };
            fetchCategories();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [id_scope, formData.reload, searchTerm, pageIndex]);

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {/* Bảng danh mục */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="relative ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e: any) => {
                                setSearchTerm(e.target.value);
                                setPageIndex(1); // reset về trang đầu khi tìm kiếm
                            }}
                        />
                    </div>
                    <Button onClick={handleAddCategory} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm danh mục
                    </Button>
                </div>

                {/* Bảng */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hiển thị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((item: any, index: number) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {(pageIndex - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.display_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.created_by_user?.display_name ?? "—"}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        {/* nút sửa/xóa */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
        </div>
    );
}
