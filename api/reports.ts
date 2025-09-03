import api from "./base";

// Lấy danh sách report
export async function getReport({
  pageSize = 10,
  pageIndex = 1,
  name = "",
  // report_status = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
  // report_status?: string;
}) {
  const nameSearch = name ? { name } : {};
  const res = await api.get("/deep-reports", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
      // report_status,
    },
  });
  return res.data;
}

// Lấy chi tiết report theo id
export async function getReportById(id: string) {
  const res = await api.get(`/deep-reports/${id}`);
  return res.data;
}

// Tạo report mới
export async function createReport({
  report_name,
  description,
  level_id,
  report_status,
}: {
  report_name: string;
  description: string;
  level_id: string;
  report_status: "draft" | "published";
}) {
  const res = await api.post("/deep-reports", {
    report_name,
    description,
    level_id,
    report_status,
  });
  return res.data;
}

// Cập nhật report
export async function updateReport(
  id: string,
  {
    report_name,
    description,
    level_id,
    report_status,
  }: {
    report_name: string;
    description: string;
    level_id: string;
    report_status: "draft" | "published";
  }
) {
  const res = await api.put(`/deep-reports/${id}`, {
    report_name,
    description,
    level_id,
    report_status,
  });
  return res.data;
}

// Xóa report
export async function deleteReport(id: string) {
  const res = await api.delete(`/deep-reports/${id}`);
  return res.data;
}
