"use client";
import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, X, XCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Check } from "lucide-react"
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { getCategoryType } from '@/api/category_type';

import { cn } from '@/lib/utils';
import { createCategory, deleteCategory, getCategory, updateCategory } from '@/api/categor';
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

    const [open, setOpen] = useState(false)
    const [open2, setOpen2] = useState(false)
    const [categories, setCategories] = useState<Category[]>([
        { id: 1, name: 'Điện thoại', type: 'product', description: 'Các loại điện thoại thông minh', status: 'active', createdAt: '2023-01-15' },
        { id: 2, name: 'Laptop', type: 'product', description: 'Máy tính xách tay', status: 'active', createdAt: '2023-02-20' },
        { id: 3, name: 'Bảo trì', type: 'service', description: 'Dịch vụ bảo trì thiết bị', status: 'active', createdAt: '2023-03-10' },
        { id: 4, name: 'Tin tức', type: 'blog', description: 'Tin tức công nghệ', status: 'active', createdAt: '2023-04-05' },
        { id: 5, name: 'Phụ kiện', type: 'product', description: 'Phụ kiện điện tử', status: 'inactive', createdAt: '2023-05-12' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryTypes, setCategoryTypes] = useState<any>([]);
    const [filterType, setFilterType] = useState<string>('id');
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
        reload: true // mặc định là active
    });
    const [message, setMessage] = useState<string | null>(null)
    const [status, setStatus] = useState<"success" | "error" | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({});
    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg)
        setStatus(type)

        // Tự ẩn sau 3 giây
        setTimeout(() => {
            setMessage(null)
            setStatus(null)
        }, 3000)
    }
    const handleEdit = (data: any) => {
        setEditingCategory(data);
        setFormData((prev) => ({
            ...prev,
            // status: data.status,
            created_by_user: data.created_by_user?.display_name,
            display_name: data.display_name,
            description: data.description,
            value: data.value,
            category_type_id: data.category_type_id,
            id: data.id
        }))
        setIsModalOpen(true);
        // setEditingCategory(data);
    }
    const handleDelete = async (id: any) => {
        const res = await deleteCategory(id);
        if (res) {
            setFormData((prev) => ({
                ...prev,
                reload: !prev.reload
            }))
            showAlert(`Xóa thành công`, "success");
        } else {
            showAlert(`Xóa thất bại`, "error");
        }
    }
    const filteredCategories = categories.filter(category => {
        // const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //     category.description.toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesType = filterType === 'all' || category.type === filterType;
        // return matchesSearch && matchesType;
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // if (!formData.name.trim()) {
        //     newErrors.name = 'Tên danh mục là bắt buộc';
        // }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        // setFormData({
        //     name: '',
        //     type: 'product',
        //     description: '',
        //     status: 'active'
        // });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        // setFormData({
        //     name: category.name,
        //     type: category.type,
        //     description: category.description,
        //     status: category.status
        // });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(categories.filter(category => category.id !== id));
    };

    const handleSaveCategory = async () => {
        if (!validateForm()) return;

        if (editingCategory) {

            const { reload, status, created_by_user, ...rest } = formData;
            const res = await updateCategory(formData.id, rest);
            setFormData((prev) => ({
                ...prev,
                reload: !prev.reload
            }))
            showAlert(`Cập nhật thành công`, "success")
            // Update existing category
            // setCategories(categories.map(category =>
            //     category.id === editingCategory.id
            //         ? { ...category, ...formData }
            //         : category
            // ));
        } else {
            const { reload, status, created_by_user, id, ...rest } = formData;
            const res = await createCategory(rest);

            setFormData((prev) => ({
                ...prev,
                reload: !prev.reload
            }))
            showAlert(`Thêm mới thành công`, "success")
            // Add new category
            // const newCategory: Category = {
            //     id: Math.max(0, ...categories.map(c => c.id)) + 1,
            //     ...formData,
            //     createdAt: new Date().toISOString().split('T')[0]
            // };
            // setCategories([...categories, newCategory]);
        }

        setIsModalOpen(false);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'product': return 'Sản phẩm';
            case 'service': return 'Dịch vụ';
            case 'blog': return 'Blog';
            case 'other': return 'Khác';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'product': return 'bg-blue-100 text-blue-800';
            case 'service': return 'bg-green-100 text-green-800';
            case 'blog': return 'bg-purple-100 text-purple-800';
            case 'other': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    useEffect(() => {
        const fetchCategoryTypes = async () => {
            const data = await getCategoryType({
                pageSize: 1000,
                pageIndex: 1,
                // name: "",
                visible: true,
            });
            setCategoryTypes(data.data.rows);
            console.log(data.data.rows);
            if (data.data.rows.length > 0) {
                setFilterType(data.data.rows[0].scope);
            }

        };
        fetchCategoryTypes();
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const fetchCategories = async () => {
                const data = await getCategory({
                    pageSize: 10,
                    pageIndex: 1,
                    scope: filterType,
                    name: searchTerm, // truyền thêm name
                });
                setCategories(data.data.rows);
            };
            fetchCategories();
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce); // clear nếu user tiếp tục gõ
    }, [filterType, formData.reload, searchTerm]);
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
                        {status === "success" ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                        <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}
            <div className="mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
                        <Button onClick={handleAddCategory} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm danh mục
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6 ">
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

                        <div className="md:w-48">
                            <Select open={open} onOpenChange={setOpen} value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[300px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <SelectValue placeholder="Lọc theo loại">
                                        {categoryTypes.find((x: any) => x.scope === filterType)?.display_name}
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="w-[300px]">
                                    <TooltipProvider>
                                        <Command>
                                            <CommandInput placeholder="Tìm kiếm..." />
                                            <CommandList>
                                                <CommandEmpty>Không tìm thấy</CommandEmpty>
                                                <CommandGroup>
                                                    {categoryTypes.map((item: any) => (
                                                        <Tooltip key={item.scope}>
                                                            <TooltipTrigger asChild>
                                                                <CommandItem
                                                                    value={item.scope}
                                                                    onSelect={() => {
                                                                        setFilterType(item.scope) // chọn giá trị
                                                                        setOpen(false) // đóng select
                                                                    }}
                                                                    className={cn(
                                                                        "truncate flex items-center justify-between",
                                                                        filterType === item.scope && "bg-blue-100 font-semibold"
                                                                    )}
                                                                >
                                                                    {item.display_name}
                                                                    {filterType === item.scope && (
                                                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                                                    )}
                                                                </CommandItem>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{item.display_name}</TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </TooltipProvider>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        STT
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tên hiển thị
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Mô tả
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Người tạo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((item: any, index: number) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.display_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.created_by_user?.display_name ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Sửa
                                                </Button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Xóa
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56">
                                                        <p className="text-sm mb-3">Bạn có chắc muốn xóa mục này?</p>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm">Hủy</Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {categories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy danh mục</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Không có danh mục nào phù hợp với tìm kiếm của bạn.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-semibold">
                                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="p-0 h-auto"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Tên hiển thị */}
                            <div>
                                <Label className='mb-3' htmlFor="display_name">Tên hiển thị</Label>
                                <Input
                                    id="display_name"
                                    value={formData.display_name || ""}
                                    onChange={(e) => handleChange("display_name", e.target.value)}
                                    className={errors.display_name ? "border-red-500" : ""}
                                />
                                {errors.display_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div>
                                <Label className='mb-3' htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ""}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Người tạo */}
                            {/* <div>
                                <Label className='mb-3' htmlFor="created_by_user">Người tạo</Label>
                                <Input
                                    id="created_by_user"
                                    value={formData.created_by_user || ""}
                                    onChange={(e) => handleChange("created_by_user", e.target.value)}
                                />
                            </div> */}

                            {/* Loại danh mục */}
                            <div>
                                <Label className='mb-3' htmlFor="status">Loại danh mục</Label>
                                <Select open={open2} onOpenChange={setOpen2} value={formData.category_type_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_type_id: value }))}>
                                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <SelectValue placeholder="Lọc theo loại">
                                            {categoryTypes.find((x: any) => x.id === formData.category_type_id)?.display_name}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent className="w-full">
                                        <TooltipProvider>
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                                    <CommandGroup>
                                                        {categoryTypes.map((item: any) => (
                                                            <Tooltip key={item.id}>
                                                                <TooltipTrigger asChild>
                                                                    <CommandItem
                                                                        value={item.id}
                                                                        onSelect={() => {
                                                                            setFormData((prev) => ({
                                                                                ...prev,
                                                                                category_type_id: item.id
                                                                            }))
                                                                            setOpen(false) // đóng select
                                                                        }}
                                                                        className={cn(
                                                                            "truncate flex items-center justify-between",
                                                                            formData.category_type_id === item.id && "bg-blue-100 font-semibold"
                                                                        )}
                                                                    >
                                                                        {item.display_name}
                                                                        {formData.category_type_id === item.id && (
                                                                            <Check className="h-4 w-4 ml-2 text-blue-600" />
                                                                        )}
                                                                    </CommandItem>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{item.display_name}</TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </TooltipProvider>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className='mb-3' htmlFor="value">Giá trị</Label>
                                <Input
                                    id="value"
                                    value={formData.value || ""}
                                    onChange={(e) => handleChange("value", e.target.value)}
                                    className={errors.value ? "border-red-500" : ""}
                                />
                                {errors.value && (
                                    <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-4 border-t">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSaveCategory}>
                                {editingCategory ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}