import api from "./base";


// Lấy danh sách user
export async function getCategoryType({
  pageSize = 10,
  pageIndex = 1,
  // name = "",
  visible,
}: {
  pageSize?: number;
  pageIndex?: number;
  name?: string;
  visible?: boolean;
}) {
  const visibleCheck = visible ? {visible} : {};
  const res = await api.get("/category-types", {
    params: {
      pageSize,
      pageIndex,
      // name,
      ...visibleCheck,
    },
  });
  return res.data;
}
export async function updateCategoryType(
  id: string,
  data: {
    // name?: string;
    display_name?: string;
    description?: string;
    scope?: string;
    visible?: boolean;
    // thêm các trường khác nếu cần
  }
) {
  
  
  const res = await api.put(`/category-types/${id}`, data);
  return res.data;
}
export async function createCategoryType(data: {
  display_name: string;
  description?: string;
  visible?: boolean;
  // thêm các trường khác nếu cần
}) {
  const res = await api.post('/category-types', data);
  return res.data;
}
export async function deleteCategoryType(id: string) {
  const res = await api.delete(`/category-types/${id}`);
  return res.data;
}
// Lấy chi tiết user theo id
export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

// Thêm user mới
