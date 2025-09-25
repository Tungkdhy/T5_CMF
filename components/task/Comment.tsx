"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
//   files?: FileData[];
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

          {/* 📂 File đính kèm */}
          {/* {comment.files && comment.files.length > 0 && (
            <div className="mt-1 space-y-1">
              {comment.files.map((f, idx) => (
                <a
                  key={idx}
                  href={f.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  📎 {f.name}
                </a>
              ))}
            </div>
          )} */}

          {/* Icon hành động */}
          <div className="flex gap-3 mt-1 text-gray-500 text-xs">
            <button onClick={() => setReplyVisible(!replyVisible)}>💬 Trả lời</button>
            <button onClick={() => setEditVisible(!editVisible)}>✏️ Sửa</button>
          </div>
        </div>
      </div>

      {/* Reply input */}
      {replyVisible && (
        <div className="ml-12 flex gap-2 mt-1">
          <Input
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