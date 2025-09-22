import api from "./base";

// Lấy danh sách thiết bị
export async function getDevices({
  pageSize = 10,
  pageIndex = 1,
  name = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
}) {
  const nameSearch = name ? { device_name: name } : {};

  const res = await api.get("/managed-devices", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
    },
  });

  return res.data;
}

// Lấy chi tiết thiết bị theo id
export async function getDeviceById(id: string) {
  const res = await api.get(`/managed-devices/${id}`);
  return res.data;
}

// Tạo thiết bị mới
export async function createDevice({
  device_name,
  serial_number,
  ip_address,
  device_status,
  description,
  unit_id,
}: {
  device_name: string;
  serial_number: string;
  ip_address: string;
  device_status: "active" | "maintenance" | "inactive";
  description: string;
  unit_id ?: string;
}) {
  const data = unit_id ? { unit_id } : {};
  const res = await api.post("/managed-devices", {
    device_name,
    serial_number,
    ip_address,
    device_status,
    description,
    ...data,
  });
  return res.data;
}

// Cập nhật thiết bị
export async function updateDevice(
  id: string,
  {
    device_name,
    serial_number,
    ip_address,
    device_status,
    description,
    unit_id,
  }: {
    device_name: string;
    serial_number: string;
    ip_address: string;
    device_status: "active" | "maintenance" | "inactive";
    description: string;
    unit_id ?: string;
  }
) {
  const data = unit_id ? { unit_id } : {};
  const res = await api.put(`/managed-devices/${id}`, {
    device_name,
    serial_number,
    ip_address,
    device_status,
    description,
    ...data,
  });
  return res.data;
}

// Xóa thiết bị
export async function deleteDevice(id: string) {
  const res = await api.delete(`/managed-devices/${id}`);
  return res.data;
}
