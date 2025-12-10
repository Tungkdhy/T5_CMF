"use client";
import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, X, XCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
import { getCategoryType } from '@/api/category_type';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { useParams } from "next/navigation";
import { get } from 'http';
export default function CategoryManagementPage() {
    const params = useParams();
    const id_scope = params.id;
    const [open, setOpen] = useState(false)
    const [open2, setOpen2] = useState(false)
    const [categories, setCategories] = useState<Category[]>([
    ]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
        data: {
            "do_khan": "Ưu tiên"
        },
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
    function getIdByScope(scope: any, data: any) {
        const item = data.find((i: any) => i.scope === scope);
        console.log(item);

        return item ? item.id : null; // trả về null nếu không tìm thấy
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
            // category_type_id: getIdByScope(id as string, categoryTypes),
            id: data.id,
            data: data.data
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
        setFormData((prev) => ({
            ...prev,
            display_name: "",
            description: "",
            value: "",
            data: {
                do_khan: ""
            },
            id: ""
        }))
        setErrors({});
        setIsModalOpen(true);
    };
    const handleSaveCategory = async () => {
        if (!validateForm()) return;

        if (editingCategory) {

            const { reload, status, created_by_user, category_type_id, ...rest } = formData;
            const res = await updateCategory(formData.id, rest);
            setFormData((prev) => ({
                ...prev,
                reload: !prev.reload,
                // category_type_id:getIdByScope(id, categoryTypes)
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
                reload: !prev.reload,
                category_type_id: getIdByScope(id_scope, categoryTypes)
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


    useEffect(() => {
        const fetchCategoryTypes = async () => {
            const data = await getCategoryType({
                pageSize: 1000,
                pageIndex: 1,
                // name: "",
                visible: true,
            });
            setCategoryTypes(data.data.rows);
            const categoryTypeId = getIdByScope(id_scope, data.data.rows);

            setFormData((prev) => ({ ...prev, category_type_id: categoryTypeId }))

            // console.log(data.data.rows);
            // if (data.data.rows.length > 0) {
            //     setFilterType(data.data.rows[0].scope);
            // }

        };
        fetchCategoryTypes();
    }, [id_scope]);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const fetchCategories = async () => {
                const data = await getCategory({
                    pageSize: 10,
                    pageIndex: pageIndex,
                    scope: id_scope,
                    name: searchTerm, // truyền thêm name
                });
                setCategories(data.data.rows);
                setTotalPages(Math.ceil(data.data.count / 10));

            };
            fetchCategories();
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce); // clear nếu user tiếp tục gõ
    }, [id_scope, formData.reload, searchTerm,pageIndex]);
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
                        {status === "success" ? (
                            <CheckCircle className="h-5 w-5 animate-bounce" />
                        ) : (
                            <XCircle className="h-5 w-5 animate-shake" />
                        )}
                        <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}
            <div className="mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm danh mục..."
                                className="pl-10 transition-all focus:ring-2 focus:ring-blue-300"
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={handleAddCategory} 
                            className="flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm danh mục
                        </Button>
                    </div>

                    {/* <div className="flex flex-col md:flex-row gap-4 mb-6 "> */}


                    {/* <div className="md:w-48">
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
                        </div> */}
                    {/* </div> */}

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
                                    {
                                        id_scope === "MISSION" && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Độ khẩn
                                        </th>
                                    }
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
                                    <tr 
                                        key={item.id} 
                                        className="hover:bg-blue-50/50 transition-colors animate-in fade-in slide-in-from-left-2"
                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {item.display_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.description}
                                        </td>
                                        {
                                            id_scope === "MISSION" && <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    {item?.data?.do_khan || "—"}
                                                </span>
                                            </td>
                                        }
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.created_by_user?.display_name ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center gap-1 transition-all hover:scale-105 hover:border-blue-400 hover:text-blue-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Sửa
                                                </Button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="flex items-center gap-1 transition-all hover:scale-105"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Xóa
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56 animate-in fade-in zoom-in-95 duration-200">
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
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b p-4 bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold">
                                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="p-0 h-auto hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Tên hiển thị */}
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '50ms' }}>
                                <Label className='mb-3' htmlFor="display_name">Tên hiển thị</Label>
                                <Input
                                    id="display_name"
                                    value={formData.display_name || ""}
                                    onChange={(e) => handleChange("display_name", e.target.value)}
                                    className={cn(
                                        "transition-all focus:ring-2 focus:ring-blue-300",
                                        errors.display_name && "border-red-500"
                                    )}
                                />
                                {errors.display_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
                                )}
                            </div>
                            {
                                id_scope === "MISSION" && <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                                    <Label className='mb-3' htmlFor="description">Độ khẩn</Label>
                                    <Input
                                        id="description"
                                        value={formData.data.do_khan || ""}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData, data: {
                                                    ...formData.data,
                                                    do_khan: e.target.value
                                                }
                                            })
                                        }}
                                        className={cn(
                                            "transition-all focus:ring-2 focus:ring-blue-300",
                                            errors.description && "border-red-500"
                                        )}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>
                            }

                            {/* Mô tả */}
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                                <Label className='mb-3' htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ""}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    className={cn(
                                        "transition-all focus:ring-2 focus:ring-blue-300",
                                        errors.description && "border-red-500"
                                    )}
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
                            {/* <div>
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
                            </div> */}
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                                <Label className='mb-3' htmlFor="value">Giá trị</Label>
                                <Input
                                    id="value"
                                    value={formData.value || ""}
                                    onChange={(e) => handleChange("value", e.target.value)}
                                    className={cn(
                                        "transition-all focus:ring-2 focus:ring-blue-300",
                                        errors.value && "border-red-500"
                                    )}
                                />
                                {errors.value && (
                                    <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50 rounded-b-lg">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsModalOpen(false)}
                                className="transition-all hover:scale-105"
                            >
                                Hủy
                            </Button>
                            <Button 
                                onClick={handleSaveCategory}
                                className="transition-all hover:scale-105 hover:shadow-md"
                            >
                                {editingCategory ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}