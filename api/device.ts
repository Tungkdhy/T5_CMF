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

  const res = await api.get("/unit-devices", {
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
  const res = await api.get(`/dashboard/overview/${id}`);
  return res.data;
}

// Tạo thiết bị mới
export async function createDevice({
  unit_id,
  device_type,
  device_name,
  ip_address,
  mac_address,
  status,
  description,
}: {
  unit_id: string;
  device_type: string;
  device_name: string;
  ip_address: string;
  mac_address: string;
  status: "active" | "inactive";
  description: string;
}) {
  const data = unit_id ? { unit_id } : {};
  const res = await api.post("/unit-devices", {
    ...data,
    device_type,
    device_name,
    ip_address,
    mac_address,
    status,
    description,
  });
  return res.data;
}

// Cập nhật thiết bị
export async function updateDevice(
  id: string,
  {
    unit_id,
    device_type,
    device_name,
    ip_address,
    mac_address,
    status,
    description,
  }: {
    unit_id: string;
    device_type: string;
    device_name: string;
    ip_address: string;
    mac_address: string;
    status: "active" | "inactive";
    description: string;
  }
) {
  const data = unit_id ? { unit_id } : {};
  const res = await api.put(`/unit-devices/${id}`, {
    ...data,
    device_type,
    device_name,
    ip_address,
    mac_address,
    status,
    description,
  });
  return res.data;
}

// Xóa thiết bị
export async function deleteDevice(id: string) {
  const res = await api.delete(`/unit-devices/${id}`);
  return res.data;
}
