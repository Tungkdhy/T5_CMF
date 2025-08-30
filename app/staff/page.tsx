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

// giả lập API (bạn thay bằng api thật)
import { getStaff, createStaff, updateStaff, deleteStaff } from "@/api/staff";

interface User {
  id: string;
  user_name: string;
  display_name: string;
  phone_number: string | null;
  email: string | null;
  rank_name: string | null;
  position_name: string | null;
  tckgm_level_name: string | null;
  is_active: boolean;
}

export default function UserManagement() {
  const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
  const [users, setUsers] = useState<User[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, "id">>({
    user_name: "",
    display_name: "",
    phone_number: "",
    email: "",
    rank_name: "",
    position_name: "",
    tckgm_level_name: "",
    is_active: true,
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const { id, ...rest } = user;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteStaff(id);
    fetchUsers(pageIndex);
    setIsRefreshMenu(!isRefreshMenu);
    showAlert("Xóa người dùng thành công", "success");
  };

  const handleSave = async () => {
    if (editingUser) {
      await updateStaff(editingUser.id, formData);
      showAlert("Cập nhật người dùng thành công", "success");
    } else {
      await createStaff(formData);
      showAlert("Thêm người dùng thành công", "success");
    }
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(pageIndex);
    setIsRefreshMenu(!isRefreshMenu);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const fetchUsers = async (page: number) => {
    try {
      const res = await getStaff({ pageSize, pageIndex: page });
      setUsers(res.data.data.rows);
      setTotalPages(Math.ceil(res.data.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };

  useEffect(() => {
    fetchUsers(pageIndex);
  }, [pageIndex]);

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
              placeholder="Tìm kiếm nhân viên..."
              className="pl-10"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setIsModalOpen(true);
            setFormData({
              user_name: "",
              display_name: "",
              phone_number: "",
              email: "",
              rank_name: "",
              position_name: "",
              tckgm_level_name: "",
              is_active: true,
            });
          }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </Button>
        </div>

        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cấp bậc</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Trình độ</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter(u => u.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((u, i) => (
                <TableRow key={u.id}>
                  <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                  <TableCell>{u.display_name}</TableCell>
                  <TableCell>{u.phone_number || "-"}</TableCell>
                  <TableCell>{u.email || "-"}</TableCell>
                  <TableCell>{u.rank_name || "-"}</TableCell>
                  <TableCell>{u.position_name || "-"}</TableCell>
                  <TableCell>{u.tckgm_level_name || "-"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={u.is_active}
                      onCheckedChange={(val) => updateStaff(u.id, { ...u, is_active: val })}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
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
                          <Button size="sm" variant="outline">Hủy</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Xóa</Button>
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

      {/* Modal thêm/sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{editingUser ? "Sửa Nhân viên" : "Thêm Nhân viên"}</h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Tên hiển thị</Label>
                <Input value={formData.display_name ?? ""} onChange={(e) => handleChange("display_name", e.target.value)} />
              </div>
              <div>
                <Label>SĐT</Label>
                <Input value={formData.phone_number ?? ""} onChange={(e) => handleChange("phone_number", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div>
                <Label>Cấp bậc</Label>
                <Input value={formData.rank_name ?? ""} onChange={(e) => handleChange("rank_name", e.target.value)} />
              </div>
              <div>
                <Label>Chức vụ</Label>
                <Input value={formData.position_name ?? ""} onChange={(e) => handleChange("position_name", e.target.value)} />
              </div>
              <div>
                <Label>Trình độ</Label>
                <Input value={formData.tckgm_level_name ?? ""} onChange={(e) => handleChange("tckgm_level_name", e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Label>Hoạt động</Label>
                <Switch checked={formData.is_active} onCheckedChange={(checked) => handleChange("is_active", checked)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>Hủy</Button>
              <Button onClick={handleSave}>{editingUser ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
