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
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from '@/context/GlobalContext';
// API giả lập
import { createTarget, deleteTarget, getTargets, updateTarget } from "@/api/targets";
import { getCategory } from "@/api/categor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Target {
    id: string;
    target_name: string;
    target_url: string;
    combat_status: string;
    description: string;
    reload?: boolean;
    target_type?: string;
    target_type_tc?: string;
}

export default function TargetManagement() {
    const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
    const [targets, setTargets] = useState<Target[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<Target | null>(null);
    const [typeTarget, setTypeTarget] = useState<any[]>([])
    const [typeTargetTC, setTypeTargetTC] = useState<any[]>([])
    const [formData, setFormData] = useState<Omit<Target, "id">>({
        target_name: "",
        target_url: "",
        combat_status: "active",
        description: "",
        reload: false,
        target_type: "",
        target_type_tc: ""
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

    const handleEdit = (target: Target) => {
        setEditingTarget(target);
        const { id, ...rest } = target;
        setFormData(rest);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteTarget(id);
        fetchTargets(pageIndex);
        setIsRefreshMenu(!isRefreshMenu);
        showAlert("Xóa target thành công", "success");
    };
    const handleSave = async () => {
        try {
            if (editingTarget) {
                const { reload, ...rest } = formData;
                await updateTarget(editingTarget.id, rest);
                showAlert("Cập nhật target thành công", "success");
            } else {
                const { reload, ...rest } = formData;
                await createTarget(rest);
                showAlert("Thêm target thành công", "success");
            }
            setIsModalOpen(false);
            setEditingTarget(null);
            fetchTargets(pageIndex);
            setIsRefreshMenu(!isRefreshMenu);
        }
        catch (err: any) {
            showAlert(err?.response?.data.message, "error");
            // console.log(err);

        }
    };
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingTarget(null);
    };
    const fetchTargets = async (page: number) => {
        try {
            const res = await getTargets({ pageIndex: page, pageSize });
            setTargets(res.data.items);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };
    const fetchSelect = async (page: number) => {
        try {
            const res = await getCategory({ pageSize: 1000, pageIndex: page, scope: "OBJECT_TCTT" });
            const res2 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "target_tctt" });

            setTypeTarget(res.data.rows)
            setTypeTargetTC(res2.data.rows)
            // FORCE_TCCS


        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };

    useEffect(() => {
        fetchSelect(1);
    }, []);
    useEffect(() => {
        fetchTargets(pageIndex);
    }, [pageIndex, formData.reload]);
    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {message && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
                    <Alert className={`rounded-xl shadow-lg ${status === "success" ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800"}`}>
                        {status === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                    <div></div>
                    <Button onClick={() => {
                        setIsModalOpen(true);
                        setFormData({ target_name: "", target_url: "", combat_status: "active", description: "" });
                    }} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Thêm mục tiêu
                    </Button>
                </div>

                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên mục tiêu</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Loại mục tiêu</TableHead>
                            <TableHead>Mục tiêu TCTT</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {targets.map((t, i) => (
                            <TableRow key={t.id}>
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>{t.target_name}</TableCell>
                                <TableCell><a href={t.target_url} target="_blank" className="text-blue-600">{t.target_url}</a></TableCell>
                                <TableCell>{t.target_name}</TableCell>
                                <TableCell>{t.target_name}</TableCell>

                                <TableCell>
                                    <Switch
                                        checked={t.combat_status === "active"}
                                        onCheckedChange={async (checked) => {
                                            const newStatus = checked ? "active" : "inactive";
                                            await updateTarget(t.id, { combat_status: newStatus });
                                            setTargets((prev) =>
                                                prev.map((item) =>
                                                    item.id === t.id ? { ...item, combat_status: newStatus } : item
                                                )
                                            );
                                            showAlert("Cập nhật trạng thái thành công", "success");
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
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
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Xóa</Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-end mt-4 space-x-2">
                    <Button size="sm" variant="outline" disabled={pageIndex === 1} onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))} className="p-1">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center px-2">Trang {pageIndex} / {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={pageIndex === totalPages} onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))} className="p-1">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{editingTarget ? "Sửa target" : "Thêm target"}</h3>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <Label className="mb-3">Tên target</Label>
                                <Input value={formData.target_name} onChange={(e) => handleChange("target_name", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">URL</Label>
                                <Input value={formData.target_url} onChange={(e) => handleChange("target_url", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Loại mục tiêu</Label>
                                <Select
                                    value={formData.target_type ?? ""}
                                    onValueChange={(val) => {
                                        console.log(val);

                                        handleChange("target_type", val);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Lựa chọn">
                                            {typeTarget?.find((x: any) => x.id === formData.target_type)?.label}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent >
                                        {typeTarget?.map((r: any) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-3">Mục tiêu TCTT</Label>
                                <Select
                                    value={formData.target_type_tc ?? ""}
                                    onValueChange={(val) => {
                                        console.log(val);

                                        handleChange("target_type_tc", val);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Lựa chọn">
                                            {typeTargetTC?.find((x: any) => x.id === formData.target_type_tc)?.label}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent >
                                        {typeTargetTC?.map((r: any) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-3">Trạng thái</Label>
                                <Switch
                                    checked={formData.combat_status === "active"}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            combat_status: checked ? "active" : "inactive",
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>Hủy</Button>
                            <Button onClick={handleSave}>{editingTarget ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
