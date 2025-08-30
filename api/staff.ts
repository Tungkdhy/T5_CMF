import api from "./base";

// Lấy danh sách staff
export async function getStaff({ pageSize = 10, pageIndex = 1, name = "" }) {
  return api.get("/staff", {
    params: { pageSize, pageIndex, name },
  });
}

export async function getAllRoles({ pageSize = 10, pageIndex = 1 }) {
  return api.get("/role", {
    params: { pageSize, pageIndex },
  });
}

// Tạo staff mới
export async function createStaff(data: any) {
  return api.post("/staff", data);
}

// Cập nhật staff
export async function updateStaff(id: string, data: any) {
  return api.put(`/staff/${id}`, data);
}

// Xóa staff
export async function deleteStaff(id: string) {
  return api.delete(`/staff/${id}`);
}
