export function mapTasksToBoard(data: any) {
  const statusMap: Record<string, string> = {
    Open: "open",
    "In Progress": "in progress",
    Done: "done",
    Cancelled: "cancelled",
  };

  const columns: any = {
    open: { id: "open", title: "📌 Việc cần làm", taskIds: [] },
    "in progress": { id: "in progress", title: "⚡ Đang làm", taskIds: [] },
    done: { id: "done", title: "✅ Hoàn thành", taskIds: [] },
    cancelled: { id: "cancelled", title: "❌ Đã hủy", taskIds: [] },
  };

  const tasks: Record<string, any> = {};
  let colFull;
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
    };

    const colKey = statusMap[t.status.display_name] || "open";
    colFull = statusMap;
    columns[colKey].taskIds.push(t.id);
  });

  // cập nhật lại title với số lượng task
  Object.keys(columns).forEach((key) => {
    const col = columns[key];
    col.title = `${col.title} (${col.taskIds.length})`;
  });

  return { tasks, colFull, columns, columnOrder: Object.keys(columns) };
}
