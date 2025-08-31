import api from "./base";


// Lấy danh sách user
export async function getTasks({
  pageSize = 100000,
  pageIndex = 1,
  searchTerm
  // name = "",
  // // visible = true,
  // scope = ""
}: {
  pageSize?: number;
  pageIndex?: number;
  searchTerm?:string
  // name?: string;
  // visible?: boolean;
  // scope?: any;
}) {
  const nameSearch = searchTerm ? {name:searchTerm} : {};
  const res = await api.get("/tasks", {
    params: {
      pageSize,
      pageIndex,
      ...nameSearch,
      // scope,
    },
  });
  return res.data;
}

// Lấy chi tiết user theo id
export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}
export async function createTasks({
  title,
  description,
  status_id,
  start_date,
  end_date,
  due_date,
}: {
  title: string;
  description: string;
  status_id?: string;
  start_date?: string;
  end_date?: string;
  due_date?: string;
}) {
  const res = await api.post("/tasks", {
    title,
    description,
    status_id,
    start_date,
    end_date,
    due_date
  });
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
    due_date
  }: {
    title?: string;
    description?: string;
    status_id?: string;
    start_date?: string;
    end_date?: string;
    due_date?: string;
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

  const res = await api.put(`/tasks/${id}`, payload);
  return res.data;
}
export async function deleteTask(id: string) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}
// Thêm user mới
