"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createDevice, deleteDevice, getDevices, updateDevice } from "@/api/device";
import { exportExcel } from "@/api/excel";
import { getCategory } from "@/api/categor";
import { set } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Device {
    id: string;
    unit_id: string;
    device_type: string;
    device_name: string;
    ip_address: string;
    mac_address: string;
    status: "active" | "inactive";
    description: string;
    unit_name?: string;
    device_group?: string;
    date_created?: string,
    date_received?: string,
    device_type_name?: string,
    reload?: boolean;

}

export default function DeviceManagementPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]); // Danh sách đơn vị
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [formData, setFormData] = useState<Omit<Device, "id">>({
        unit_id: "",
        device_type: "",
        device_name: "",
        ip_address: "",
        mac_address: "",
        status: "active",
        description: "",
        reload: true,
        unit_name: "",
        date_created: "",
        date_received: ""
        // device_group: ""
    });

    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<"success" | "error" | null>(null);

    const showAlert = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(null);
        }, 3000);
    };

    const handleEdit = (device: Device) => {
        setEditingDevice(device);
        const { id, ...rest } = device;
        setFormData(rest);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteDevice(id);
        setFormData((prev) => ({ ...prev, reload: !prev.reload }));
        showAlert("Xóa thiết bị thành công", "success");
    };

    const handleSave = async () => {
        if (editingDevice) {
            const { reload, ...rest } = formData;
            const res = await updateDevice(editingDevice.id, rest);
            setFormData((prev) => ({ ...prev, reload: !prev.reload }));
            //   setDevices(devices.map((d) => (d.id === editingDevice.id ? { ...editingDevice, ...formData } : d)));
            showAlert("Cập nhật thành công", "success");
        } else {
            const { reload, ...rest } = formData;
            const res = await createDevice(rest);
            setFormData((prev) => ({ ...prev, reload: !prev.reload }));
            showAlert("Thêm mới thành công", "success");
            setEditingDevice(null);
        }
        setIsModalOpen(false);
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleCancel = () => {
        setIsModalOpen(false)
        setEditingDevice(null);
    }
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await getDevices({
                    pageSize: 10,
                    pageIndex: 1,
                });
                setDevices(res.data.rows); // dữ liệu array
                // tổng số item để phân trang
            } catch (error) {
                console.error("Lấy danh sách thiết bị thất bại", error);
            }
        };

        fetchDevices();
    }, [formData.reload]);
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
            const res = await exportExcel("managed-devices");
            const workbook = XLSX.read(res, { type: "string" });

            // 2. Lấy sheet đầu tiên từ CSV
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // 3. Tạo workbook mới & append sheet với tên "Tham số"
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Nhật ký");

            // 4. Ghi workbook ra buffer Excel
            const excelBuffer = XLSX.write(newWorkbook, {
                bookType: "csv",
                type: "array",
            });

            // 5. Tạo file blob và tải về
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "thiet_bi.csv");


        } catch (err) {
            console.error("Export failed:", err);
            showAlert("Xuất Excel thất bại", "error");
        }
    };
    const fetchSelect = async (page: number) => {
        try {
            const res = await getCategory({ pageSize: 1000, pageIndex: page, scope: "UNIT" });
            const res2 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "DEVICE_TYPE" });
            const res3 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "EQUIPMENT_GROUP" });
            setDeviceTypes(res2.data.rows);
            setUnits(res.data.rows);
            setGroups(res3.data.rows);

        } catch (err) {
            console.error(err);
            showAlert("Lấy danh sách thất bại", "error");
        }
    };
    useEffect(() => {
        fetchSelect(1);
    }, []);
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

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div></div>
                    <div className="flex gap-2">
                        {/* <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            Xuất Excel
                        </Button> */}
                        <Button onClick={() => {
                            setIsModalOpen(true)
                            setFormData({
                                unit_id: "",
                                device_type: "",
                                device_name: "",
                                ip_address: "",
                                mac_address: "",
                                status: "active",
                                description: "",
                                reload: true,
                                date_created: "",
                                date_received: ""
                            })
                            setEditingDevice(null);
                        }} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm thiết bị
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên thiết bị</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>MAC</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Đơn vị</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Thời gian tạo</TableHead>
                            <TableHead>Thời gian tiếp nhận</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devices.map((d, i) => (
                            <TableRow key={d.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{d.device_name}</TableCell>
                                <TableCell>{d.ip_address}</TableCell>
                                <TableCell>{d.mac_address}</TableCell>
                                <TableCell>{d.device_type_name}</TableCell>
                                <TableCell>{d.unit_name}</TableCell>
                                <TableCell className="max-w-[200px] truncate whitespace-nowrap overflow-hidden">{d.description}</TableCell>
                                <TableCell>{new Date(d.date_created ?? "").toLocaleDateString("en-GB")}</TableCell>
                                <TableCell>{new Date(d.date_received ?? "").toLocaleDateString("en-GB")}</TableCell>
                                <TableCell>{d.status === "active" ? "Hoạt động" : "Ngừng"}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(d)}>
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
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>Xóa</Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modal thêm/sửa thiết bị */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{editingDevice ? "Sửa thiết bị" : "Thêm thiết bị"}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <Label className="mb-3">Tên thiết bị</Label>
                                <Input value={formData.device_name} onChange={(e) => handleChange("device_name", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Địa chỉ IP</Label>
                                <Input value={formData.ip_address} onChange={(e) => handleChange("ip_address", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Địa chỉ MAC</Label>
                                <Input value={formData.mac_address} onChange={(e) => handleChange("mac_address", e.target.value)} />
                            </div>
                            {/* <div>
                                <Label className="mb-3">Nhóm thiết bị</Label>
                                <Select
                                    value={formData.device_group}
                                    onValueChange={(value) => handleChange("device_group", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn nhóm thiết bị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div> */}
                            <div>
                                <Label className="mb-3">Loại thiết bị</Label>
                                <Select
                                    value={formData.device_type}
                                    onValueChange={(value) => handleChange("device_type", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn loại thiết bị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Đơn vị */}
                            <div>
                                <Label className="mb-3">Đơn vị</Label>
                                <Select
                                    value={formData.unit_id}
                                    onValueChange={(value) => handleChange("unit_id", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn đơn vị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full">
                                <Label className="mb-3">Thời gian tiếp nhận</Label>
                                <Input className="w-full block min-w-0" type="date" value={
                                    formData.date_received
                                        ? new Date(formData.date_received).toISOString().split("T")[0]
                                        : ""
                                } onChange={(e) => handleChange("date_received", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Mô tả</Label>
                                <Input value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>Hủy</Button>
                            <Button onClick={handleSave}>{editingDevice ? "Cập nhật" : "Thêm mới"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
