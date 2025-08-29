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
  const res = await api.get("/documents", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
      ...scopeSearch,
    },
  });
  return res.data;
}

// Lấy chi tiết document theo id
export async function getDocumentById(id: string) {
  const res = await api.get(`/documents/${id}`);
  return res.data;
}

// Thêm document mới
export async function createDocument(formData: any) {
  const body = {
    document_type: formData.document_type,
    file_name: formData.file_name,
    description: formData.description,
    file_path: formData.file_path,
    // Nếu muốn dùng category:
    // document_type_category: formData.document_type_category,
  };

  const res = await api.post("/documents", body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật document
export async function updateDocument(
  id: string,
  formData: any

) {
  const body = new FormData();
  body.append("document_type", formData.document_type);
  body.append("file_name", formData.file_name);
  body.append("description", formData.description);
  // if (formData.document_type_category) {
  //   body.append("document_type_category", formData.document_type_category);
  // }
  if (formData.file) {
    body.append("file", formData.file);
  }

  const res = await api.put(`/documents/${id}`, {
    document_type: formData.document_type,
    file_name: formData.file_name,
    description: formData.description,
    file_path: formData.file_path,
    // document_type_category: formData.document_type_category,
    // file: formData.file,
  });
  return res.data;
}

// Xóa document
export async function deleteDocument(id: string) {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
}
