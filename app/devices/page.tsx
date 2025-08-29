"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, XCircle, CheckCircle } from "lucide-react";
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

interface Device {
    id: string;
    unit_id: string;
    device_type: string;
    device_name: string;
    ip_address: string;
    mac_address: string;
    status: "active" | "inactive";
    description: string;
    reload?: boolean;
}

export default function DeviceManagementPage() {
    const [devices, setDevices] = useState<Device[]>([

    ]);

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
            const res = await createDevice( rest);
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
                    pageSize: 1,
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
                        })
                    }} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm thiết bị
                    </Button>
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
                                <TableCell>{d.device_type}</TableCell>
                                <TableCell>{d.unit_id}</TableCell>
                                <TableCell>{d.description}</TableCell>
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
                            <div>
                                <Label className="mb-3">Loại thiết bị</Label>
                                <Input value={formData.device_type} onChange={(e) => handleChange("device_type", e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-3">Đơn vị</Label>
                                <Input value={formData.unit_id} onChange={(e) => handleChange("unit_id", e.target.value)} />
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
