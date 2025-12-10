// Icon mapping cho các trạng thái
const statusIcons: Record<string, string> = {
  open: "📌",
  in_progress: "⚡",
  done: "✅",
  cancelled: "❌",
};

export interface StatusItem {
  id: string;
  display_name: string;
  value: string;
  description: string;
  is_default?: boolean;
  is_active?: boolean;
}

export function mapTasksToBoard(data: any, statusList: StatusItem[] = []) {
  // Tạo statusMap và columns động từ statusList
  const statusMap: Record<string, string> = {};
  const columns: any = {};
  const columnOrder: string[] = [];

  // Sắp xếp status theo thứ tự: open -> in_progress -> done -> cancelled
  const statusOrder = ["open", "in_progress", "done", "cancelled"];
  const sortedStatusList = [...statusList].sort((a, b) => {
    const indexA = statusOrder.indexOf(a.value);
    const indexB = statusOrder.indexOf(b.value);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Build dynamic statusMap và columns từ API data
  sortedStatusList.forEach((status) => {
    const key = status.value; // Sử dụng value làm key (open, in_progress, done, cancelled)
    statusMap[status.display_name] = key;
    const icon = statusIcons[key] || "📋";
    columns[key] = {
      id: key,
      title: `${icon} ${status.description}`,
      taskIds: [],
    };
    columnOrder.push(key);
  });

  // Fallback nếu không có statusList
  if (statusList.length === 0) {
    const defaultStatuses = [
      { value: "open", display_name: "Open", description: "Cần làm" },
      { value: "in_progress", display_name: "In Progress", description: "Đang làm" },
      { value: "done", display_name: "Done", description: "Hoàn thành" },
      { value: "cancelled", display_name: "Cancelled", description: "Đã hủy" },
    ];
    defaultStatuses.forEach((status) => {
      statusMap[status.display_name] = status.value;
      const icon = statusIcons[status.value] || "📋";
      columns[status.value] = {
        id: status.value,
        title: `${icon} ${status.description}`,
        taskIds: [],
      };
      columnOrder.push(status.value);
    });
  }

  const tasks: Record<string, any> = {};

  // Tạo bản đồ task trước
  data.forEach((t: any) => {
    tasks[t.id] = {
      id: t.id,
      title: t.title,
      code: t.code,
      status: t.status?.display_name,
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
      progress_percent: t.progress_percent,
      actual_hours: t.actual_hours,
      estimated_hours: t.estimated_hours,
      sender: t.sender_id,
      author_name: t.author_name,
    };
  });

  // Gán subtask vào cha
  data.forEach((t: any) => {
    if (t.parent_task_id && tasks[t.parent_task_id]) {
      tasks[t.parent_task_id].subTasks.push(tasks[t.id]);
    } else {
      const colKey = statusMap[t?.status?.display_name] || columnOrder[0] || "open";
      if (columns[colKey]) {
        columns[colKey].taskIds.push(t.id);
      }
    }
  });

  // Cập nhật lại title với số lượng task
  Object.keys(columns).forEach((key) => {
    const col = columns[key];
    // Lấy lại title gốc (không có số lượng) để tránh duplicate
    const baseTitle = col.title.replace(/\s*\(\d+\)$/, "");
    col.title = `${baseTitle} (${col.taskIds.length})`;
  });

  return { tasks, columns, columnOrder };
}
interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  user_name: string;
  comment_id: string | null; // id của comment cha (nếu là reply)
  replies?: Comment[];
}

export function buildCommentTree(data: Comment[]): Comment[] {
  const map: Record<string, Comment & { replies: Comment[] }> = {};

  // Tạo map trước
  data.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  const roots: Comment[] = [];

  data.forEach((c) => {
    if (c.comment_id) {
      // Nếu là reply → push vào comment cha
      if (map[c.comment_id]) {
        map[c.comment_id].replies.push(map[c.id]);
      }
    } else {
      // Nếu là comment cha → push vào root
      roots.push(map[c.id]);
    }
  });

  return roots;
}