"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { getUsers, createUser, updateUser, deleteUser, getAllRoles } from "@/api/user";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { set } from "react-hook-form";
interface User {
  id: string;
  user_name: string;
  display_name: string;
  is_active: boolean;
  is_online?: boolean | null;
  role?: string;
  password: string;
  reload?:boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, "id">>({
    user_name: "",
    display_name: "",
    is_active: true,
    is_online: false,
    role: "",
    password: "test",
    reload:true
  });
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pageSize = 5;

  const showAlert = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => {
      setMessage(null);
      setStatus(null);
    }, 2500);
  };

  const fetchUsers = async (page: number) => {
    try {
      const res = await getUsers({ pageSize, pageIndex: page, name: searchTerm });
      console.log(res)
      setUsers(res.data.data.rows);
      setTotalPages(Math.ceil(res.data.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách user thất bại", "error");
    }
  };

  useEffect(() => {
    fetchUsers(pageIndex);
  }, [pageIndex,formData.reload]);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles({ pageSize, pageIndex });
        console.log(res)
        setRoles(res.data.data.roles);
      } catch (err) {
        console.error(err);
        showAlert("Lấy danh sách vai trò thất bại", "error");
      }
    };
    fetchRoles();
  }, [])
  const handleSave = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        showAlert("Cập nhật user thành công", "success");
      } else {
        await createUser({ user_name: formData.user_name, display_name: formData.display_name, role_id: formData.role, password: formData.password });
        showAlert("Thêm user thành công", "success");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      // fetchUsers(pageIndex);
      setFormData({ ...formData,reload:!formData.reload });
    } catch (err) {
      console.error(err);
      showAlert("Lưu user thất bại", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      showAlert("Xóa user thành công", "success");
      setFormData({ ...formData,reload:!formData.reload });
    } catch (err) {
      console.error(err);
      showAlert("Xóa user thất bại", "error");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, { ...user, is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
      showAlert("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      console.error(err);
      showAlert("Cập nhật thất bại", "error");
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        {/* Tìm kiếm + Thêm user */}
        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm user..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setEditingUser(null);
              setFormData({ user_name: "", display_name: "", is_active: true, is_online: false, role: "", password: "test" });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm người dùng
          </Button>
        </div>

        {/* Bảng user */}
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead>Kích hoạt</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell>{u.user_name}</TableCell>
                <TableCell>{u.display_name}</TableCell>
                <TableCell>{u?.role?.display_name}</TableCell>
                <TableCell>
                  <Switch checked={u.is_active} onCheckedChange={() => handleToggleActive(u)} />
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(u);
                      setFormData(u);
                      setIsModalOpen(true);
                    }}
                  >
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
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
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
          <Button size="sm" variant="outline" disabled={pageIndex === 1} onClick={() => setPageIndex(pageIndex - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span>Trang {pageIndex} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={pageIndex === totalPages} onClick={() => setPageIndex(pageIndex + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal thêm/sửa user */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{editingUser ? "Sửa user" : "Thêm user"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="mb-3">Username</Label>
                <Input value={formData.user_name} onChange={(e) => handleChange("user_name", e.target.value)} />
              </div>
              <div>
                <Label className="mb-3">Password</Label>
                <Input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
              </div>
              <div>
                <Label className="mb-3">Tên hiển thị</Label>
                <Input value={formData.display_name} onChange={(e) => handleChange("display_name", e.target.value)} />
              </div>
              <div>
                <Label className="mb-3">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => {
                    console.log(val);
                    
                    handleChange("role", val || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lọc theo loại">
                      {roles.find((x: any) => x.value === formData.role)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent >
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="mb-3">Kích hoạt</Label>
                <Switch checked={formData.is_active} onCheckedChange={(checked) => handleChange("is_active", checked)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>{editingUser ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
