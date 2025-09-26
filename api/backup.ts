// src/api/restore-backup.ts
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
  const res = await api.get("/restore-backup", {
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
  const res = await api.delete(`/restore-backup/restore/${id}`);
  return res.data;
}
export async function deleteBackupAll() {
  const res = await api.delete(`/restore-backup/clear-system`);
  return res.data;
}

// Phục hồi bản backup theo id
export async function restoreBackup(id: string) {
  const res = await api.post(`/restore-backup/restore/${id}`);
  return res.data;
}

// Tạo mới bản backup
export async function createBackup({
  
  type = 0,
}: {

  type?: number;
}) {
  const res = await api.post("/restore-backup/backup", {

    type,
  });
  return res.data;
}
