"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

interface NotificationItem {
  id: string;
  task_id: string;
  notification_id: string;
  recipient_id: string;
  sent_at: string;
  read_at: string | null;
  is_sent: boolean;
  is_read: boolean;
  notification: {
    id: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    is_read: boolean;
    is_active: boolean;
  };
  task: {
    id: string;
    title: string;
    code: string;
    due_date: string;
    progress_percent: number;
  };
}

export default function NotificationBell() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "uuid-1",
      task_id: "task-uuid-1",
      notification_id: "notif-uuid-1",
      recipient_id: "user-uuid-1",
      sent_at: "2024-01-15T10:30:00Z",
      read_at: null,
      is_sent: true,
      is_read: false,
      notification: {
        id: "notif-uuid-1",
        title: "Nhiệm vụ mới được giao",
        content: 'Bạn đã được giao nhiệm vụ: "Phát triển tính năng mới"',
        type: "task_assigned",
        priority: "normal",
        is_read: false,
        is_active: true
      },
      task: {
        id: "task-uuid-1",
        title: "Phát triển tính năng mới",
        code: "TASK-001",
        due_date: "2024-01-20",
        progress_percent: 0
      }
    },
    {
      id: "uuid-2",
      task_id: "task-uuid-2",
      notification_id: "notif-uuid-2",
      recipient_id: "user-uuid-1",
      sent_at: "2024-01-14T09:00:00Z",
      read_at: "2024-01-14T10:00:00Z",
      is_sent: true,
      is_read: true,
      notification: {
        id: "notif-uuid-2",
        title: "Cập nhật tiến độ nhiệm vụ",
        content: 'Nhiệm vụ "Thiết kế UI" đã hoàn thành 50%',
        type: "task_update",
        priority: "normal",
        is_read: true,
        is_active: true
      },
      task: {
        id: "task-uuid-2",
        title: "Thiết kế UI",
        code: "TASK-002",
        due_date: "2024-01-18",
        progress_percent: 50
      }
    }
  ]);

  const toggleNotif = () => setIsNotifOpen(!isNotifOpen);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, notification: { ...n.notification, is_read: true } }
          : n
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        className="p-2 rounded-full hover:bg-gray-100 relative"
        onClick={toggleNotif}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown notification */}
      {isNotifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b font-semibold">Thông báo</div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b cursor-pointer transition-colors 
                    ${n.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"}
                  `}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="font-medium text-gray-800">{n.notification.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{n.notification.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.sent_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">Không có thông báo</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
