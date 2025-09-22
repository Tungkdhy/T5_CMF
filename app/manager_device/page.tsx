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
import { createDevice, deleteDevice, getDevices, updateDevice } from "@/api/devices";
import { exportExcel } from "@/api/excel";
import { getCategory } from "@/api/categor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Device {
    id: string;
    device_name: string;
    serial_number: string;
    ip_address: string;
    device_status: "active" | "maintenance" | "inactive";
    description: string;
    unit_id?: string;
    reload?: boolean;
}

export default function DeviceManagementPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [formData, setFormData] = useState<Omit<Device, "id">>({
        device_name: "",
        serial_number: "",
        ip_address: "",
        device_status: "active",
        description: "",
        reload: true,
        unit_id: "",
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
        const { reload, ...rest } = formData;
        if (editingDevice) {
            await updateDevice(editingDevice.id, rest);
            showAlert("Cập nhật thành công", "success");
        } else {
            await createDevice(rest);
            showAlert("Thêm mới thành công", "success");
        }
        setFormData((prev) => ({ ...prev, reload: !prev.reload }));
        setEditingDevice(null);
        setIsModalOpen(false);
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingDevice(null);
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
            const res = await exportExcel("managed-devices");
            const workbook = XLSX.read(res, { type: "string" });

            // 2. Lấy sheet đầu tiên từ CSV
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // 3. Tạo workbook mới & append sheet với tên "Tham số"
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Người dùng");

            // 4. Ghi workbook ra buffer Excel
            const excelBuffer = XLSX.write(newWorkbook, {
                bookType: "xlsx",
                type: "array",
            });

            // 5. Tạo file blob và tải về
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "nguoi_dung.xlsx");


        } catch (err) {
            console.error("Export failed:", err);
            showAlert("Xuất Excel thất bại", "error");
        }
    };
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await getDevices({ pageSize: 10, pageIndex: 1 });
                setDevices(res.data.rows);
            } catch (error) {
                console.error("Lấy danh sách thiết bị thất bại", error);
            }
        };
        fetchDevices();
    }, [formData.reload]);
    const fetchSelect = async (page: number) => {
        try {
            const res = await getCategory({ pageSize: 1000, pageIndex: page, scope: "UNIT" });
            // const res2 = await getCategory({ pageSize: 1000, pageIndex: page, scope: "DEVICE_TYPE" });
            // setDeviceTypes(res2.data.rows);
            setUnits(res.data.rows);

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
                        <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            Xuất Excel
                        </Button>
                        <Button onClick={() => {
                            setIsModalOpen(true)
                            setFormData({
                                device_name: "",
                                serial_number: "",
                                ip_address: "",
                                device_status: "active",
                                description: "",
                                reload: true,
                            })
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
                            <TableHead>Serial</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[150px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devices.map((d, i) => (
                            <TableRow key={d.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{d.device_name}</TableCell>
                                <TableCell>{d.serial_number}</TableCell>
                                <TableCell>{d.ip_address}</TableCell>
                                <TableCell>{d.device_status === "active" ? "Hoạt động" : d.device_status === "maintenance" ? "Bảo trì" : "Ngừng"}</TableCell>
                                <TableCell>{d.description}</TableCell>
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
                                <Label className="mb-3">Serial Number</Label>
                                <Input value={formData.serial_number} onChange={(e) => handleChange("serial_number", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Địa chỉ IP</Label>
                                <Input value={formData.ip_address} onChange={(e) => handleChange("ip_address", e.target.value)} />
                            </div>
                            {/* <div>
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
                            </div> */}
                            <div>
                                <Label className="mb-3">Trạng thái</Label>
                                <Input value={formData.device_status} onChange={(e) => handleChange("device_status", e.target.value)} />
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
