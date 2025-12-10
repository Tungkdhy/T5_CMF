"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  XCircle,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
} from "lucide-react";
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
import { exportExcel } from "@/api/excel";
import { cn } from "@/lib/utils";

interface User {
  id?: string;
  user_name?: string;
  display_name?: string;
  is_active?: boolean;
  is_online?: boolean | null;
  role?: string;
  password?: string;
  reload?: boolean;
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
    password: "",
    reload: true,
  });
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const pageSize = 10;

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
      setUsers(res.data.data.rows);
      setTotalPages(Math.ceil(res.data.data.count / pageSize));
    } catch (err:any) {
       showAlert(err.response.data.message, "error");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(pageIndex);
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);
  }, [pageIndex, formData.reload, searchTerm]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles({ pageSize:10000, pageIndex });
        setRoles(res.data.data.rows);

      } catch (err:any) {
        showAlert(err.response.data.message, "error");
      }
    };
    fetchRoles();
  }, []);

  const handleSave = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id ?? "", formData);
        showAlert("Cập nhật user thành công", "success");
      } else {
        await createUser({
          user_name: formData.user_name,
          display_name: formData.display_name,
          role_id: formData.role,
          password: formData.password,
        });
        showAlert("Thêm user thành công", "success");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ ...formData, reload: !formData.reload });
    } catch (err: any) {
      showAlert(err?.response?.data.message, "error");
      // console.log(err);

    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      showAlert("Xóa user thành công", "success");
      setFormData({ ...formData, reload: !formData.reload });
    } catch (err:any) {
       showAlert(err.response.data.message, "error");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id ?? "", { is_active: !user.is_active });
      setFormData({ ...formData, reload: !formData.reload });
      showAlert("Cập nhật trạng thái thành công", "success");
    } catch (err:any) {
      showAlert(err.response.data.message, "error");
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleExportExcel = async () => {
    try {
      // const res = await api.get("/system-parameters/export", {
      //   params: { pageSize, pageIndex },
      // });
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "system_parameters.xlsx");
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      const res = await exportExcel("user");
      const workbook = XLSX.read(res, { type: "string" });

      // 2. Lấy sheet đầu tiên từ CSV
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // 3. Tạo workbook mới & append sheet với tên "Tham số"
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Người dùng");

      // 4. Ghi workbook ra buffer Excel
      const excelBuffer = XLSX.write(newWorkbook, {
        bookType: "csv",
        type: "array",
      });

      // 5. Tạo file blob và tải về
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "nguoi_dung.csv");


    } catch (err:any) {
      showAlert(err.response.data.message, "error");
    }
  };
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

      <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Tìm kiếm + Thêm user */}
        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              className="pl-10 transition-all focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportExcel} 
              variant="outline" 
              className="flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Xuất csv
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setEditingUser(null);
                setFormData({
                  user_name: "",
                  display_name: "",
                  is_active: true,
                  is_online: false,
                  role: "",
                  password: "test",
                });
              }}
              className="flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md"
            >
              <Plus className="w-4 h-4" /> Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Bảng user */}
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>STT</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead>Kích hoạt</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, i) => (
              <TableRow 
                key={u.id}
                className="animate-in fade-in slide-in-from-left-2 hover:bg-blue-50/50 transition-colors"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
              >
                <TableCell>{(pageIndex - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-medium">{u.user_name}</TableCell>
                <TableCell>{u.display_name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {u?.role?.display_name}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={u.is_active}
                    onCheckedChange={() => handleToggleActive(u)}
                    className="transition-all"
                  />
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all hover:scale-105 hover:border-blue-400 hover:text-blue-600"
                    onClick={() => {
                      setEditingUser(u);
                      setFormData({
                        is_active: u.is_active,
                        display_name: u.display_name,
                        role: u?.role?.id,
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" /> Sửa
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="destructive" className="transition-all hover:scale-105">
                        <Trash2 className="w-4 h-4" /> Xóa
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="animate-in fade-in zoom-in-95 duration-200">
                      <p>Bạn có chắc muốn xóa?</p>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u.id)}
                        >
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
          <Button
            size="sm"
            variant="outline"
            disabled={pageIndex === 1}
            onClick={() => setPageIndex(pageIndex - 1)}
            className="transition-all hover:scale-105 hover:border-blue-400 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 py-1 bg-gray-100 rounded-md font-medium">
            Trang {pageIndex} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={pageIndex === totalPages}
            onClick={() => setPageIndex(pageIndex + 1)}
            className="transition-all hover:scale-105 hover:border-blue-400 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal thêm/sửa user */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold">
                {editingUser ? "Sửa user" : "Thêm user"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-red-100 hover:text-red-600 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {!editingUser && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '50ms' }}>
                  <Label className="mb-3">Username</Label>
                  <Input
                    value={formData.user_name}
                    onChange={(e) => handleChange("user_name", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}
              {!editingUser && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                  <Label className="mb-3">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value)
                      }
                      className="pr-10 transition-all focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                <Label className="mb-3">Tên hiển thị</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) =>
                    handleChange("display_name", e.target.value)
                  }
                  className="transition-all focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                <Label className="mb-3">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => handleChange("role", val || null)}
                >
                  <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-blue-300">
                    <SelectValue placeholder="Chọn vai trò">
                      {roles.find((x: any) => x.id === formData.role)?.display_name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="animate-in fade-in zoom-in-95 duration-200">
                    {roles.map((r, index: any) => (
                      <SelectItem key={index} value={r.id} className="transition-colors hover:bg-blue-50">
                        {r.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                <Label className="mb-3">Kích hoạt</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="transition-all hover:scale-105"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSave}
                className="transition-all hover:scale-105 hover:shadow-md"
              >
                {editingUser ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
