export function mapTasksToBoard(data: any) {
  const statusMap: Record<string, string> = {
    Open: "open",
    "In Progress": "in progress",
    Done: "done",
    Cancelled: "cancelled",
  };

  const columns: any = {
    open: { id: "open", title: "📌 Cần làm", taskIds: [] },
    "in progress": { id: "in progress", title: "⚡ Đang làm", taskIds: [] },
    done: { id: "done", title: "✅ Hoàn thành", taskIds: [] },
    cancelled: { id: "cancelled", title: "❌ Đã hủy", taskIds: [] },
  };

  const tasks: Record<string, any> = {};

  // Tạo bản đồ task trước
  data.forEach((t: any) => {
    tasks[t.id] = {
      id: t.id,
      title: t.title,
      code: t.code,
      status: t.status.display_name,
      priority: t.priority?.display_name,
      type: t.type?.display_name,
      startDate: t.start_date,
      dueDate: t.due_date,
      endDate: t.end_date,
      progress: t.progress_percent,
      description: t.description,
      status_id: t.status?.id,
      receiver: t.assignee_id,
      assignee_name: t.assignee_name,
      priority_id: t.priority?.id,
      category_task: t.category_id,
      team_id: t.team_id,
      parent_task_id: t.parent_task_id,
      subTasks: [], 
    };
  });

  // Gán subtask vào cha
  data.forEach((t: any) => {
    if (t.parent_task_id && tasks[t.parent_task_id]) {
      tasks[t.parent_task_id].subTasks.push(tasks[t.id]);
    } else {
      const colKey = statusMap[t.status.display_name] || "open";
      columns[colKey].taskIds.push(t.id);
    }
  });

  // cập nhật lại title với số lượng task
  Object.keys(columns).forEach((key) => {
    const col = columns[key];
    col.title = `${col.title} (${col.taskIds.length})`;
  });

  return { tasks, columns, columnOrder: Object.keys(columns) };
}