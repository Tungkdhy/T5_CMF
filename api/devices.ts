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
  device_type_id,
  owner,
  date_received

}: {
  device_name: string;
  serial_number: string;
  ip_address: string;
  device_status: "active" | "maintenance" | "inactive";
  description: string;
  unit_id?: string;
  device_type_id?: string;
  owner?: string;
  date_received?: string
}) {
  const data = unit_id ? { unit_id } : {};
  const data_2 = device_type_id ? { device_type_id } : {};
  const data_3 = owner ? { owner } : {};
  const res = await api.post("/managed-devices", {
    device_name,
    serial_number,
    ip_address,
    device_status,
    description,
    ...data,
    ...data_2,
    ...data_3,
    date_received
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
    device_type_id,
    owner,
    date_received
  }: {
    device_name: string;
    serial_number: string;
    ip_address: string;
    device_status: "active" | "maintenance" | "inactive";
    description: string;
    unit_id?: string;
    device_type_id?: string;
    owner?: string;
    date_received?: string
  }
) {
  const data = unit_id ? { unit_id } : {};
  const data_2 = device_type_id ? { device_type_id } : {};
  const data_3 = owner ? { owner } : {};
  const res = await api.put(`/managed-devices/${id}`, {
    device_name,
    serial_number,
    ip_address,
    device_status,
    description,
    ...data,
    ...data_2,
    ...data_3,
    date_received
  });
  return res.data;
}

// Xóa thiết bị
export async function deleteDevice(id: string) {
  const res = await api.delete(`/managed-devices/${id}`);
  return res.data;
}
