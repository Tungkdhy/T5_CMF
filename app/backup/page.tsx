// "use client";

// import { useState, useEffect } from "react";
// import { RefreshCcw, Trash2, CheckCircle, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// // API giả lập
// import { getBackups, deleteBackup, restoreBackup } from "@/api/backup";

// interface Backup {
//   id: string;
//   name: string;
//   type: number;
//   path: string;
//   is_active: boolean;
//   created_by: string | null;
//   created_by_user: { id: string; display_name: string } | null;
// }

// export default function BackupManagement() {
//   const [backups, setBackups] = useState<Backup[]>([]);
//   const [message, setMessage] = useState<string | null>(null);
//   const [status, setStatus] = useState<"success" | "error" | null>(null);

//   const showAlert = (msg: string, type: "success" | "error") => {
//     setMessage(msg);
//     setStatus(type);
//     setTimeout(() => {
//       setMessage(null);
//       setStatus(null);
//     }, 3000);
//   };

//   const fetchBackups = async () => {
//     try {
//       const res = await getBackups(); // API trả về { data: { rows: [...] } }
//       setBackups(res.data.rows);
//     } catch (err) {
//       console.error(err);
//       showAlert("Lấy danh sách backup thất bại", "error");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     await deleteBackup(id);
//     showAlert("Xóa bản backup thành công", "success");
//     fetchBackups();
//   };

//   const handleRestore = async (id: string) => {
//     await restoreBackup(id);
//     showAlert("Phục hồi dữ liệu thành công", "success");
//   };

//   useEffect(() => {
//     fetchBackups();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-3">
//       {message && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
//           <Alert
//             className={`rounded-xl shadow-lg ${
//               status === "success"
//                 ? "bg-green-100 border-green-500 text-green-800"
//                 : "bg-red-100 border-red-500 text-red-800"
//             }`}
//           >
//             {status === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
//             <AlertTitle>{status === "success" ? "Thành công" : "Lỗi"}</AlertTitle>
//             <AlertDescription>{message}</AlertDescription>
//           </Alert>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
        

//         <Table className="w-full table-auto">
//           <TableHeader>
//             <TableRow>
//               <TableHead>STT</TableHead>
//               <TableHead>Tên bản sao lưu</TableHead>
//               <TableHead>Đường dẫn</TableHead>
//               <TableHead>Hoạt động</TableHead>
//               <TableHead>Người tạo</TableHead>
//               <TableHead className="w-[180px]">Hành động</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {backups.map((b, i) => (
//               <TableRow key={b.id}>
//                 <TableCell>{i + 1}</TableCell>
//                 <TableCell>{b.name}</TableCell>
//                 <TableCell>{b.path}</TableCell>
//                 <TableCell>
//                   <Switch checked={b.is_active} disabled />
//                 </TableCell>
//                 <TableCell>{b.created_by_user?.display_name || "-"}</TableCell>
//                 <TableCell className="flex gap-2 justify-end">
//                   <Button size="sm" variant="outline" onClick={() => handleRestore(b.id)}>
//                     <RefreshCcw className="w-4 h-4" /> Phục hồi
//                   </Button>
//                   <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>
//                     <Trash2 className="w-4 h-4" /> Xóa
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
