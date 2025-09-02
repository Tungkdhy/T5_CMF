import api from "./base";

// Lấy danh sách user
export async function getUsers({ pageSize = 10, pageIndex = 1, name = "" }) {
  return api.get("/user/all", {
    params: { pageSize, pageIndex, name },
  });
}
export async function getAllRoles({ pageSize = 10, pageIndex = 1 }) {
  return api.get("/role", {
    params: { pageSize, pageIndex },
  });
}

// Tạo user mới
export async function createUser(data: any) {
  return api.post("/user", data);
}

// Cập nhật user
export async function updateUser(id: string, data: any) {
  const {password,role, ...rest} = data;
  return api.put(`/user/${id}`, {...rest,role_id: role});
}

// Xóa user
export async function deleteUser(id: string) {
  return api.delete(`/user/${id}`);
}