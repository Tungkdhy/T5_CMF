import api from "./base";

// Lấy danh sách logs
export async function getLogs({
  pageSize = 10,
  pageIndex = 1,
  searchTerm = "",
  logTypeId = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  searchTerm?: string;
  logTypeId?: string;
}) {
  const filters: Record<string, string> = {};
  if (searchTerm) filters.name = searchTerm;
  if (logTypeId) filters.type = logTypeId;

  const res = await api.get("/logs", {
    params: {
      pageSize,
      pageIndex,
      ...filters,
    },
  });

  return res.data;
}

// Xóa log theo id
export async function deleteLog(id: string) {
  const res = await api.delete(`/logs/${id}`);
  return res.data;
}
