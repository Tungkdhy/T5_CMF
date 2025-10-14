"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  User,
  Bell,
  Folder,
  Layers,
  X,
  LogOut,
  Menu,
  Clipboard,
  Cpu,
  ChevronDown,
  Paperclip,
  BookAIcon,
  FileText,
  RefreshCcw,
  ClipboardList,
  History,
  Sliders,
  Zap,
  Target,
  Database,
  AlertCircle,
  RollerCoaster,
  AlertCircleIcon,
  BatteryWarning,
  Laptop,
  FileWarning,
  Eraser,
  Crosshair
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useRouter } from "next/navigation";
import { getCategoryType } from "@/api/category_type";
import { set } from "react-hook-form";
import GlobalProvider, { useGlobalContext } from "@/context/GlobalContext";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NotificationBell from "@/components/notifications/ListNotification";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: number;
  children?: MenuItem[]; // Thêm thuộc tính children để hỗ trợ submenu  
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GlobalProvider>
          <Layout>{children}</Layout>
        </GlobalProvider>
      </body>
    </html>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const { isRefreshMenu, setIsRefreshMenu } = useGlobalContext();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "dashboard", title: "Bảng điều khiển", icon: <Home className="w-5 h-5" />, href: "/" },
    { id: "profile", title: "Quản lý tài khoản", icon: <User className="w-5 h-5" />, href: "/user" },
    { id: "staff", title: "Danh sách cán bộ, nhân viên", icon: <Users className="w-5 h-5" />, href: "/staff" },
    {
      id: "category_task",
      title: "Danh mục nhiệm vụ",
      icon: <ClipboardList className="w-5 h-5" />,
      href: "/category/MISSION",
    },
    { id: "messages", title: "Quản lý nhiệm vụ", icon: <Clipboard className="w-5 h-5" />, href: "/tasks" },
    { id: "bccs", title: "Danh sách báo cáo chuyên sâu", icon: <FileText className="w-5 h-5" />, href: "/reports" },
    // { id: "notifications", title: "Quản lý danh mục", icon: <Folder className="w-5 h-5" />,  href: "/category" },
    { id: "device", title: "Danh sách thiết bị tham gia mạng đơn vị", icon: <Cpu className="w-5 h-5" />, href: "/devices" },
    { id: "category_type", title: "Loại danh mục", icon: <Layers className="w-5 h-5" />, href: "/category_type" },
    {
      id: "target",
      title: "Danh sách mục tiêu TCTT",
      icon: <RefreshCcw className="w-5 h-5" />,
      href: "/target",
    },
    {
      id: "combat-targets",
      title: "Mục tiêu tác chiến",
      icon: <Crosshair className="w-5 h-5" />,
      href: "/combat-targets",
    },
    {
      id: "backup",
      title: "Sao lưu phục hồi hệ thống",
      icon: <RefreshCcw className="w-5 h-5" />,
      href: "/backup",
    },
    {
      id: "log",
      title: "Nhật ký hệ thống",
      icon: <History className="w-5 h-5" />,
      href: "/log",
    },
    {
      id: "params",
      title: "Tham số hệ thống",
      icon: <Sliders className="w-5 h-5" />,
      href: "/params",
    },
  ])
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("displayName")?.replace(/^"|"$/g, "") ?? "";
    setDisplayName(name);
  }, []);
  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      setHasToken(true);
    } else {
      setHasToken(false);
      router.push("/login");
    }
  }, []);
  useEffect(() => {
    const fetchCategoryTypes = async () => {
      const data = await getCategoryType({
        pageSize: 1000,
        pageIndex: 1,
        visible: true,
      });

      const submenu = data.data.rows.map((item: any) => ({
        id: item.id,
        title: item.display_name,
        icon: <Folder className="w-4 h-4" />, // nhỏ hơn để phù hợp submenu
        href: `/category/${item.scope}`,
      }));

      setMenuItems([
        {
          id: "dashboard",
          title: "Bảng điều khiển",
          icon: <Home className="w-5 h-5" />,
          href: "/",
        },
        {
          id: "user_management",
          title: "Quản lý người dùng",
          icon: <Users className="w-5 h-5" />,
          children: [
            {
              id: "profile",
              title: "Quản lý tài khoản",
              href: "/user",
            },
            {
              id: "staff",
              title: "Danh sách cán bộ, nhân viên",
              href: "/staff",
            },
          ],
        },
        {
          id: "role_management",
          title: "Phân quyền",
          icon: <RollerCoaster className="w-5 h-5" />,
          children: [
            {
              id: "roles",
              title: "Danh sách quyền",
              href: "/role",
            },
            {
              id: "action",
              title: "Danh sách hành động",
              href: "/role/action",
            },
          ],
        },
        {
          id: "task_management",
          title: "Quản lý nhiệm vụ",
          icon: <Clipboard className="w-5 h-5" />,
          children: [
            {
              id: "category_task",
              title: "Danh mục nhiệm vụ",
              href: "/category/MISSION",
            },
            {
              id: "messages",
              title: "Quản lý nhiệm vụ",
              href: "/tasks",
            },
          ],
        },
        {
          id: "reports_management",
          title: "Báo cáo",
          icon: <FileText className="w-5 h-5" />,
          children: [
            {
              id: "bccs",
              title: "Danh sách báo cáo chuyên sâu",
              href: "/reports",
            },
            {
              id: "performance",
              title: "Hiệu suất thực hiện TCCS",
              href: "/work_performance",
            },
          ],
        },
        {
          id: "device_management",
          title: "Quản lý thiết bị",
          icon: <Cpu className="w-5 h-5" />,
          children: [
            {
              id: "device",
              title: "Danh sách thiết bị tham gia mạng đơn vị",
              href: "/devices",
            },
            {
              id: "device_manager",
              title: "Danh sách trang thiết bị quản lý",
              href: "/manager_device",
            },
          ],
        },
        {
          id: "target_management",
          title: "Quản lý mục tiêu",
          icon: <Target className="w-5 h-5" />,
          children: [
            {
              id: "target",
              title: "Danh sách mục tiêu TCTT",
              href: "/target",
            },
            {
              id: "combat-targets",
              title: "Mục tiêu tác chiến",
              href: "/combat-targets",
            },
          ],
        },
        {
          id: "data_management",
          title: "Quản lý dữ liệu & tài liệu",
          icon: <Database className="w-5 h-5" />,
          children: [
            {
              id: "collected_data",
              title: "Danh sách dữ liệu thu thập từ tác chiến",
              href: "/collected_data",
            },
            {
              id: "document",
              title: "Danh sách tài liệu trên hệ thống",
              href: "/document",
            },
          ],
        },
        {
          id: "category",
          title: "Quản lý danh mục",
          icon: <Folder className="w-5 h-5" />,
          children: submenu,
        },
        {
          id: "category_type",
          title: "Loại danh mục",
          icon: <Layers className="w-5 h-5" />,
          href: "/category_type",
        },
        {
          id: "security_management",
          title: "Bảo mật & cảnh báo",
          icon: <AlertCircle className="w-5 h-5" />,
          children: [
            {
              id: "warning",
              title: "Cảnh báo trạng thái hoạt động của máy chủ hệ thống",
              href: "/warning",
            },
            {
              id: "alert",
              title: "Danh sách dấu hiệu mất an toàn thông tin",
              href: "/alert",
            },
            {
              id: "error",
              title: "Quản lý mã lỗi hệ thống",
              href: "/category/SYSTEM_CODE",
            },
          ],
        },
        {
          id: "system_management",
          title: "Hệ thống & bảo trì",
          icon: <Cpu className="w-5 h-5" />,
          children: [
            {
              id: "backup",
              title: "Sao lưu phục hồi hệ thống",
              href: "/backup",
            },
            {
              id: "log",
              title: "Nhật ký hệ thống",
              href: "/log",
            },
            {
              id: "access_history",
              title: "Lịch sử truy cập",
              href: "/access_history",
            },
            {
              id: "params",
              title: "Tham số hệ thống",
              href: "/params",
            },
            {
              id: "link",
              title: "Quản lý liên kết với các hệ thống khác",
              href: "/link",
            },
          ],
        },
      ]);
    };

    if (hasToken) {
      fetchCategoryTypes();
    }
  }, [isRefreshMenu, hasToken]);
  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    window.location.href = "/login"; // Redirect to login page
  };

  const activeItem = (() => {
    // Tìm menu chính trực tiếp
    const mainMenu = menuItems.find((item) => item.href === pathname);
    if (mainMenu) return mainMenu.id;

    // Tìm trong tất cả submenu (bao gồm cả nested submenu)
    for (const item of menuItems) {
      if (item.children) {
        for (const sub of item.children) {
          if (sub.href === pathname) return sub.id;
          // Kiểm tra nested submenu (như category có children)
          if (sub.children) {
            for (const nested of sub.children) {
              if (nested.href === pathname) return nested.id;
            }
          }
        }
      }
    }
    return "dashboard";
  })();

  // Tìm parent menu để mở collapsible
  const getParentMenuId = (() => {
    for (const item of menuItems) {
      if (item.children) {
        for (const sub of item.children) {
          if (sub.href === pathname || sub.id === activeItem) return item.id;
          if (sub.children) {
            for (const nested of sub.children) {
              if (nested.href === pathname || nested.id === activeItem) return item.id;
            }
          }
        }
      }
    }
    return null;
  })();

  return (

    <div>
      <div className="flex h-screen bg-gray-50">
        {/* Nếu có token thì hiển thị sidebar, không thì chỉ hiện nội dung */}

        <>
          {/* Overlay Mobile */}
          {isMobileOpen && (
            <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setIsMobileOpen(false)} />
          )}

          {/* Sidebar */}
          <aside
            className={`
                  fixed md:static z-30 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out
                  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
                  md:translate-x-0
                  ${isCollapsed ? "w-20" : "w-66"}
                `}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center ${isCollapsed ? "justify-center py-5" : "justify-between p-5"} border-b`}>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 w-8 h-8 rounded-lg"></div>
                    <span className="text-xl font-bold text-gray-800">CMF</span>
                  </div>
                )}
                {isCollapsed && (
                  <div className="bg-blue-600 w-8 h-8 rounded-lg"></div>
                )}
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}

              <SidebarContent>
                <SidebarGroup>
                  <TooltipProvider>
                    {menuItems.map((item) =>
                      item.children ? (
                        // Nếu có submenu => dùng Collapsible
                        <Collapsible key={item.id} className="group/collapsible" defaultOpen={getParentMenuId === item.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CollapsibleTrigger
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors w-full ${activeItem === item.id || getParentMenuId === item.id
                                  ? "bg-blue-50 text-blue-600"
                                  : "hover:bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {item.icon}
                                {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
                                {!isCollapsed && <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                              </CollapsibleTrigger>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right" className="ml-2">
                                <p>{item.title}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>

                        <CollapsibleContent>
                          <SidebarGroupContent>
                            {!isCollapsed && item.children.map((sub: any) => 
                              sub.children ? (
                                // Nested submenu (như category)
                                <Collapsible key={sub.id} className="group/collapsible" defaultOpen={activeItem === sub.id || (sub.children && sub.children.some((nested: any) => nested.id === activeItem))}>
                                  <CollapsibleTrigger
                                    className={`flex items-center ml-4 px-4 py-2 rounded-lg transition-colors w-full ${activeItem === sub.id || (sub.children && sub.children.some((nested: any) => nested.id === activeItem))
                                      ? "bg-blue-50 text-blue-600"
                                      : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                  >
                                    <span className="ml-3 truncate">{sub.title}</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarGroupContent>
                                      {sub.children.map((nested: any) => (
                                          <Link
                                            key={nested.id}
                                            href={nested.href || "#"}
                                            className={`flex items-center ml-8 px-4 py-2 rounded-lg transition-colors ${activeItem === nested.id
                                              ? "bg-blue-50 text-blue-600"
                                              : "hover:bg-gray-100 text-gray-700"
                                              }`}
                                          title={nested.title}
                                          style={{ fontSize: '16px' }}
                                        >
                                          <span className="ml-3 flex-1 truncate">{nested.title}</span>
                                          {nested.badge && (
                                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                              {nested.badge}
                                            </span>
                                          )}
                                        </Link>
                                      ))}
                                    </SidebarGroupContent>
                                  </CollapsibleContent>
                                </Collapsible>
                              ) : (
                                // Regular submenu item
                                <Link
                                  key={sub.id}
                                  href={sub.href || "#"}
                                  className={`flex items-center ml-4 px-4 py-2 rounded-lg transition-colors ${activeItem === sub.id
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                  title={sub.title}
                                  style={{ fontSize: '16px' }}
                                >
                                  <span className="ml-3 flex-1 truncate">{sub.title}</span>
                                  {sub.badge && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              )
                            )}
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Menu item bình thường
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            key={item.id}
                            href={item.href || "#"}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeItem === item.id
                              ? "bg-blue-50 text-blue-600"
                              : "hover:bg-gray-100 text-gray-700"
                              }`}
                            title={item.title}
                          >
                            {item.icon}
                            {!isCollapsed && <span className="ml-3 flex-1 truncate">{item.title}</span>}
                            {!isCollapsed && item.badge && (
                              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="ml-2">
                            <p>{item.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  )}
                  </TooltipProvider>
                </SidebarGroup>
              </SidebarContent>

              {/* Footer */}
              <div className="p-2 border-t">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 ${isCollapsed ? "justify-center" : "justify-start"}`}
                    >
                      <LogOut className="w-5 h-5" />
                      {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="ml-2">
                      <p>Đăng xuất</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </aside>
        </>


        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}

          <header className="flex items-center justify-between p-4 bg-white shadow-sm">
              <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 md:mr-4">
                  <Menu className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsCollapsed(!isCollapsed)} 
                  className="hidden md:block p-2 rounded-lg hover:bg-gray-100"
                  title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-90" : "-rotate-90"}`} />
                </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {(() => {
                  // Tìm menu chính
                  const menu = menuItems.find((item) => item.id === activeItem);
                  if (menu) return menu.title;

                  // Tìm trong tất cả submenu (bao gồm cả nested submenu)
                  for (const item of menuItems) {
                    if (item.children) {
                      for (const sub of item.children) {
                        if (sub.id === activeItem) return sub.title;
                        // Kiểm tra nested submenu
                        if (sub.children) {
                          for (const nested of sub.children) {
                            if (nested.id === activeItem) return nested.title;
                          }
                        }
                      }
                    }
                  }

                  return "Trang chủ"; // fallback
                })()}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}<NotificationBell />
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                <span className="ml-2 hidden md:inline text-gray-700">{displayName}</span>
              </div>
            </div>
          </header>


          {/* Page content */}
          <main className=" overflow-y-auto p-3 bg-gray-50">{children}</main>
        </div>
      </div>

    </div>
  );
}
