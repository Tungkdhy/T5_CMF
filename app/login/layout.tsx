
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // không render layout chung, chỉ render nội dung login
  return <>{children}</>;
}