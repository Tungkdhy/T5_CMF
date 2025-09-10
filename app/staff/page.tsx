"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, Search, FileSpreadsheet } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  // Select,
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
import { cn } from "@/lib/utils"

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
]
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from '@/context/GlobalContext';

// giả lập API (bạn thay bằng api thật)
import { getStaff, createStaff, updateStaff, deleteStaff, getAllRoles, getOrganozations } from "@/api/staff";
import { Checkbox } from "@/components/ui/checkbox";
import { getCategory } from "@/api/categor";
import { Select } from "@/components/ui/select";
import { exportExcel } from "@/api/excel";

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
  role_id?: string | null;
  unit_id?: string | null;
  organization_id?: string | null;
  team_id?: string | null
}

export default function UserManagement() {
  const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
  const [users, setUsers] = useState<User[]>([]);
  const [multiSelect, setMultiSelect] = useState<any>({
    skill: [],
    certificate: []
  })
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<any>({
    skill: "",
    certificate: "",
    unit: "",
    level_tckgm: ""
  });
  const [formData, setFormData] = useState<Omit<User, "id">>({
    user_name: "",
    display_name: "",
    phone_number: "",
    email: "",
    rank_name: "",
    position_name: "",
    tckgm_level_name: "0b21e44f-93bf-4554-9c1f-1e4f3e29d390",
    is_active: true,
    role_id: "",
    unit_id: "",
    organization_id: "",
    team_id: ""
  });

  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>({
    skill: [],
    certificate: []
  })

  const toggleValue = (value: string, type: "skill" | "certificate") => {
    setSelected((prev: any) => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((v: any) => v !== value) : [...prev[type], value]
    }));

  }
  const pageSize = 10;
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const showAlert = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => {
      setMessage(null);
      setStatus(null);
    }, 3000);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    const { id, ...rest } = user;
    setFormData({
      ...rest,
      rank_name: rest.rank_id ?? "",
      position_name: rest.position_id ?? "",
      tckgm_level_name: rest.tckgm_level_id ?? "",

    });
    setSelected({
      skill: user.skills ? user.skills.map((s: any) => s.id) : [],
      certificate: user.certificates ? user.certificates.map((c: any) => c.id) : []
    })
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteStaff(id);
    fetchUsers(pageIndex, filters);
    setIsRefreshMenu(!isRefreshMenu);
    showAlert("Xóa người dùng thành công", "success");
  };

  const handleSave = async () => {
    if (editingUser) {
      await updateStaff(editingUser.id, {
        ...formData,
        ...selected
      });
      showAlert("Cập nhật người dùng thành công", "success");
    } else {
      await createStaff({ ...formData, ...selected });
      showAlert("Thêm người dùng thành công", "success");
    }
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(pageIndex, filters);
    setIsRefreshMenu(!isRefreshMenu);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const fetchUsers = async (page: number, filters: any) => {
    try {
      const res = await getStaff({ pageSize, pageIndex: page, filters });
      setUsers(res.data.data.rows);
      setTotalPages(Math.ceil(res.data.data.count / pageSize));
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };
  const fetchOrganization = async (unit_id: any) => {
    try {
      const res = await getOrganozations(unit_id);
      // console.log(res.data);

      setMultiSelect({
        ...multiSelect,
        organization: Array.isArray(res.data.data.rows) && res.data.data.rows.length > 0
          ? res.data.data.rows.map((item: any) => ({ value: item.id, label: item.organization_name }))
          : [],
      });
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };
  const fetchSelect = async (page: number) => {
    try {
      const res = await getCategory({ pageSize: 1000, pageIndex: page, scope: "SKILL" });
      const res2 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "CERTIFICATE" });
      const res3 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "POSITION" });
      const res4 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "LEVEL" });
      const res5 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "LEVEL_TCKGM" });
      const res7 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "UNIT" });
      const res8 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "ORGANIZATION" });
      // FORCE_TCCS
      const res6 = await getAllRoles({ pageSize, pageIndex });
      const res9 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "FORCE_TCCS" });
      setMultiSelect({
        skill: res.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        certificate: res2.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        position: res3.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        level: res4.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        level_tckgm: res5.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        // team_tccs: res9.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        roles: res6.data.data.roles,
        unit: res7.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
        organization: res8.data.rows.map((item: any) => ({ value: item.id, label: item.display_name })),
      });
    } catch (err) {
      console.error(err);
      showAlert("Lấy danh sách thất bại", "error");
    }
  };
  useEffect(() => {
    if (formData.unit_id) {
      fetchOrganization(formData.unit_id)
    }
  }, [formData.unit_id])
  useEffect(() => {
    fetchUsers(pageIndex, filters);
  }, [pageIndex, filters]);
  useEffect(() => {
    fetchSelect(1);
  }, []);
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
      const res = await exportExcel("staff");
      const workbook = XLSX.read(res, { type: "string" });

      // 2. Lấy sheet đầu tiên từ CSV
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // 3. Tạo workbook mới & append sheet với tên "Tham số"
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Nhân viên");

      // 4. Ghi workbook ra buffer Excel
      const excelBuffer = XLSX.write(newWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      // 5. Tạo file blob và tải về
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "tham_so_he_thong.xlsx");


    } catch (err) {
      console.error("Export failed:", err);
      showAlert("Xuất Excel thất bại", "error");
    }
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
        <div className="flex items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              className="pl-10"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter chứng chỉ */}
          <Select
            value={filters.certificate}
            onValueChange={(val) =>
              setFilters((prev: any) => ({ ...prev, certificate: val }))
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc theo chứng chỉ" />
            </SelectTrigger>
            <SelectContent>
              {multiSelect.certificate?.map((c: any) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter kỹ năng */}
          <Select
            value={filters.skill}
            onValueChange={(val) =>
              setFilters((prev: any) => ({ ...prev, skill: val }))
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc theo kỹ năng" />
            </SelectTrigger>
            <SelectContent>
              {multiSelect.skill?.map((s: any) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter đơn vị */}
          <Select
            value={filters.unit}
            onValueChange={(val) =>
              setFilters((prev: any) => ({ ...prev, unit: val }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo đơn vị" />
            </SelectTrigger>
            <SelectContent>
              {multiSelect.unit?.map((u: any) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter trình độ TCKGM */}
          <Select
            value={filters.level_tckgm}
            onValueChange={(val) =>
              setFilters((prev: any) => ({ ...prev, level_tckgm: val }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo TCKGM" />
            </SelectTrigger>
            <SelectContent>
              {multiSelect.level_tckgm?.map((l: any) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Xuất Excel
          </Button>
          {/* Nút thêm nhân viên */}
          <Button
            onClick={() => {
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
                organization_id: "",
                unit_id: "",
              });
              setSelected({ skill: [], certificate: [] });
            }}
            className="flex items-center gap-2"
          >
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
                <Label className="mb-1">Tên hiển thị</Label>
                <Input value={formData.display_name ?? ""} onChange={(e) => handleChange("display_name", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1">SĐT</Label>
                <Input value={formData.phone_number ?? ""} onChange={(e) => handleChange("phone_number", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1">Email</Label>
                <Input value={formData.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
              </div>

              {/* 
              <div>
                <Label className="mb-3">Đội nhóm</Label>
                <Select
                  value={formData.team_id ?? ""}
                  onValueChange={(val) => {
                    // console.log(val);

                    handleChange("team_id", val || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn đội nhóm">
                      {multiSelect.team_tccs.find((x: any) => x.value === formData.team_id)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent >
                    {multiSelect.team_tccs.map((r: any) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-3">Vai trò</Label>
                  <Select
                    value={formData.role_id ?? ""}
                    onValueChange={(val) => {
                      console.log(val);

                      handleChange("role_id", val || null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Lọc theo loại">
                        {multiSelect.roles.find((x: any) => x.value === formData.role_id)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent >
                      {multiSelect.roles.map((r: any) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className='mb-3' htmlFor="status">Cấp bậc</Label>
                  <Select value={formData.rank_name ?? ""} onValueChange={(value) => setFormData((prev) => ({ ...prev, rank_name: value }))}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Lọc theo loại">
                        {multiSelect.level.find((x: any) => x.value === formData.rank_name)?.label}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {multiSelect.level.map((item: any) => (
                                <Tooltip key={item.value}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={item.value}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          rank_name: item.value
                                        }))
                                        // đóng select
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between",
                                        formData.rank_name === item.value && "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      {item.label}
                                      {formData.rank_name === item.value && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.label}</TooltipContent>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className='mb-' htmlFor="status">Chức vụ</Label>
                  <Select value={formData.position_name ?? ""} onValueChange={(value) => setFormData((prev) => ({ ...prev, position_name: value }))}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Lọc theo loại">
                        {multiSelect.position.find((x: any) => x.value === formData.position_name)?.label}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {multiSelect.position.map((item: any) => (
                                <Tooltip key={item.value}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={item.value}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          position_name: item.value
                                        }))
                                        // đóng select
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between",
                                        formData.position_name === item.value && "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      {item.label}
                                      {formData.position_name === item.value && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.label}</TooltipContent>
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
                  <Label className='mb-3' htmlFor="status">Trình độ</Label>
                  <Select value={formData.tckgm_level_name ?? ""} onValueChange={(value) => setFormData((prev) => ({ ...prev, tckgm_level_name: value }))}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Chọn trình độ">
                        {multiSelect.level_tckgm.find((x: any) => x.value === formData.tckgm_level_name)?.label}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {multiSelect.level_tckgm.map((item: any) => (
                                <Tooltip key={item.value}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={item.value}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          tckgm_level_name: item.value
                                        }))
                                        // đóng select
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between",
                                        formData.tckgm_level_name === item.value && "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      {item.label}
                                      {formData.tckgm_level_name === item.value && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.label}</TooltipContent>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className='mb-3' htmlFor="status">Đơn vị</Label>
                  <Select value={formData.unit_id ?? ""} onValueChange={(value) => setFormData((prev) => ({ ...prev, unit_id: value }))}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Lọc theo đơn vị">
                        {multiSelect.unit.find((x: any) => x.value === formData.unit_id)?.label}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {multiSelect.unit.map((item: any) => (
                                <Tooltip key={item.value}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={item.value}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          unit_id: item.value
                                        }))
                                        // đóng select
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between",
                                        formData.unit_id === item.value && "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      {item.label}
                                      {formData.unit_id === item.value && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.label}</TooltipContent>
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
                  <Label className='mb-3' htmlFor="status">Tổ chức</Label>
                  <Select value={formData.organization_id ?? ""} onValueChange={(value) => setFormData((prev) => ({ ...prev, organization_id: value }))}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Chọn tổ chức">
                        {multiSelect.organization.find((x: any) => x.value === formData.organization_id)?.label}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {multiSelect.organization.map((item: any) => (
                                <Tooltip key={item.value}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={item.value}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          organization_id: item.value
                                        }))
                                        // đóng select
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between",
                                        formData.organization_id === item.value && "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      {item.label}
                                      {formData.organization_id === item.value && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.label}</TooltipContent>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Chứng chỉ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button


                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selected.certificate.length > 0
                          ? multiSelect.certificate
                            .filter((f: any) => selected.certificate.includes(f.value))
                            .map((f: any) => f.label)
                            .join(", ")
                          : "Chọn chứng chỉ"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandGroup>
                          {multiSelect.certificate.map((f: any) => (
                            <CommandItem
                              key={f.value}
                              className="flex items-center gap-2 w-full"
                              onSelect={() => toggleValue(f.value, "certificate")}
                            >
                              <Checkbox
                                checked={selected.certificate.includes(f.value)}
                                onCheckedChange={() => toggleValue(f.value, "certificate")}
                                className="pointer-events-none" // tránh bị conflict khi click item
                              />
                              <span>{f.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="mb-1">Kỹ năng</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selected.skill.length > 0
                          ? multiSelect.skill
                            .filter((f: any) => selected.skill.includes(f.value))
                            .map((f: any) => f.label)
                            .join(", ")
                          : "Chọn kỹ năng"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandGroup >
                          {multiSelect.skill.map((f: any) => (
                            <CommandItem
                              key={f.value}
                              className="flex items-center gap-2 w-full"
                              onSelect={() => toggleValue(f.value, "skill")}
                            >
                              <Checkbox
                                checked={selected.skill.includes(f.value)}
                                onCheckedChange={() => toggleValue(f.value, "skill")}
                                className="pointer-events-none" // tránh bị conflict khi click item
                              />
                              <span>{f.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={handleCancel}>Hủy</Button>
              <Button onClick={handleSave}>{editingUser ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
