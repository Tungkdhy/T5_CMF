import api from "./base";


// Lấy danh sách user
export async function getCategory({
  pageSize = 10,
  pageIndex = 1,
  name = "",
  // visible = true,
  scope = ""
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
  visible?: boolean;
  scope?: any;
}) {
  const nameSearch = name ? {name} : {};
  const res = await api.get("/category", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
      scope,
    },
  });
  return res.data;
}

// Lấy chi tiết user theo id
export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}
export async function createCategory({
  display_name,
  description,
  value,
  category_type_id,
}: {
  display_name: string;
  description: string;
  value: string;
  category_type_id?: string;
}) {
  const res = await api.post("/category", {
    display_name,
    description,
    value,
    category_type_id,
  });
  return res.data;
}
export async function updateCategory(
  id: string,
  {
    display_name,
    description,
    value,
    category_type_id,
  }: {
    display_name: string;
    description: string;
    value: string;
    category_type_id?: string;
  }
) {
  const categoryTypeId = category_type_id ? {category_type_id} : {};
  const res = await api.put(`/category/${id}`, {
    display_name,
    description,
    value,
    ...categoryTypeId,
  });
  return res.data;
}
export async function deleteCategory(id: string) {
  const res = await api.delete(`/category/${id}`);
  return res.data;
}
// Thêm user mới
