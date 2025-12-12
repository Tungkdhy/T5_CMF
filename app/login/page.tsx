"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  
  // Alert states
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const showAlert = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => {
      setMessage(null);
      setStatus(null);
    }, 4000);
  };

  const handleLogin = async (e: React.FormEvent, otpToken?: string) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Build login payload - include otpToken if provided
      const payload: any = { userName: email, password };
      if (otpToken) {
        payload.otpToken = otpToken;
      }
      
      const user = await login(payload);
      
      if (user.statusCode === "10000") {
        // Check if 2FA setup is required
        if (user.data.requires_2fa_setup) {
          setQrCode(user.data.qrCode);
          setSecret(user.data.secret);
          setRequires2FASetup(true);
          setShow2FASetup(true);
          showAlert(user.message || "Vui lòng thiết lập xác thực 2 lớp", "success");
        } else if (user.data.requires_2fa) {
          // User already has 2FA setup, just needs to enter code
          setRequires2FASetup(false);
          setShow2FASetup(true);
        } else {
          // No 2FA required or 2FA verified, proceed with login
          completeLogin(user.data);
        }
      } else {
        showAlert("Đăng nhập thất bại: " + user.message, "error");
      }
    } catch (error: any) {
      showAlert(`Đăng nhập thất bại: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showAlert("Vui lòng nhập đủ 6 chữ số", "error");
      return;
    }
    
    // Call login again with otpToken
    await handleLogin(e, otpCode);
  };

  const completeLogin = (data: any) => {
    localStorage.setItem("accessToken", data.tokens.accessToken);
    localStorage.setItem("refreshToken", data.tokens.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user.id));
    localStorage.setItem("displayName", JSON.stringify(data.user.display_name));
    router.push("/");
  };

  const handleBack = () => {
    setShow2FASetup(false);
    setQrCode("");
    setSecret("");
    setOtpCode("");
    setRequires2FASetup(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Alert notification */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <Alert className={`rounded-xl shadow-lg ${status === "success" ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800"}`}>
            {status === "success" ? <CheckCircle className="h-5 w-5 animate-bounce" /> : <XCircle className="h-5 w-5 animate-pulse" />}
            <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )}

      {!show2FASetup ? (
        // Login Form
        <Card className="w-full max-w-sm p-8 rounded-xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="mb-6">
            <CardTitle className="text-3xl text-center font-bold text-gray-800">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: "100ms" }}>
                <Label htmlFor="email" className="font-medium">Username</Label>
                <Input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: "200ms" }}>
                <Label htmlFor="password" className="font-medium">Mật khẩu</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        // 2FA Setup / Verification
        <Card className="w-full max-w-md p-8 rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Shield className="w-8 h-8 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl text-center font-bold text-gray-800">
              {requires2FASetup ? "Thiết lập xác thực 2 lớp" : "Xác thực 2 lớp"}
            </CardTitle>
            <p className="text-center text-gray-500 text-sm mt-2">
              {requires2FASetup 
                ? "Quét mã QR bằng ứng dụng Google Authenticator hoặc Authy"
                : "Nhập mã xác thực từ ứng dụng của bạn"
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify2FA} className="space-y-5">
              {/* QR Code display for 2FA setup */}
              {requires2FASetup && qrCode && (
                <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="p-4 bg-white rounded-xl shadow-md border-2 border-indigo-100">
                    <img 
                      src={qrCode} 
                      alt="QR Code for 2FA" 
                      className="w-48 h-48"
                    />
                  </div>
                  {secret && secret !== "false" && (
                    <div className="w-full p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">Mã bí mật (nếu không quét được QR):</p>
                      <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded select-all">
                        {secret}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: requires2FASetup ? "300ms" : "0ms" }}>
                <Label htmlFor="otp" className="font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  Mã xác thực (6 chữ số)
                </Label>
                <Input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtpCode(value);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200"
                  required
                  disabled={isLoading}
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Xác thực
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
