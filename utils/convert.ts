export function mapTasksToBoard(data: any[], statusMap: Record<string, string>, columns: any) {
  const tasks: Record<string, any> = {};

  // build tasks
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
      sender: t.sender_id,
    };
  });

  // assign tasks
  data.forEach((t: any) => {
    if (t.parent_task_id && tasks[t.parent_task_id]) {
      tasks[t.parent_task_id].subTasks.push(tasks[t.id]);
    } else {
      const colKey = statusMap[t.status?.display_name] || "open";
      if (columns[colKey]) {
        columns[colKey].taskIds.push(t.id);
      }
    }
  });

  // update titles
  Object.keys(columns).forEach((key) => {
    const col = columns[key];
    col.title = `${col.title} (${col.taskIds.length})`;
  });

  return { tasks, columns, columnOrder: Object.keys(columns) };
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