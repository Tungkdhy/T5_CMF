import api from "./base";

// Lấy danh sách document
export async function getDocuments({
  pageSize = 10,
  pageIndex = 1,
  name = "",
  scope = ""
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
  scope?: any;
}) {
  const nameSearch = name ? { name } : {};
  const scopeSearch = scope ? { scope } : {};
  const res = await api.get("/combat-collected-data", {
    params: {
      limit:pageSize,
      page:pageIndex,
      // ...nameSearch,
      // ...scopeSearch,
    },
  });
  return res.data;
}

// Lấy chi tiết document theo id
export async function getDocumentById(id: string) {
  const res = await api.get(`/combat-collected-data/${id}`);
  return res.data;
}

// Thêm document mới
export async function createDocument(formData: any) {

  const res = await api.post("/combat-collected-data", formData);
  return res.data;
}

// Cập nhật document
export async function updateDocument(id: string, formData: any) {
  const body = new FormData();
  body.append("document_type", formData.document_type || "");
  body.append("file_name", formData.file_name || "");
  body.append("description", formData.description || "");
  if (formData.file) {
    body.append("file", formData.file);
  }
  if (formData.file_path) {
    body.append("file_path", formData.file_path);
  }
  if (formData.document_type_category) {
    body.append("document_type_category", formData.document_type_category);
  }

  const res = await api.put(`/combat-collected-data/${id}`, formData);
  return res.data;
}

// Xóa document
export async function deleteDocument(id: string) {
  const res = await api.delete(`/combat-collected-data/${id}`);
  return res.data;
}
