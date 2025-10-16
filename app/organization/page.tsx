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

export default function OrganizationManagementPage() {
    const [open, setOpen] = useState(false)
    const [open2, setOpen2] = useState(false)
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryTypes, setCategoryTypes] = useState<any>([]);
    const [units, setUnits] = useState<any>([]);
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
            "unit_id": "",
            "parent_id": ""
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
            created_by_user: data.created_by_user?.display_name,
            display_name: data.display_name,
            description: data.description,
            value: data.value,
            id: data.id,
            data: {
                unit_id: data.data?.parent_id || "",
                parent_id: data.data?.parent_id || ""
            }
        }))
        setIsModalOpen(true);
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

        if (!formData.display_name.trim()) {
            newErrors.display_name = 'Tên đơn vị là bắt buộc';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc';
        }

        if (!formData.data.unit_id.trim()) {
            newErrors.unit_id = 'Unit ID là bắt buộc';
        }

        if (!formData.data.parent_id.trim()) {
            newErrors.parent_id = 'Parent ID là bắt buộc';
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
                unit_id: "",
                parent_id: ""
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
            }))
            showAlert(`Cập nhật thành công`, "success")
        } else {
            const { reload, status, created_by_user, id, ...rest } = formData;
            const res = await createCategory(rest);

            setFormData((prev) => ({
                ...prev,
                reload: !prev.reload,
                category_type_id: getIdByScope("ORGANIZATION", categoryTypes)
            }))
            showAlert(`Thêm mới thành công`, "success")
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
                visible: true,
            });
            setCategoryTypes(data.data.rows);
            const categoryTypeId = getIdByScope("ORGANIZATION", data.data.rows);

            setFormData((prev) => ({ ...prev, category_type_id: categoryTypeId }))
        };
        fetchCategoryTypes();
    }, []);

    useEffect(() => {
        const fetchUnits = async () => {
            const data = await getCategory({
                pageSize: 10000,
                pageIndex: 1,
                scope: "UNIT",
            });
            setUnits(data.data.rows);
        };
        fetchUnits();
    }, []);
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const fetchCategories = async () => {
                const data = await getCategory({
                    pageSize: 10,
                    pageIndex: pageIndex,
                    scope: "ORGANIZATION",
                    name: searchTerm, // truyền thêm name
                });
                setCategories(data.data.rows);
                setTotalPages(Math.ceil(data.data.count / 10));
            };
            fetchCategories();
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce); // clear nếu user tiếp tục gõ
    }, [formData.reload, searchTerm, pageIndex]);
    
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
                        <div className="relative ">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm đơn vị..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddCategory} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm đơn vị
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        STT
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tên đơn vị
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Mô tả
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Giá trị
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đơn vị
                                    </th>
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Parent ID
                                    </th> */}
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
                                            {item.value || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {(() => {
                                                const unit = units.find((u: any) => u.id === item.data?.unit_id);
                                                return unit ? `${unit.display_name} (${unit.value})` : (item.data?.unit_id || "—");
                                            })()}
                                        </td>
                                        {/* <td className="px-6 py-4 text-sm text-gray-500">
                                            {(() => {
                                                const parent = units.find((u: any) => u.id === item.data?.parent_id);
                                                return parent ? `${parent.display_name} (${parent.value})` : (item.data?.parent_id || "—");
                                            })()}
                                        </td> */}
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

                    {categories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn vị</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Không có đơn vị nào phù hợp với tìm kiếm của bạn.
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
                                {editingCategory ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
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
                            {/* Tên đơn vị */}
                            <div>
                                <Label className='mb-3' htmlFor="display_name">Tên đơn vị</Label>
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

                            {/* Giá trị */}
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

                            {/* Unit ID */}
                            {/* <div>
                                <Label className='mb-3' htmlFor="unit_id">Unit ID</Label>
                                <Select 
                                    value={formData.data.unit_id || ""} 
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData, 
                                            data: {
                                                ...formData.data,
                                                unit_id: value
                                            }
                                        })
                                    }}
                                >
                                    <SelectTrigger className={errors.unit_id ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn Unit ID" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit: any) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.display_name} ({unit.value})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.unit_id}</p>
                                )}
                            </div> */}

                            {/* Parent ID */}
                            <div>
                                <Label className='mb-3' htmlFor="parent_id">Đơn vị</Label>
                                <Select 
                                    value={formData.data.parent_id || ""} 
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData, 
                                            data: {
                                                ...formData.data,
                                                parent_id: value
                                            }
                                        })
                                    }}
                                >
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Chọn đơn vị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit: any) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.display_name} ({unit.value})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>
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
