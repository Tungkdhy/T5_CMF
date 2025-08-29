import api from "./base";

export interface User {
  id: string;
  user_name: string;
  display_name: string;
  email?: string;
}

// Lấy danh sách user
export async function getUsers() {
  const res = await api.get("/user");
  return res.data;
}

// Lấy chi tiết user theo id
export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

// Thêm user mới
export async function createUser(user: Omit<User, "id">) {
  const res = await api.post("/users", user);
  return res.data;
}

// Cập nhật user
export async function updateUser(id: string, user: Partial<User>) {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
}

// Xoá user
export async function deleteUser(id: string): Promise<{ message: string }> {
  const res = await api.delete(`users/${id}`);
  return res.data;
}