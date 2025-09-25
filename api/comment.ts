import api from "./base";

// Lấy danh sách comment
export async function getComments({
  pageSize = 10,
  pageIndex = 1,
  taskId = "",
}: {
  pageSize?: number;
  pageIndex?: number;
  taskId?: string;
}) {
  const taskFilter = taskId ? { task_id: taskId } : {};

  const res = await api.get("/task-comments", {
    params: {
      pageSize,
      pageIndex,
      ...taskFilter,
    },
  });

  return res.data;
}

// Lấy chi tiết comment theo id
export async function getCommentById(id: string) {
  const res = await api.get(`/task-comments/${id}`);
  return res.data;
}

// Tạo comment mới
export async function createComment({
  task_id,
  user_id,
  content,
}: {
  task_id: string;
  user_id: string;
  content: string;
}) {
  const res = await api.post("/task-comments", {
    task_id,
    user_id,
    content,
  });
  return res.data;
}

// Cập nhật comment
export async function updateComment(
  id: string,
  {
    content,
    task_id,
    user_id
  }: {
    content: string;
    task_id:string,
    user_id:string
  }
) {
  const res = await api.put(`/task-comments/${id}`, {
    content,
    task_id,
    user_id
  });
  return res.data;
}

// Xóa comment
export async function deleteComment(id: string) {
  const res = await api.delete(`/task-comments/${id}`);
  return res.data;
}

export async function replyComment({
  task_id,
  user_id,
  content,
  comment_id
}: {
  task_id?: string;
  user_id?: string;
  content?: string;
  comment_id?:string
}) {
  const res = await api.post("/task-comments", {
    task_id,
    user_id,
    content,
    comment_id
  });
  return res.data;
}