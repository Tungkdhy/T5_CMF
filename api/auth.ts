import api from "./base";

export interface LoginPayload {
  userName: string;
  password: string;
  otpToken?: string; // Mã OTP 2FA (gửi kèm khi xác thực 2 lớp)
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Đăng nhập (có thể kèm otpToken cho 2FA)
export async function login(payload: LoginPayload) {
  const res = await api.post("/login", payload);
  return res.data;
}

// Đăng ký
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

// Refresh token
export async function refreshToken(token: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/refresh", { token });
  return res.data;
}

// Đăng xuất
export async function logout(): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
}
