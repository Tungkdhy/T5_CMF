"use client";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Check, Search, ChevronDown, ChevronRight, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Plus, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // 👈 Skeleton từ shadcn

import { getCategory } from "@/api/categor";
import { createTasks, deleteTask, getTaskById, getTasks, sendNotification, sendNotificationDue, sendNotificationProcess, updateTask } from "@/api/task";
import { buildCommentTree, mapTasksToBoard } from "@/utils/convert";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createComment, getComments, replyComment as replyComments, updateComment } from "@/api/comment";
import { createSubTask, getStaff } from "@/api/staff";
import TaskAttachments from "@/components/file/File";
import CommentItem from "@/components/task/Comment";
import api from "@/api/base";
interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  assignee: string;
  reporter: string;
  description: string;
  image?: string;
  completedDate?: string;
  reload?: boolean,
  dueDate?: string,
  status_id?: string,
  sender?: string,
  receiver?: string,
  assignee_name?: string,
  priority_id?: string,
  subTasks?: any,
  category_task?: any,
  team_id?: string,
  progress_percent?: string,
  attachments?: any[],
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const initialTasks: Record<string, Task> = {
  "task-1": {
    id: "task-1",
    title: "Chỉnh sửa giao diện quản lý",
    startDate: "2025-08-01",
    endDate: "2025-08-06",
    status: "todo",
    assignee: "CQ",
    reporter: "An",
    description: "Thiết kế màn hình dashboard",
    image: "https://picsum.photos/300/150?random=1",
  },
  "task-2": {
    id: "task-2",
    title: "API Backend",
    startDate: "2025-08-02",
    endDate: "2025-08-10",
    status: "in-progress",
    assignee: "Nam",
    reporter: "An",
    description: "Xây dựng API cho dashboard",
  },
  "task-3": {
    id: "task-3",
    title: "API Backend",
    startDate: "2025-08-02",
    endDate: "2025-08-10",
    status: "done",
    assignee: "Nam",
    reporter: "An",
    description: "Xây dựng API cho dashboard",
    image: "https://picsum.photos/300/150?random=2",
  },
};

const initialColumns: Record<string, Column> = {
  open: { id: "open", title: "📌 Việc cần làm", taskIds: ["task-1"] },
  "in progress": { id: "in progress", title: "⚡ Đang làm", taskIds: ["task-2"] },
  done: { id: "done", title: "✅ Hoàn thành", taskIds: ["task-3"] },
  cancelled: { id: "cancelled", title: "❌ Đã hủy", taskIds: [] },
};

const columnOrder = ["open", "in progress", "done", "cancelled"];

export default function TasksPage() {
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [detail, setDetail] = useState<any>({})
  const [priority, setPriority] = useState<any[]>([]);
  const [categoryTask, setCategoryTask] = useState<any>([])
  const [listTeam, setListTeam] = useState<any>([]);

  function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
  }
  const [openSender, setOpenSender] = useState(false)
  const [openReceiver, setOpenReceiver] = useState(false)
  const [staff, setStaff] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [tasks, setTasks] = useState(initialTasks);
  const [columns, setColumns] = useState(initialColumns);
  const [status, setStatus] = useState<any[]>([{
    id: '1',
    display_name: "Todo"
  }]);
  const [filter, setFilter] = useState({
    priority_id: "",
    status_id: "",
    description: "",
    unit_id: "",
    searchTerm: "",
    category_id: "",
    team_id: ""
  });
  const [type, setType] = useState<"success" | "error" | null>(null);
  const [isReload, setIsReload] = useState(false)
  const [units, setUnits] = useState<any>([])
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [idDocument, setIdDocument] = useState("")
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [subTasks, setSubTasks] = useState<any[]>([{
    assign: "",
    priority_id: "",
    status_id: "",
    person_id: "",
    title: "Task",


  }]);
  const handleUpdateSubTask = async (data: any, field: string, v = "") => {
    const payload: any = { [field]: v };
    await updateTask(data.id, payload);
    setFormData({ ...formData, reload: !formData.reload });
  }
  const handleAddSubTask = async () => {
    try {
      await createSubTask(detail)
      showAlert("Thêm mới nhiệm vụ phụ thành công", "success");
      setFormData((prev)=>({
        ...prev,
        reload:!prev.reload
      }))
    }
    catch (e: any) {
      showAlert(e.response.data.message, "error");
    }
  };
  // Hàm thêm reply
  const handleAddReply = async (commentId: string, replyText: string) => {
    try {
      // gọi API
      const params = {
        task_id: editingTask?.id,          // biến taskId từ props/context
        user_id: removeQuotes(localStorage.getItem("user") || "") || "",          // biến userId từ auth/context
        content: replyText,
        comment_id: commentId,    // id của comment cha
      }
      await replyComments(params)


      setIsReload(!isReload)
    } catch (err: any) {
      showAlert(err.response.data.message, "error");
    }
  };
  // Hàm sửa comment
  const handleEditComment = async (commentId: string, replyText: string) => {
    try {
      await updateComment(commentId, {
        content: replyText,
        task_id: editingTask?.id,
        user_id: removeQuotes(localStorage.getItem("user") || "") || "",
      })
      setIsReload(!isReload)
    }
    catch (e: any) {
      showAlert(e.response.data.message, "error");
    }
  };
  const handleDeleteSubTask = (id: number) => {
    setSubTasks(subTasks.filter((t) => t.id !== id));
  };
  function removeQuotes(uuid: string): string {
    // Loại bỏ dấu " ở đầu và cuối chuỗi (nếu có)
    return uuid.replace(/^"(.*)"$/, "$1");
  }
  const handleAddComment = async () => {
    try {
      const doc = idDocument ? { document_id: idDocument } : {}
      const res = await createComment({
        user_id: removeQuotes(localStorage.getItem("user") || "") || "",
        content: newComment,
        task_id: editingTask?.id || "",
        ...doc
      });
      showAlert("Thêm bình luận thành công", "success");
      setNewComment("");
      setIsReload(!isReload)
      setIdDocument("")
    } catch (error: any) {
      showAlert(error.response.data.message, "error");
    }
  }
  const showAlert = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setType(type);
    setTimeout(() => {
      setMessage(null);
      setType(null);
    }, 3000);
  };
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  // form data
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    title: "",
    startDate: "",
    dueDate: "",
    endDate: "",
    status: "todo",
    status_id: "",
    assignee: "",
    reporter: "",
    description: "",
    image: "",
    completedDate: "",
    reload: false,
    sender: "",
    receiver: "",
    priority_id: "",
    category_task: "",
    team_id: "",
    attachments: [],
  });

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      setColumns({ ...columns, [start.id]: { ...start, taskIds: newTaskIds } });
      return;
    }

    const newStart = {
      ...start,
      taskIds: start.taskIds.filter((id) => id !== draggableId),
    };
    const newFinish = {
      ...finish,
      taskIds: [
        ...finish.taskIds.slice(0, destination.index),
        draggableId,
        ...finish.taskIds.slice(destination.index),
      ],
    };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    });


    const id = status.find((s: any) => s.display_name.toUpperCase() === result.destination?.droppableId.toUpperCase())?.id;
    // console.log(id);
    try {
      await updateTask(result.draggableId, { status_id: id });
      setFormData((prev) => ({ ...prev, reload: !prev.reload }))
    }
    catch (e: any) {
      showAlert(e.response.data.message, "error");
    }
  };

  const handleOpenModal = async (task?: Task) => {


    try {
      if (task) {
        setEditingTask(task);
        console.log(task);

        setFormData({ ...task, category_task: task.category_task });
        const res = await getTaskById(task.id);
        const {
          id,
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
          // parent_task_id,
          estimated_hours,
          actual_hours,
          assignee_id,
          category_id,
          ...rest
        } = res.data
        setDetail({
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
          parent_task_id: id,
          estimated_hours,
          actual_hours,
          assignee_id,
          category_id
        })
      } else {
        setEditingTask(null);
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          status: "todo",
          assignee: "",
          reporter: "",
          description: "",
          image: "",
          sender: "",
          receiver: "",
          priority_id: ""
        });
      }
      setOpen(true);
    }
    catch (e: any) {
      showAlert(e.response.data.message, "error");
    }

  };

  const handleSave = async () => {
    try {
      if (editingTask) {
        const res = await updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          status_id: formData.status_id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          due_date: formData.dueDate,
          priority_id: formData.priority_id,
          // assignee_id: formData.receiver,
          category_id: formData.category_task,
          team_id: formData.team_id,
          progress_percent: formData.progress_percent,
          assignee_id: formData.receiver,

        });
        setOpen(false);
        setFormData((prev) => ({ ...prev, reload: !prev.reload }))
        // if (formData.receiver && formData.receiver !== editingTask.receiver) {
        //   await sendNotification({
        //     task_id: editingTask.id,
        //     assignee_id: formData.receiver,
        //     task_title: formData.title
        //   });
        // }
        // else if (formData.dueDate !== editingTask.dueDate) {
        //   await sendNotificationDue({
        //     task_id: editingTask.id,
        //     due_date: formData.dueDate,
        //     task_title: formData.title,
        //     assignee_id: formData.receiver,
        //   });
        // }
        // else if (formData.progress_percent !== editingTask.progress_percent) {
        //   await sendNotificationProcess({
        //     task_id: editingTask.id,
        //     progress_percent: formData.progress_percent,
        //     task_title: formData.title,
        //     task_creator_id: editingTask.sender,
        //   });
        // }
      } else {
        const res = await createTasks({
          title: formData.title,
          description: formData.description,
          status_id: formData.status_id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          due_date: formData.dueDate,
          priority_id: formData.priority_id,
          category_id: formData.category_task,
          team_id: formData.team_id,
          progress_percent: formData.progress_percent,
          assignee_id: formData.receiver,
        });
        // if (formData.receiver) {
        //   await sendNotification({
        //     task_id: res.data.id,
        //     assignee_id: formData.receiver,
        //     task_title: formData.title
        //   });
        // }
        setOpen(false);
        setFormData((prev) => ({ ...prev, reload: !prev.reload }))
        showAlert("Thêm mới nhiệm vụ thành công", "success")
      }
    }
    catch (err: any) {
      // console.error(err);
      showAlert(err.response.data.message, "error");
    }

  };
  const fetchTask = async () => {
    try {
      const res = await getTasks({
        pageSize: 1000,
        pageIndex: 1,
        searchTerm: filter.searchTerm,
        priority_id: filter.priority_id,
        status_id: filter.status_id,
        description: filter.description,
        unit_id: filter.unit_id,
        category_id: filter.category_id,
        team_id: filter.team_id
      });
      setColumns(mapTasksToBoard(res.data.rows).columns);
      setTasks(mapTasksToBoard(res.data.rows).tasks);
      // console.log(mapTasksToBoard(res.data.rows).tasks);
      if(editingTask?.id){
        const edit_task = Object.keys(mapTasksToBoard(res.data.rows).tasks).filter(key =>(key === editingTask.id))
        setEditingTask(mapTasksToBoard(res.data.rows).tasks[`${edit_task}`])
      }
    } catch (err: any) {
      showAlert(err.response.data.message, "error");
    }
  };
  const fetchComment = async (id: any) => {
    try {
      const res = await getComments({ pageSize: 1000, pageIndex: 1, taskId: id });
      const convert = buildCommentTree(res.data.rows.reverse())
      setComments(convert)

    } catch (err: any) {
      showAlert(err.response.data.message, "error");

    }
  };

  const handleUpload = async (e: any) => {
    const files = e.target.files?.[0];
    if (files) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", files);
      try {
        const res = await api.post("/documents/upload", formDataUpload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const data = res.data.data;
        setIdDocument(data.id)
      }
      catch (err) {
        console.error("Upload failed:", err);
      }
    }
  }
  useEffect(() => {
    setComments([])
    if (editingTask?.id) fetchComment(editingTask.id);
  }, [editingTask?.id, isReload]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTask();
      
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [filter, formData.reload]);
  const fetchStatus = async () => {
    try {
      const res = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "STATUS" });
      const priority = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "PRIORITY" });
      const unit = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "UNIT" });
      const category_task = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "MISSION" });
      const team = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "FORCE_TCCS" });
      setStatus(res.data.rows);
      setPriority(priority.data.rows);
      setUnits(unit.data.rows)
      setCategoryTask(category_task.data.rows)
      setListTeam(team.data.rows)
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchStatus();
  }, [])
  const fetchStaff = async () => {
    try {
      const res = await getStaff({ pageSize: 1000, pageIndex: 1 });
      setStaff(res.data.data.rows);
    } catch (err: any) {
      showAlert(err.response.data.message, "error");
    }
  }
  useEffect(() => {
    fetchStaff();
  }, [])
  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
          <Alert
            className={`rounded-xl shadow-lg ${type === "success"
              ? "bg-green-100 border-green-500 text-green-800"
              : "bg-red-100 border-red-500 text-red-800"
              }`}
          >
            {type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <AlertTitle>{type === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="mb-4 flex justify-between items-center">
        <div className="mb-4 flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm mhiệm vụ..."
              className="pl-10 w-full min-w-[240px]"
              value={filter.searchTerm}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <Select
              value={filter.category_id}
              onValueChange={(v) => setFilter({ ...filter, category_id: v })}
            >
              <SelectTrigger className="w-full w-[160px]">
                <SelectValue placeholder="Danh mục nhiệm vụ" />
              </SelectTrigger>
              <SelectContent>
                {categoryTask.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={filter.team_id}
              onValueChange={(v) => setFilter({ ...filter, team_id: v })}
            >
              <SelectTrigger className="w-full  w-[160px]">
                <SelectValue placeholder="Đội nhóm" />
              </SelectTrigger>
              <SelectContent>
                {listTeam.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Priority */}
          <div className="flex-1">
            <Select
              value={filter.priority_id}
              onValueChange={(v) => setFilter({ ...filter, priority_id: v })}
            >
              <SelectTrigger className="w-full  w-[160px]">
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                {priority.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Status */}
          <div className="flex-1">
            <Select
              value={filter.status_id}
              onValueChange={(v) => setFilter({ ...filter, status_id: v })}
            >
              <SelectTrigger className="w-full  w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {status.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Description */}

          {/* Unit ID */}
          <div className="flex-1">
            <Select
              value={filter.unit_id}
              onValueChange={(v) => setFilter({ ...filter, unit_id: v })}
            >
              <SelectTrigger className="w-full  w-[160px]">
                <SelectValue placeholder="Đơn vị" />
              </SelectTrigger>
              <SelectContent>
                {units.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Reset Filter Button */}
          <Button
            variant="outline"
            className="min-w-[120px]"
            onClick={() =>
              setFilter({
                priority_id: "",
                status_id: "",
                description: "",
                unit_id: "",
                searchTerm: "",
                category_id: "",
                team_id: ""
              })
            }
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columnOrder.map((colId) => {
            const column = columns[colId];
            const columnTasks = column.taskIds.map((id) => tasks[id]);

            return (
              <Droppable key={colId} droppableId={colId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-xl shadow p-4 flex flex-col ${snapshot.isDraggingOver ? "bg-blue-50" : ""
                      }`}
                  >
                    <h2 className="font-semibold mb-3">{column.title}</h2>

                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="border rounded-lg shadow-sm mb-3 p-3"
                        >
                          <Skeleton className="w-full h-24 mb-2 rounded" />
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))
                      : columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border rounded-lg shadow-sm mb-3 overflow-hidden cursor-pointer hover:shadow-md transition"
                              onClick={() => handleOpenModal(task)}
                            >
                              {task.image && (
                                <img
                                  src={task.image}
                                  alt={task.title}
                                  className="w-full h-32 object-cover"
                                />
                              )}
                              <div className="p-3">
                                <p className="font-medium text-sm line-clamp-2">
                                  {task.title}
                                </p>
                                <p
                                  className={`text-xs font-medium mt-1 ${new Date(task?.dueDate ?? "") < new Date() ? 'text-red-500' : 'text-gray-700'
                                    }`}
                                >
                                  {task.dueDate ? (new Date(task.dueDate) < new Date() ? `⚠️ ${task.dueDate}` : `⏰ ${task.dueDate}`) : "Chưa có hạn"}
                                </p>

                                {/* Progress công việc */}
                                {typeof Number(task.progress_percent) === "number" && (
                                  <div className="mt-2">
                                    <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                                      <span>Tiến độ</span>
                                      <span>{Math.round(Number(task.progress_percent))}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${Math.round(Number(task.progress_percent))}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                  <span className="text-blue-500 font-semibold">
                                    {/* {task.description} */}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-2xl">=</span>
                                    <span
                                      style={{
                                        backgroundColor: stringToColor(task?.assignee_name || task.id),
                                      }}
                                      className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs"
                                    >
                                      {task?.assignee_name?.slice(0, 2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                    {provided.placeholder}

                    {colId === "open" && !loading && (
                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-gray-500 hover:text-black"
                        onClick={() => handleOpenModal()}
                      >
                        <Plus size={16} className="mr-1" /> Thêm mới
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal thêm/sửa task giữ nguyên như code cũ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[60vw] max-w-[60vw] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Chỉnh sửa nhiệm vụ" : "Thêm mới nhiệm vụ"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-4 py-2">
              {/* Tên task */}
              <div>
                <Label className="mb-2">Tên nhiệm vụ</Label>
                <Input
                  placeholder="Nhập tên nhiệm vụ..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="mb-2">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    className="w-full block min-w-0"
                    value={formData.startDate ? formData.startDate : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">Ngày kết thúc</Label>
                  <Input
                    className="w-full block min-w-0"
                    type="date"
                    value={formData.dueDate ? formData.dueDate : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">Ngày hoàn thành</Label>
                  <Input
                    className="w-full block min-w-0"
                    type="date"
                    value={formData.endDate ? formData.endDate : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2">Đội nhóm</Label>
                  <Select
                    value={formData.team_id}
                    onValueChange={(v) => setFormData({ ...formData, team_id: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn đội nhóm" />
                    </SelectTrigger>
                    {/* <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent> */}
                    <SelectContent>
                      {
                        listTeam.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2">Tiến độ</Label>
                  <Input
                    placeholder="Nhập tiến độ (số)"
                    type="number"
                    value={formData.progress_percent}
                    onChange={(e) => setFormData({ ...formData, progress_percent: e.target.value })}
                  />
                </div>
              </div>
              {/* Trạng thái */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2">Trạng thái</Label>
                  <Select
                    value={formData.status_id}
                    onValueChange={(v) => setFormData({ ...formData, status_id: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        status.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2">Độ ưu tiên</Label>
                  <Select
                    value={formData.priority_id}
                    onValueChange={(v) => setFormData({ ...formData, priority_id: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        priority.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Người làm + Người giao */}
              <div className="grid grid-cols-2 gap-4">
                {/* Người giao */}
                <div>
                  <Label className="mb-2 block">Danh mục nhiệm vụ</Label>
                  <Select open={openSender} onOpenChange={setOpenSender}>
                    <SelectTrigger className="w-full">
                      {formData.category_task
                        ? categoryTask.find((p: any) => p.id === formData.category_task)?.display_name
                        : "Chọn danh mục nhiệm vụ"}
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {categoryTask.map((person: any) => (
                                <Tooltip key={person.id}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={person.display_name}
                                      onSelect={() => {
                                        setFormData({ ...formData, category_task: person.id })
                                        setOpenSender(false)
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between gap-2",
                                        formData.category_task === person.id &&
                                        "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">

                                        <span>{person.display_name}</span>
                                      </div>
                                      {formData.category_task === person.id && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{person.display_name}</TooltipContent>
                                </Tooltip>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </TooltipProvider>
                    </SelectContent>
                  </Select>
                </div>

                {/* Người nhận */}
                <div>
                  <Label className="mb-2 block">Người nhận</Label>
                  <Select open={openReceiver} onOpenChange={setOpenReceiver}>
                    <SelectTrigger className="w-full">
                      {formData.receiver
                        ? staff.find((p) => p.id === formData.receiver)?.display_name
                        : "Chọn người nhận"}
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <TooltipProvider>
                        <Command>
                          <CommandInput placeholder="Tìm kiếm..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              {staff.map((person) => (
                                <Tooltip key={person.id}>
                                  <TooltipTrigger asChild>
                                    <CommandItem
                                      value={person.display_name}
                                      onSelect={() => {
                                        setFormData({ ...formData, receiver: person.id })
                                        setOpenReceiver(false)
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between gap-2",
                                        formData.receiver === person.id &&
                                        "bg-blue-100 font-semibold"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                          {person.avatar ? (
                                            <AvatarImage
                                              src={person.avatar}
                                              alt={person.display_name}
                                            />
                                          ) : (
                                            <AvatarFallback
                                              className="text-white font-medium"
                                              style={{
                                                backgroundColor: stringToColor(
                                                  person.display_name || person.id
                                                ),
                                              }}
                                            >
                                              {person.display_name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                          )}
                                        </Avatar>
                                        <span>{person.display_name}</span>
                                      </div>
                                      {formData.receiver === person.id && (
                                        <Check className="h-4 w-4 ml-2 text-blue-600" />
                                      )}
                                    </CommandItem>
                                  </TooltipTrigger>
                                  <TooltipContent>{person.display_name}</TooltipContent>
                                </Tooltip>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </TooltipProvider>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <Label className="mb-2">Mô tả</Label>
                <Textarea
                  rows={6}
                  placeholder="Nhập mô tả chi tiết..."
                  value={formData.description ?? ""}
                  className="whitespace-pre-wrap break-words"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>


              {/* Task con */}
              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <Label className="mb-2 font-semibold flex items-center gap-2">
                    Nhiệm vụ phụ
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSubTasks((prev) => !prev)}
                    >
                      {showSubTasks ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </Button>
                  </Label>
                </div>

                {showSubTasks && (
                  <div className="mt-1 space-y-2">
                    {subTasks.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 text-left">
                              <th className="px-3 py-2 text-sm font-semibold">Tên nhiệm vụ</th>
                              <th className="px-3 py-2 text-sm font-semibold">Người làm</th>
                              <th className="px-3 py-2 text-sm font-semibold">Độ ưu tiên</th>
                              <th className="px-3 py-2 text-sm font-semibold">Trạng thái</th>

                            </tr>
                          </thead>
                          <tbody>
                            {editingTask?.subTasks && editingTask?.subTasks.map((st: any, idx: number) => (
                              <tr onClick={() => handleOpenModal(st)} key={idx} className="border-t hover:bg-gray-50" >
                                {/* Tên task */}
                                <td className="px-3 py-2 text-sm">{st.title}</td>

                                {/* Người làm */}
                                <td className="px-3 py-2 text-sm">
                                  <Select
                                    value={st.receiver}
                                    onValueChange={(v) =>
                                      handleUpdateSubTask(st, "assignee_id", v)
                                    }
                                  >
                                    <SelectTrigger onClick={(e) => e.stopPropagation()} className="w-[150px]">
                                      <SelectValue placeholder="Chọn người làm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {staff.map((person) => (
                                        <SelectItem key={person.id} value={person.id}>
                                          {person.display_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {/* Độ ưu tiên */}
                                <td className="px-3 py-2 text-sm">
                                  <Select
                                    value={st.priority_id}
                                    onValueChange={(v) =>
                                      handleUpdateSubTask(st, "priority_id", v)
                                    }
                                  >
                                    <SelectTrigger onClick={(e) => e.stopPropagation()} className="w-[120px]">
                                      <SelectValue placeholder="Chọn ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {priority.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.display_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {/* Trạng thái */}
                                <td className="px-3 py-2 text-sm">
                                  <Select
                                    value={st.status_id}
                                    onValueChange={(v) =>
                                      handleUpdateSubTask(st, "status_id", v)
                                    }
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {status.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                          {s.display_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {/* Hành động */}

                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có task con nào</p>
                    )}

                    {/* Nút + để bật form thêm */}
                    {!showAddSubTask ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAddSubTask(true)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Nhập tên task con..."
                          value={detail.title}
                          onChange={(e) => setDetail({
                            ...detail,
                            title: e.target.value
                          })}
                        />
                        <Button onClick={handleAddSubTask}>Thêm</Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowAddSubTask(false);
                            // setNewSubTask("");
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* // File đính kèm */}
              <TaskAttachments taskId={editingTask?.id ?? null} />
              {/* Danh sách bình luận */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    onReply={handleAddReply}
                    onEdit={handleEditComment}
                  />
                ))}
              </div>

              {/* Input bình luận mới */}
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment}>Gửi</Button>
                </div>

                {/* Upload file cho comment */}
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                />
              </div>

            </div>
          </div>
          <DialogFooter>
            {editingTask && (
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    if (confirm("Bạn có chắc muốn xoá nhiệm vụ này?")) {
                      await deleteTask(editingTask.id);
                      setOpen(false);
                      setFormData((prev) => ({ ...prev, reload: !prev.reload }));
                      showAlert("Xóa nhiệm vụ thành công", "success");
                    }
                  } catch (err: any) {
                    // console.error(err);
                    showAlert(err.response.data.message, "error");
                  }
                }}
              >
                Xoá
              </Button>
            )}
            <Button onClick={handleSave} className="">
              {editingTask ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
