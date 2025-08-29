"use client";
import { useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Search,
  Menu,
  User,
  CheckCircle,
  Clock,
  Circle,
  Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data
const statsData = [
  { title: "Tổng người dùng", value: "12,361", change: "+12%", icon: Users, color: "bg-blue-500" },
  { title: "Tổng danh mục", value: "1,200", change: "+8%", icon: Package, color: "bg-green-500" },
  { title: "Loại danh mục", value: "24", change: "+2%", icon: ShoppingCart, color: "bg-purple-500" },
  { title: "Tổng công việc", value: "42", change: "+5%", icon: CheckCircle, color: "bg-yellow-500" },
];

const recentActivities = [
  { id: 1, user: "Nguyễn Văn A", action: "đã thêm danh mục mới", time: "2 phút trước" },
  { id: 2, user: "Trần Thị B", action: "đã cập nhật loại danh mục", time: "15 phút trước" },
  { id: 3, user: "Lê Văn C", action: "đã xóa người dùng", time: "1 giờ trước" },
  { id: 4, user: "Phạm Thị D", action: "đã tạo tài khoản mới", time: "3 giờ trước" },
  { id: 5, user: "Hoàng Văn E", action: "đã chỉnh sửa danh mục", time: "5 giờ trước" },
];

// Chart data
const userGrowthData = [
  { name: 'Tháng 1', users: 400 },
  { name: 'Tháng 2', users: 300 },
  { name: 'Tháng 3', users: 200 },
  { name: 'Tháng 4', users: 278 },
  { name: 'Tháng 5', users: 189 },
  { name: 'Tháng 6', users: 239 },
  { name: 'Tháng 7', users: 349 },
];

const categoryDistributionData = [
  { name: 'Sản phẩm', value: 45 },
  { name: 'Dịch vụ', value: 25 },
  { name: 'Blog', value: 20 },
  { name: 'Khác', value: 10 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

const monthlyPerformanceData = [
  { name: 'Tháng 1', danhMuc: 240 },
  { name: 'Tháng 2', danhMuc: 138 },
  { name: 'Tháng 3', danhMuc: 980 },
  { name: 'Tháng 4', danhMuc: 390 },
  { name: 'Tháng 5', danhMuc: 480 },
  { name: 'Tháng 6', danhMuc: 380 },
  { name: 'Tháng 7', danhMuc: 430 },
];

// Task data
const taskData = [
  { id: 1, title: "Thiết kế giao diện dashboard", status: "completed", priority: "high", assignee: "Nguyễn Văn A", dueDate: "2023-06-15" },
  { id: 2, title: "Tích hợp API danh mục", status: "in-progress", priority: "high", assignee: "Trần Thị B", dueDate: "2023-06-20" },
  { id: 3, title: "Tối ưu hiệu suất trang chủ", status: "in-progress", priority: "medium", assignee: "Lê Văn C", dueDate: "2023-06-18" },
  { id: 4, title: "Viết tài liệu hướng dẫn", status: "todo", priority: "low", assignee: "Phạm Thị D", dueDate: "2023-06-25" },
  { id: 5, title: "Kiểm thử chức năng mới", status: "todo", priority: "medium", assignee: "Hoàng Văn E", dueDate: "2023-06-22" },
];

export default function DashboardWithoutRevenue() {
  const [timeRange, setTimeRange] = useState('this_month');
  const [tasks, setTasks] = useState(taskData);
  const [newTask, setNewTask] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const toggleTaskStatus = (id: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        if (task.status === "todo") {
          return { ...task, status: "in-progress" };
        } else if (task.status === "in-progress") {
          return { ...task, status: "completed" };
        } else {
          return { ...task, status: "todo" };
        }
      }
      return task;
    }));
  };

  const addNewTask = () => {
    if (newTask.trim() !== "") {
      const newTaskItem = {
        id: tasks.length + 1,
        title: newTask,
        status: "todo" as const,
        priority: "medium" as const,
        assignee: "Bạn",
        dueDate: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, newTaskItem]);
      setNewTask("");
      setIsAddingTask(false);
    }
  };

  const completedTasks = tasks.filter(task => task.status === "completed");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const todoTasks = tasks.filter(task => task.status === "todo");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}


      {/* Main Content */}
      <main className="p-3">
        {/* <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tổng quan</h2>
          <p className="text-gray-600">Chào mừng trở lại! Dưới đây là thống kê mới nhất.</p>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-white p-2 rounded-lg ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} so với tháng trước
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Quản lý công việc</CardTitle>
                <Button
                  onClick={() => setIsAddingTask(true)}
                  className="flex items-center gap-2 mt-2 md:mt-0"
                >
                  <Plus className="h-4 w-4" />
                  Thêm công việc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAddingTask && (
                <div className="flex mb-6 gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nhập tiêu đề công việc mới..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
                  />
                  <Button onClick={addNewTask}>Thêm</Button>
                  <Button variant="outline" onClick={() => setIsAddingTask(false)}>Hủy</Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div>
                  <div className="flex items-center mb-4">
                    <Circle className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="font-semibold text-gray-700">Cần làm ({todoTasks.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {todoTasks.map(task => (
                      <Card
                        key={task.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </div>
                          <div className="flex items-center mt-3 text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{task.dueDate}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div>
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-700">Đang làm ({inProgressTasks.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {inProgressTasks.map(task => (
                      <Card
                        key={task.id}
                        className="cursor-pointer border-blue-200 hover:shadow-md transition-shadow"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </div>
                          <div className="flex items-center mt-3 text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{task.dueDate}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div>
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-semibold text-gray-700">Đã hoàn thành ({completedTasks.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {completedTasks.map(task => (
                      <Card
                        key={task.id}
                        className="cursor-pointer border-green-200 hover:shadow-md transition-shadow"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium line-through text-gray-500">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </div>
                          <div className="flex items-center mt-3 text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{task.dueDate}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userGrowthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố loại danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance Chart */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Hiệu suất hàng tháng</CardTitle>
                <div className="mt-2 md:mt-0">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_week">Tuần này</SelectItem>
                      <SelectItem value="this_month">Tháng này</SelectItem>
                      <SelectItem value="last_month">Tháng trước</SelectItem>
                      <SelectItem value="this_year">Năm nay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="danhMuc" fill="#3b82f6" name="Danh mục" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}


        {/* Recent Activity and Quick Actions */}

      </main>
    </div>
  );
}