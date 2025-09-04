// src/api/backup.ts
import api from "./base";

// Lấy danh sách backup
export async function getBackups({
  pageSize = 10,
  pageIndex = 1,
  name = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
}) {
  const nameSearch = name ? { name } : {};
  const res = await api.get("/backup", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
    },
  });
  return res.data;
}

// Xóa bản backup theo id
export async function deleteBackup(id: string) {
  const res = await api.delete(`/backup/${id}`);
  return res.data;
}

// Phục hồi bản backup theo id
export async function restoreBackup(id: string) {
  const res = await api.post(`/restore-backup`, { id });
  return res.data;
}

// Tạo mới bản backup
export async function createBackup({
  name,
  type = 0,
}: {
  name: string;
  type?: number;
}) {
  const res = await api.post("/backup", {
    name,
    type,
  });
  return res.data;
}
