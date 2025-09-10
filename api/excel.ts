import api from "./base";

// Xuất Excel
export async function exportExcel(path:string) {
  const res = await api.get(`/${path}/export-csv`);
  return res.data;
}
