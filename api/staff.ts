import api from "./base";

// Lấy danh sách staff
export async function getStaff({ pageSize = 10, pageIndex = 1, name = "", filters = {} }) {
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v != null)
  );
  return api.get("/staff", {
    params: { pageSize, pageIndex, name, unit_id: cleanedFilters.unit, tckgm_level_id: cleanedFilters.level_tckgm, skills: cleanedFilters.skill, certificates: cleanedFilters.certificate },
  });
}

export async function getAllRoles({ pageSize = 10, pageIndex = 1 }) {
  return api.get("/role", {
    params: { pageSize, pageIndex },
  });
}

// Tạo staff mới
export async function createStaff(data: any) {
  const { user_name, created_at, created_by, tckgm_level_name, rank_name, certificate, skill, position_name, organization, unit, ...rest } = data;

  return api.post("/staff", {
    ...rest,
    rank_id: data.rank_name,
    position_id: data.position_name,
    tckgm_level_id: data.tckgm_level_name,
    certificates: data.certificate || [],
    skills: data.skill || [],
    // user_name: data.rank_name,
  });
}

// Cập nhật staff
export async function updateStaff(id: string, data: any) {
  const { user_name, created_at, created_by, tckgm_level_name, rank_name, certificate, skill, position_name, organization, unit, ...rest } = data;
  return api.put(`/staff/${id}`, {
    ...rest,
    rank_id: data.rank_name,
    position_id: data.position_name,
    tckgm_level_id: data.tckgm_level_name,
    certificates: data.certificate || [],
    skills: data.skill || [],

  });
}
export async function getOrganozations(id: string) {
  return api.get(`/category/organizations/by-unit/${id}`, {
    params: { pageSize:1000, pageIndex:1 },

  });
}
export async function createSubTask({
  code,
  title,
  description,
  status_id,
  priority_id,
  type_id,
  relation_domain_id,
  start_date,
  due_date,
  end_date,
  progress_percent,
  parent_task_id,
  estimated_hours,
  actual_hours,
  assignee_id,
}: {
  code?: string;
  title: string;
  description?: string;
  status_id?: string;
  priority_id?: string;
  type_id?: string;
  relation_domain_id?: string | null;
  start_date?: string;
  due_date?: string;
  end_date?: string | null;
  progress_percent?: string;
  parent_task_id: string; // bắt buộc vì là subtask
  estimated_hours?: string | number | null;
  actual_hours?: string | number | null;
  assignee_id?: string;
}) {
  const payload: any = {};

  if (code) payload.code = code;
  if (title) payload.title = title;
  if (description) payload.description = description;
  if (status_id) payload.status_id = status_id;
  if (priority_id) payload.priority_id = priority_id;
  if (type_id) payload.type_id = type_id;
  if (relation_domain_id) payload.relation_domain_id = relation_domain_id;
  if (start_date) payload.start_date = start_date;
  if (due_date) payload.due_date = due_date;
  if (end_date) payload.end_date = end_date;
  if (progress_percent) payload.progress_percent = progress_percent;
  if (parent_task_id) payload.parent_task_id = parent_task_id;
  if (estimated_hours) payload.estimated_hours = estimated_hours;
  if (actual_hours) payload.actual_hours = actual_hours;
  if (assignee_id) payload.assignee_id = assignee_id;

  const res = await api.post("/tasks", payload);
  return res.data;
}
// Xóa staff
export async function deleteStaff(id: string) {
  return api.delete(`/staff/${id}`);
}
