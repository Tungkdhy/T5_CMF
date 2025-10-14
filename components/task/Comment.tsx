"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, X } from "lucide-react";
import axios from "axios";

// Hàm tạo màu avatar từ tên
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs((Math.sin(hash) * 10000) % 1) * 16777215
  ).toString(16);
  return `#${"0".repeat(6 - color.length) + color}`;
}

interface FileData {
  name: string;
  url?: string;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  document_url?: string;
  // files?: FileData[];
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, text: string) => void;
  onEdit: (id: string, text: string) => void;
}

export default function CommentItem({ comment, onReply, onEdit }: CommentItemProps) {
  const [replyVisible, setReplyVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const downloadFile = async (fileUrl?: string, filename?: string) => {
    try {
      console.log(fileUrl);

      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get('http://10.10.53.58:3002/' + fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename ?? "");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Hàm lấy tên file từ URL
  const getFileName = (url?: string) => {
    if (!url) return "Tệp đính kèm";
    const parts = url.split('/');
    return parts[parts.length - 1] || "Tệp đính kèm";
  };

  // Hàm lấy icon theo loại file
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };
  // focus khi hiện ô reply
  useEffect(() => {
    if (replyVisible && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyVisible]);

  // focus khi hiện ô edit
  useEffect(() => {
    if (editVisible && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editVisible]);
  console.log(localStorage.getItem("user"));
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          style={{ backgroundColor: stringToColor(comment.user_name) }}
          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-gray-700"
        >
          {comment.user_name.slice(0, 2)}
        </div>

        {/* Nội dung */}
        <div className="flex flex-col bg-gray-100 rounded-2xl px-3 py-2 max-w-[80%]">
          <span className="text-sm font-semibold">{comment.user_name}</span>
          <span className="text-sm text-gray-800">{comment.content}</span>

          {/* File đính kèm */}
          {comment.document_url && (
            <div className="mt-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">
                      {getFileIcon(getFileName(comment.document_url))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getFileName(comment.document_url)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tệp đính kèm
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(comment.document_url, getFileName(comment.document_url))}
                    className="ml-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Tải về</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Icon hành động */}
          <div className="flex gap-3 mt-1 text-gray-500 text-xs">
            <button onClick={() => setReplyVisible(!replyVisible)}>💬 Trả lời</button>
            {
              localStorage.getItem("user") === `"${comment.user_id}"` && <button onClick={() => setEditVisible(!editVisible)}>✏️ Sửa</button>
            }
          </div>
        </div>
      </div>

      {/* Reply input */}
      {replyVisible && (
        <div className="ml-12 flex gap-2 mt-1">
          <Input
            ref={replyInputRef}
            placeholder="Trả lời..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button
            onClick={() => {
              onReply(comment.id, replyText);
              setReplyText("");
              setReplyVisible(false);
            }}
          >
            Gửi
          </Button>
        </div>
      )}

      {/* Edit input */}
      {editVisible && (
        <div className="ml-12 flex gap-2 mt-1">
          <Input
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <Button
            onClick={() => {
              onEdit(comment.id, editText);
              setEditVisible(false);
            }}
          >
            Cập nhật
          </Button>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
