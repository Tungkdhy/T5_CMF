import api from "./base";

// Lấy danh sách mục tiêu tác chiến
export async function getCombatTargets({ 
  pageSize = 10, 
  pageIndex = 1, 
  search = "" 
}: {
  pageSize?: number;
  pageIndex?: number;
  search?: string;
}) {
  return api.get("/targets-tctt", {
    params: { 
      page: pageIndex, 
      limit: pageSize,
      ...(search && { search })
    },
  });
}

// Tạo mục tiêu tác chiến mới
export async function createCombatTarget(data: {
  target_name: string;
  target_url: string;
  combat_status: string;
  description?: string;
//   type_target?: string;
  type_target?: string;
}) {
  return api.post("/targets-tctt", data);
}

// Cập nhật mục tiêu tác chiến
export async function updateCombatTarget(id: string, data: {
  target_name?: string;
  target_url?: string;
  combat_status?: string;
  description?: string;
//   type_target?: string;
  type_target?: string;
}) {
  return api.put(`/targets-tctt/${id}`, data);
}

// Xóa mục tiêu tác chiến
export async function deleteCombatTarget(id: string) {
  return api.delete(`/targets-tctt/${id}`);
}

// Lấy chi tiết mục tiêu tác chiến theo id (nếu cần)
export async function getCombatTargetById(id: string) {
  return api.get(`/targets-tctt/${id}`);
}

