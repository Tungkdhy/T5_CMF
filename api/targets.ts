import api from "./base";

// Lấy danh sách target
export async function getTargets({
  pageSize = 10,
  pageIndex = 1,
}: {
  pageSize?: number;
  pageIndex?: number;
}) {
  const res = await api.get("/combat-targets", {
    params: {
      limit:pageSize,
      page:pageIndex,
    },
  });
  return res.data;
}

// Tạo target mới
export async function createTarget(data: {
  target_name: string;
  target_url: string;
  combat_status?: string;
  description?: string;
}) {
  const res = await api.post("/combat-targets", data);
  return res.data;
}

// Cập nhật target
export async function updateTarget(
  id: string,
  data: {
    target_name?: string;
    target_url?: string;
    combat_status?: string;
    description?: string;
  }
) {
  const res = await api.put(`/combat-targets/${id}`, data);
  return res.data;
}

// Xóa target
export async function deleteTarget(id: string) {
  const res = await api.delete(`/combat-targets/${id}`);
  return res.data;
}

// Lấy chi tiết target theo id (nếu cần)
export async function getTargetById(id: string) {
  const res = await api.get(`/combat-targets/${id}`);
  return res.data;
}
