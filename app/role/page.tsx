"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, CheckCircle, XCircle, Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Giả lập API
import { getRoles, createRole, updateRole, deleteRole, getRolesAction, createRoleAction, getRole, getDetail, updateRoleAction, getUsersByRoleId } from "@/api/role";

// 👉 giả lập danh sách quyền (sau bạn gọi API getActions)
// const actions = [
//     { id: "view_users", name: "Xem người dùng" },
//     { id: "edit_users", name: "Sửa người dùng" },
//     { id: "delete_users", name: "Xóa người dùng" },
//     { id: "view_roles", name: "Xem role" },
//     { id: "manage_roles", name: "Quản lý role" },
// ];

interface Role {
    roleId?: string;
    roleName?: string;
    actionIds?: string[];
    display_name?: string;
    id?: any,
    description?: any
}

export default function RoleManagement() {
    const [roles, setRoles] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [usersInRole, setUsersInRole] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [currentRoleName, setCurrentRoleName] = useState<string>("");
    const [formData, setFormData] = useState<Omit<Role, "roleId">>({
        roleName: "",
        actionIds: [],
        display_name: "",
        id: []
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

    const fetchRoles = async (page: number,searchTerm:any) => {
        try {
            const res = await getRole({ pageSize, pageIndex: page,name: searchTerm});
            setRoles(res.data.rows);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err: any) {
            // console.error(err);
            showAlert(err.response.data.message, "error");
        }
    };
    const fetchActions = async () => {
        try {
            const res = await getRolesAction({ pageSize, pageIndex });
            setActions(res.data.rows);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err: any) {
            // console.error(err);
            showAlert(err.response.data.message, "error");
        }
    };
    const handleSave = async () => {
        try {
            if (editingRole) {
                const { actionIds, description, ...rest } = formData
                await updateRoleAction(editingRole.roleId ?? "", {
                    display_name: formData.display_name,
                    description: formData.description,
                    // code:formData.display_name
                })
                await updateRole(editingRole.roleId ?? "", rest);
                showAlert("Cập nhật role thành công", "success");
            } else {
                const res = await createRole(formData);

                if (res) {
                    await createRoleAction({
                        roleId: res.data.id,
                        actionIds: formData.id
                    })  // id
                }
                // const newRoleId = res.data.roleId; // Giả sử API trả về ID của role mới tạo
                showAlert("Thêm role thành công", "success");
            }
            setIsModalOpen(false);
            setEditingRole(null);
            fetchRoles(pageIndex,searchTerm);
        }
        catch (err: any) {
            // console.error(err);
            showAlert(err.response.data.message, "error");
        }
    };
    const handleGetDetailRole = async (id: any, name: any, data: any) => {
        try {
            const res = await getDetail(id)
            setEditingRole({ roleId: id });
            setFormData({ roleName: name, id: res.data.actions.map((data: any) => data.id) });
            setIsModalOpen(true);
            setFormData(prev => ({
                ...prev,
                description: data.description,
                display_name: data.display_name,
            }))
        }

        catch (e) {

        }
    }

    const handleViewUsersInRole = async (roleId: string, roleName: string) => {
        try {
            const res = await getUsersByRoleId(roleId);
            setUsersInRole(res.data.users || []);
            setCurrentRoleName(roleName);
            setIsUsersModalOpen(true);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Lỗi khi tải danh sách người dùng", "error");
        }
    }
    const handleDelete = async (id: string) => {
        try {
            await deleteRole(id);
            showAlert("Xóa role thành công", "success");
            fetchRoles(pageIndex,searchTerm);
        }
        catch (err: any) {
            // console.error(err);
            showAlert(err.response.data.message, "error");
        }
    };

    useEffect(() => {
        fetchRoles(pageIndex,searchTerm);
    }, [pageIndex,searchTerm]);
    useEffect(() => {
        fetchActions();
    }, []);
    console.log(formData);

    // 👉 hàm toggle quyền
    const toggleAction = (actionId: string) => {
        setFormData((prev) => {
            const exists = prev?.id?.includes(actionId) ?? false;
            return {
                ...prev,
                id: exists
                    ? prev?.id?.filter((id: any) => id !== actionId)
                    : [...prev?.id ?? "", actionId],
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            {/* Alert */}
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

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                {/* Thanh tìm kiếm + thêm */}
                <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm quyền..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setIsModalOpen(true);
                            setFormData({ roleName: "", actionIds: [] });
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm quyền
                    </Button>
                </div>

                {/* Table */}
                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên quyền</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((r, i) => (
                            <TableRow key={r.id}>
                                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                                <TableCell>{r.display_name}</TableCell>
                                <TableCell>{r.description}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewUsersInRole(r.id, r.display_name)}
                                    >
                                        <Edit className="w-4 h-4" /> Xem người dùng
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGetDetailRole(r.id, r.display_name, r)}
                                    >
                                        <Edit className="w-4 h-4" /> Sửa
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                                        <Trash2 className="w-4 h-4" /> Xóa
                                    </Button>
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

            {/* Modal thêm/sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                {editingRole ? "Sửa role" : "Thêm role"}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <Label className="mb-3">Tên role</Label>
                                <Input
                                    value={formData.display_name}
                                    onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
                                />
                            </div>
                            {/* <div>
                                <Label className="mb-3">Tên hiển thị</Label>
                                <Input
                                    value={formData.display_name}
                                    onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
                                />
                            </div> */}
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                            {/* ✅ Danh sách quyền bằng checkbox */}
                            <div>
                                <Label className="mb-3">Danh sách quyền</Label>
                                <div className="mb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={
                                                actions.length > 0 && formData.id?.length === actions.length
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // chọn tất cả
                                                    setFormData((p: any) => ({
                                                        ...p,
                                                        id: actions.map((a: any) => a.id),
                                                    }));
                                                } else {
                                                    // bỏ hết
                                                    setFormData((p: any) => ({
                                                        ...p,
                                                        id: [],
                                                    }));
                                                }
                                            }}
                                        />
                                        Chọn tất cả
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {actions.map((a) => (
                                        <label key={a.id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData?.id?.includes(a.id) ?? ""}
                                                onChange={() => toggleAction(a.id)}
                                            />
                                            {a.display_name} ({a.method_category.display_name})
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave}>{editingRole ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal danh sách users trong role */}
            {isUsersModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                Danh sách người dùng thuộc quyền: {currentRoleName}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsUsersModalOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6">
                            {usersInRole.length > 0 ? (
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>STT</TableHead>
                                            <TableHead>Tên đăng nhập</TableHead>
                                            <TableHead>Tên hiển thị</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Online</TableHead>
                                            <TableHead>Đơn vị</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usersInRole.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{user.user_name}</TableCell>
                                                <TableCell>{user.display_name}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        user.is_online ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.is_online ? 'Online' : 'Offline'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{user.unit_name || 'Chưa phân loại'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Không có người dùng nào thuộc quyền này
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={() => setIsUsersModalOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
