"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ userName: email, password });
    if (user.statusCode === "10000") {
        // lưu token
        localStorage.setItem("accessToken", user.data.tokens.accessToken);
        localStorage.setItem("refreshToken", user.data.tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(user.data.user.id));
        // alert(`Đăng nhập thành công với user: ${user.data.user.display_name}`);

        // chuyển trang
        router.push("/");
      } else {
        alert("Đăng nhập thất bại: " + user.message);
      }
    } catch (error:any) {
      alert(`Đăng nhập thất bại: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <Card className="w-full max-w-sm p-8 rounded-xl shadow-xl border border-gray-100">
        <CardHeader className="mb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-800">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="font-medium">Username</Label>
              <Input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="font-medium">Mật khẩu</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            {/* <div className="flex justify-between text-sm text-gray-500">
              <a href="#" className="hover:text-indigo-500">Quên mật khẩu?</a>
              <a href="#" className="hover:text-indigo-500">Đăng ký</a>
            </div> */}
            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
            >
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
