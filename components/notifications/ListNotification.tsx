"use client";

import { Bell, Trash2, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/api/base";

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
    code: string | null;
    due_date: string | null;
    progress_percent: string;
  };
}

interface NotificationSettings {
  task_assigned: boolean;
  task_due_reminder: boolean;
  task_progress_update: boolean;
  task_created: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}
const settingLabels: Record<string, string> = {
  task_assigned: "Được giao nhiệm vụ",
  task_due_reminder: "Nhắc nhở hạn nhiệm vụ",
  task_progress_update: "Cập nhật tiến độ nhiệm vụ",
  task_created: "Tạo nhiệm vụ mới",
  email_notifications: "Thông báo qua email",
  push_notifications: "Thông báo đẩy (Push)"
};

export default function NotificationBell() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reload, setReload] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    task_assigned: true,
    task_due_reminder: true,
    task_progress_update: false,
    task_created: true,
    email_notifications: true,
    push_notifications: false,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null); // ref popup
  const pageSize = 10;

  const toggleNotif = () => setIsNotifOpen(!isNotifOpen);

  const fetchNotifications = async (pageNumber: number) => {
    try {
      const res = await api.get("/notifications", {
        params: { page: pageNumber, limit: pageSize * pageNumber },
      });
      const res2 = await api.get("/notifications/unread-count");
      const newData = res.data.data.notifications;
      setUnreadCount(res2.data.data.unread_count || 0);
      setNotifications([...newData]);
      if (newData.length < pageSize) setHasMore(false);
    } catch (err) {
      console.error("Lấy thông báo thất bại:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [reload]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, notification: { ...n.notification, is_read: true } }
            : n
        )
      );
      setReload(!reload);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, notification: { ...n.notification, is_read: true } }))
      );
      setReload(!reload);
    } catch (err) {
      console.error("Đánh dấu tất cả thất bại:", err);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newValue = !settings[key];
    setSettings((prev:any) => ({ ...prev, [key]: newValue }));
    const {id, user_id,...rest} = settings;
    try {
      await api.put("/notifications/settings", {
        ...rest,
        [key]: newValue,
      });
    } catch (err) {
      console.error("Cập nhật setting thất bại:", err);
      setSettings((prev:any) => ({ ...prev, [key]: !newValue }));
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return; // ✅ confirm trước
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setReload(!reload);
    } catch (err) {
      console.error("Xóa thông báo thất bại:", err);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) fetchNotifications(page);
  }, [page]);

  // 🔹 Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const openSettingsModal = async () => {
    try {
      const res = await api.get("/notifications/settings");
      setSettings(res.data.data.settings);
      setIsSettingOpen(true);
    } catch (err) {
      console.error("Lấy cài đặt thất bại:", err);
      setIsSettingOpen(true);
    }
  };

  const saveSettings = async () => {
    try {
      await api.put("/notifications/settings", settings);
      setIsSettingOpen(false);
    } catch (err) {
      console.error("Lưu cài đặt thất bại:", err);
    }
  };

  return (
    <div className="relative">
      {/* Bell icon + Setting button */}
      <div className="flex items-center gap-2">
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

        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={openSettingsModal}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Notification dropdown */}
      {isNotifOpen && (
        <div ref={popupRef} className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b font-semibold">
            Thông báo
            {unreadCount > 0 && (
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={markAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div
            className="max-h-64 overflow-y-auto"
            onScroll={handleScroll}
            ref={containerRef}
          >
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b cursor-pointer flex justify-between items-start transition-colors 
                    ${n.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"}`}
                >
                  <div onClick={() => markAsRead(n.notification_id)}>
                    <div className="font-medium text-gray-800">{n.notification.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{n.notification.content}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(n.sent_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(n.notification_id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">Không có thông báo</div>
            )}
            {!hasMore && notifications.length > 0 && (
              <div className="p-2 text-center text-gray-400 text-sm">Đã tải hết</div>
            )}
          </div>
        </div>
      )}

      {/* Modal Cài đặt */}
      {isSettingOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cài đặt thông báo</h3>
              <button onClick={() => setIsSettingOpen(false)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(settings)
                .filter(([key]) => key !== "id" && key !== "user_id")
                .map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={!!value}
                      onChange={() => handleToggle(key as keyof NotificationSettings)}
                    />
                    {settingLabels[key] || key.replace(/_/g, " ")}
                  </label>
                ))}
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setIsSettingOpen(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={saveSettings}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
