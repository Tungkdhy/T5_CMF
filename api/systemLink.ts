import api from "./base";

// Lấy danh sách link hệ thống
export async function getSystemLinks({
  pageSize = 10,
  pageIndex = 1,
  systemName = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  systemName?: string;
}) {
  const search = systemName ? { system_name: systemName } : {};

  const res = await api.get("/system_links", {
    params: {
      pageSize,
      pageIndex,
      ...search,
    },
  });

  return res.data;
}

// Lấy chi tiết link hệ thống theo id
export async function getSystemLinkById(id: string) {
  const res = await api.get(`/system_links/${id}`);
  return res.data;
}

// Tạo link hệ thống mới
export async function createSystemLink({
  system_name,
  link_url,
  description,
}: {
  system_name: string;
  link_url: string;
  description: string;
}) {
  const res = await api.post("/system_links", {
    system_name,
    link_url,
    description,
  });
  return res.data;
}

// Cập nhật link hệ thống
export async function updateSystemLink(
  id: string,
  {
    system_name,
    link_url,
    description,
  }: {
    system_name: string;
    link_url: string;
    description: string;
  }
) {
  const res = await api.put(`/system_links/${id}`, {
    system_name,
    link_url,
    description,
  });
  return res.data;
}

// Xóa link hệ thống
export async function deleteSystemLink(id: string) {
  const res = await api.delete(`/system_links/${id}`);
  return res.data;
}
