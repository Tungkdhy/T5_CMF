import api from "./base";


// Lấy danh sách user
export async function getTasks({
  pageSize = 100000,
  pageIndex = 1,
  searchTerm,
  priority_id,
  status_id,
  description,
  unit_id,
  category_id,
  team_id

}: {
  pageSize?: number;
  pageIndex?: number;
  searchTerm?: string;
  priority_id?: string;
  status_id?: string;
  description?: string;
  unit_id?: string;
  category_id?: string;
  team_id?: string;
}) {
  const params: any = {
    pageSize,
    pageIndex,
  };
  if (searchTerm) params.description = searchTerm;
  if (priority_id) params.priority_id = priority_id;
  if (status_id) params.status_id = status_id;
  if (team_id) params.team_id = team_id;
  if (category_id) params.category_id = category_id;
  // if (description) params.description = description;
  if (unit_id) params.unit_id = unit_id;

  const res = await api.get("/tasks", { params });
  return res.data;
}

// Lấy chi tiết user theo id
export async function getTaskById(id: string) {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
}
export async function createTasks({
  title,
  description,
  status_id,
  start_date,
  end_date,
  due_date,
  priority_id,
  category_id,
  team_id,
  progress_percent,
  assignee_id
}: {
  title: string;
  description: string;
  status_id?: string;
  start_date?: string;
  end_date?: string;
  due_date?: string;
  priority_id?: string;
  category_id?:string;
  team_id?:string;
  progress_percent?:string,
  assignee_id?:string
}) {
  const payload: any = {};

  if (title) payload.title = title;
  if (description) payload.description = description;
  if (status_id) payload.status_id = status_id;
  if (start_date) payload.start_date = start_date;
  if (end_date) payload.end_date = end_date;
  if (due_date) payload.due_date = due_date;
  if (priority_id) payload.priority_id = priority_id;
  if (category_id) payload.category_id = category_id;
  if (team_id) payload.team_id = team_id;
  if (progress_percent) payload.progress_percent = progress_percent;
  if (assignee_id) payload.assignee_id = assignee_id;
  const res = await api.post("/tasks", payload);
  return res.data;
}
export async function updateTask(
  id: string,
  {
    title,
    description,
    status_id,
    start_date,
    end_date,
    due_date,
    priority_id,
    assignee_id,
     category_id,
     team_id,
      progress_percent
  }: {
    title?: string;
    description?: string;
    status_id?: string;
    start_date?: string;
    end_date?: string;
    due_date?: string;
    priority_id?: string;
    assignee_id?: string;
    category_id?: string;
    team_id?: string;
    progress_percent?:string,
    
  }
) {
  // tạo payload chỉ chứa field có giá trị
  const payload: any = {};

  if (title) payload.title = title;
  if (description) payload.description = description;
  if (status_id) payload.status_id = status_id;
  if (start_date) payload.start_date = start_date;
  if (end_date) payload.end_date = end_date;
  if (due_date) payload.due_date = due_date;
  if (priority_id) payload.priority_id = priority_id;
  if (assignee_id) payload.assignee_id = assignee_id;
  if (category_id) payload.category_id = category_id;
  if (team_id) payload.team_id = team_id;
  if (progress_percent) payload.progress_percent = progress_percent;

  const res = await api.put(`/tasks/${id}`, payload);
  return res.data;
}
export async function deleteTask(id: string) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}

export async function sendNotification(data: any) {
  const res = await api.post(`/notifications/send-task-assignment`, data);
  return res.data;
}
export async function sendNotificationDue(data: any) {
  const res = await api.post(`/notifications/send-due-reminder`, data);
  return res.data;
}
export async function sendNotificationProcess(data: any) {
  const res = await api.post(`/notifications/send-progress-update`, data);
  return res.data;
}
// Thêm user mới
