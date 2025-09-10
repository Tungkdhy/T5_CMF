import api from "./base";

// Lấy danh sách file đính kèm theo taskId
export async function getTaskAttachments(taskId: string | number) {
  const res = await api.get(`/task-attachments`, {
    params: { task_id: taskId, pageSize: 10, pageIndex: 1 },
  });
  return res.data;
}

// Tạo file đính kèm mới
// data: { task_id: string; file: File }
export async function createTaskAttachment(data: {
  task_id: string | number;
  file_name: string;
  file_url: string;
}) {
  const formData = new FormData();
  formData.append("task_id", String(data.task_id));
  formData.append("file_name", data.file_name);
  formData.append("file_url", data.file_url);

  const res = await api.post(`/task-attachments`,data);
  return res.data;
}

// Xoá file đính kèm
export async function deleteTaskAttachment(id: string | number) {
  const res = await api.delete(`/task-attachments/${id}`);
  return res.data;
}

// Cập nhật file đính kèm (nếu API có cho phép đổi tên, thay file, ...)
export async function updateTaskAttachment(
  id: string | number,
  data: { name?: string }
) {
  const res = await api.put(`/task-attachments/${id}`, data);
  return res.data;
}

// Lấy chi tiết file đính kèm theo id
export async function getTaskAttachmentById(id: string | number) {
  const res = await api.get(`/task-attachments/${id}`);
  return res.data;
}
