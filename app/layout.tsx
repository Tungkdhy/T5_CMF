"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User, Bell, Folder, Layers, X, LogOut, Menu, Clipboard, Cpu, ChevronDown, Paperclip, BookAIcon, FileText, RefreshCcw } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useRouter } from "next/navigation";
import { getCategoryType } from "@/api/category_type";
import { set } from "react-hook-form";
import GlobalProvider, { useGlobalContext } from "@/context/GlobalContext";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  icon: React.ReactNode;
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
    { id: "profile", title: "Quản lý người dùng", icon: <User className="w-5 h-5" />, href: "/user" },
    { id: "staff", title: "Quản lý nhân viên", icon: <Users className="w-5 h-5" />, href: "/staff" },
    { id: "messages", title: "Quản lý công việc", icon: <Clipboard className="w-5 h-5" />, href: "/tasks" },
    { id: "bccs", title: "Báo cáo chuyên sâu", icon: <FileText className="w-5 h-5" />, href: "/reports" },
    // { id: "notifications", title: "Quản lý danh mục", icon: <Folder className="w-5 h-5" />,  href: "/category" },
    { id: "device", title: "Quản lý thiết bị", icon: <Cpu className="w-5 h-5" />, href: "/devices" },
    { id: "category_type", title: "Loại danh mục", icon: <Layers className="w-5 h-5" />, href: "/category_type" },
    {
      id: "backup",
      title: "Sao lưu dữ liệu",
      icon: <RefreshCcw className="w-5 h-5" />,
      href: "/backup",
    },
  ])
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const pathname = usePathname();
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
          id: "profile",
          title: "Quản lý người dùng",
          icon: <User className="w-5 h-5" />,
          href: "/user",
        },
        { id: "staff", title: "Quản lý nhân viên", icon: <Users className="w-5 h-5" />, href: "/staff" },
        {
          id: "messages",
          title: "Quản lý công việc",
          icon: <Clipboard className="w-5 h-5" />,
          href: "/tasks",
        },
        {
          id: "bccs",
          title: "Báo cáo chuyên sâu",
          icon: <FileText className="w-5 h-5" />,
          href: "/reports",
        },
        {
          id: "device",
          title: "Quản lý thiết bị",
          icon: <Cpu className="w-5 h-5" />,
          href: "/manager_device",
        },
        {
          id: "category_type",
          title: "Loại danh mục",
          icon: <Layers className="w-5 h-5" />,
          href: "/category_type",
        },
        {
          id: "document",
          title: "Quản lý tài liệu",
          icon: <BookAIcon className="w-5 h-5" />,
          href: "/document",
        },
        {
          id: "link",
          title: "Quản lý liên kết",
          icon: <Paperclip className="w-5 h-5" />,
          href: "/link",
        },
        {
          id: "backup",
          title: "Sao lưu dữ liệu",
          icon: <RefreshCcw className="w-5 h-5" />,
          href: "/backup",
        },
        {
          id: "category",
          title: "Quản lý danh mục",
          icon: <Folder className="w-5 h-5" />,
          children: submenu, // 👈 cho hết vào đây làm submenu
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

  const activeItem =
    menuItems.find((item) => item.href === pathname)?.id || // tìm menu chính
    menuItems
      .flatMap((item) => item.children || []) // lấy tất cả subMenu
      .find((sub) => sub.href === pathname)?.id || // tìm subMenu
    "dashboard";
  console.log(activeItem);

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
                  ${isCollapsed ? "w-20" : "w-64"}
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
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}

              <SidebarContent>
                <SidebarGroup>
                  {menuItems.map((item) =>
                    item.children ? (
                      // Nếu có submenu => dùng Collapsible
                      <Collapsible key={item.id} className="group/collapsible">
                        <CollapsibleTrigger
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors w-full ${activeItem === item.id
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-100 text-gray-700"
                            }`}
                        >
                          {item.icon}
                          <span className="ml-3 truncate">{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarGroupContent>
                            {item.children.map((sub: any) => (
                              <Link
                                key={sub.id}
                                href={sub.href || "#"}
                                className={`flex items-center ml-4 px-4 py-2 rounded-lg transition-colors ${activeItem === sub.id
                                  ? "bg-blue-50 text-blue-600"
                                  : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                title={sub.title}
                                style={{ fontSize: '16px' }}
                                onClick={() => {

                                }}
                              >
                                {/* {sub.icon} */}
                                <span className="ml-3 flex-1 truncate">{sub.title}</span>
                                {sub.badge && (
                                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Menu item bình thường
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
                        <span className="ml-3 flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  )}
                </SidebarGroup>
              </SidebarContent>

              {/* Footer */}
              <div className="p-2 border-t">
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 ${isCollapsed ? "justify-center" : "justify-start"}`}
                >
                  <LogOut className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
                </button>
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
              <h1 className="text-xl font-semibold text-gray-800">
                {(() => {
                  // Tìm menu chính
                  const menu = menuItems.find((item) => item.id === activeItem);
                  if (menu) return menu.title;


                  // Nếu không tìm menu chính, tìm trong tất cả subMenu
                  for (const item of menuItems) {

                    const sub = item.children?.find((s) => s.id === activeItem);

                    console.log(sub);

                    if (sub) return sub.title;
                  }

                  return "Trang chủ"; // fallback
                })()}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                <span className="ml-2 hidden md:inline text-gray-700">Nobita</span>
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
