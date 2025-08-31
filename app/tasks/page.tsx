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
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
// } from "@/components/ui/select"
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
import { Check, Search } from "lucide-react"
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
import { createTasks, deleteTask, getTasks, updateTask } from "@/api/task";
import { mapTasksToBoard } from "@/utils/convert";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createComment, getComments } from "@/api/comment";
import { getStaff } from "@/api/staff";
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
  // const [formData, setFormData] = useState({

  // })
  const [searchTerm, setSearchTerm] = useState("");
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
  const [type, setType] = useState<"success" | "error" | null>(null);
  const [isReload, setIsReload] = useState(false)
  // loading skeleton
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const handleAddComment = async () => {
    try {
      const res = await createComment({
        user_id: editingTask?.receiver || "",
        content: newComment,
        task_id: editingTask?.id || ""
      });
      showAlert("Thêm bình luận thành công", "success");
      setIsReload(!isReload)
    } catch (error) {
      showAlert("Thêm bình luận thất bại", "error");
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
    // giả lập call API
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // modal state
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    console.log(result);
    const id = status.find((s: any) => s.display_name.toUpperCase() === result.destination?.droppableId.toUpperCase())?.id;
    // console.log(id);
    await updateTask(result.draggableId, { status_id: id });
    setFormData((prev) => ({ ...prev, reload: !prev.reload }))

  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      console.log(task);

      setFormData({ ...task });
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
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (editingTask) {
      const res = await updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        status_id: formData.status_id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        due_date: formData.dueDate
      });
    } else {
      const res = await createTasks({
        title: formData.title,
        description: formData.description,
        status_id: formData.status_id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        due_date: formData.dueDate
      });
      console.log(res);

    }
    setOpen(false);
    setFormData((prev) => ({ ...prev, reload: !prev.reload }))
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  const fetchTask = async (searchTerm: string) => {
    try {
      const res = await getTasks({ pageSize: 1000, pageIndex: 1, searchTerm });
      // console.log(mapTasksToBoard(res.data.rows));
      setColumns(mapTasksToBoard(res.data.rows).columns);
      setTasks(mapTasksToBoard(res.data.rows).tasks);
    } catch (err) {
      console.error(err);

    }
  };
  const fetchComment = async (id: any) => {
    try {
      const res = await getComments({ pageSize: 1000, pageIndex: 1, taskId: id });
      setComments(res.data.rows)

    } catch (err) {
      console.error(err);

    }
  };
  useEffect(() => {
    setComments([])
    if (editingTask?.id) fetchComment(editingTask.id);
  }, [editingTask?.id, isReload]);

  // },[])
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchTask(searchTerm);
  }, 500); // 500ms debounce

  return () => clearTimeout(delayDebounce);
}, [formData.reload,searchTerm]);
  const fetchStatus = async () => {
    try {
      const res = await getCategory({ pageSize: 1000, pageIndex: 1, scope: "STATUS" });
      setStatus(res.data.rows);
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
    } catch (err) {
      console.error(err);

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

        <div className="relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="pl-10"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
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
                                <p className="text-xs text-red-500 font-medium mt-1">
                                  ⚠️ {task.endDate}
                                </p>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                  <span className="text-blue-500 font-semibold">
                                    {/* {task.description} */}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-2xl">=</span>
                                    <span style={{
                                      backgroundColor: stringToColor(
                                        task?.assignee_name || task.id
                                      ),
                                    }} className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white text-xs">
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
                    value={formData.endDate ? formData.endDate : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">Ngày hoàn thành</Label>
                  <Input
                    className="w-full block min-w-0"
                    type="date"
                    value={formData.dueDate ? formData.dueDate : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <Label className="mb-2">Trạng thái</Label>
                <Select
                  value={formData.status_id}
                  onValueChange={(v) => setFormData({ ...formData, status_id: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  {/* <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent> */}
                  <SelectContent>
                    {
                      status.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Người làm + Người giao */}
              <div className="grid grid-cols-2 gap-4">
                {/* Người giao */}
                <div>
                  <Label className="mb-2 block">Người giao</Label>
                  <Select open={openSender} onOpenChange={setOpenSender}>
                    <SelectTrigger className="w-full">
                      {formData.sender
                        ? staff.find((p) => p.id === formData.sender)?.display_name
                        : "Chọn người giao"}
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
                                        setFormData({ ...formData, sender: person.id })
                                        setOpenSender(false)
                                      }}
                                      className={cn(
                                        "truncate flex items-center justify-between gap-2",
                                        formData.sender === person.id &&
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
                                      {formData.sender === person.id && (
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
                  value={formData.description}
                  className="whitespace-pre-wrap break-words"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Ảnh */}
              {/* <div>
              <Label className="mb-2">Ảnh đại diện</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  className="mt-2 w-24 h-24 object-cover rounded-md shadow"
                />
              )}
                
            </div> */}
              <div className="mt-2">
                <Label className="mb-3 block font-semibold">Bình luận</Label>

                {/* Danh sách bình luận */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                  {comments.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {/* Avatar */}
                      <div style={{
                        backgroundColor: stringToColor(
                          c?.user_name || c?.user_id
                        ),
                      }} className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                        {c?.user_name.slice(0, 2)}
                      </div>
                      {/* Nội dung */}
                      <div className="flex flex-col bg-gray-100 rounded-2xl px-3 py-2 max-w-[80%]">
                        <span className="text-sm font-semibold">{c?.user_name}</span>
                        <span className="text-sm text-gray-800">{c?.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment}>Gửi</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            {editingTask && (
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm("Bạn có chắc muốn xoá nhiệm vụ này?")) {
                    await deleteTask(editingTask.id);
                    setOpen(false);
                    setFormData((prev) => ({ ...prev, reload: !prev.reload }));
                    showAlert("Xóa nhiệm vụ thành công", "success");
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
