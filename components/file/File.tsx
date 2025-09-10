"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createTaskAttachment, getTaskAttachments } from "@/api/task_attachment";
import api from "@/api/base";
import { set } from "react-hook-form";

type Attachment = {
    id: string | number;
    file_name: string;
    file_url: string;
};

interface TaskAttachmentsProps {
    taskId: string | number | null;
}

export default function TaskAttachments({ taskId }: TaskAttachmentsProps) {
    const [files, setFiles] = useState<Attachment[]>([]); // file từ API
    const [newFiles, setNewFiles] = useState<File[]>([]); // file mới upload
    const [loading, setLoading] = useState(false);
    const [dataUpload,setDataUpload] = useState<any>(false)

    // Fetch file list
    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                const fileAttachmentsRes = await getTaskAttachments(taskId!);
                console.log(fileAttachmentsRes);
                setFiles(fileAttachmentsRes.data.rows || []);
            } catch (err) {
                console.error("Failed to load attachments:", err);
            } finally {
                setLoading(false);
            }
        };

        if (taskId) fetchFiles();
    }, [taskId,dataUpload]);

    const handleDelete = async (fileId: string | number) => {
        if (!confirm("Bạn có chắc muốn xoá file này?")) return;
        try {
            await fetch(`/api/tasks/${taskId}/attachments/${fileId}`, {
                method: "DELETE",
            });
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        } catch (err) {
            console.error("Xoá file thất bại:", err);
        }
    };

    return (
        <div className="mt-1 space-y-4">
            {/* Upload input */}
            <div>
                <Label className="mb-2 block font-semibold">Đính kèm file mới</Label>
                <Input
                    type="file"
                    multiple
                    onChange={async (e) => {
                        const files = e.target.files?.[0];
                        if (files) {
                            const formDataUpload = new FormData();
                            formDataUpload.append("file", files);

                            try {
                                const res = await api.post("/documents/upload", formDataUpload, {
                                    headers: {
                                        "Content-Type": "multipart/form-data",
                                    },
                                });
                                console.log(res.data.data);
                                const data = res.data.data;
                                setDataUpload(data)
                                await createTaskAttachment({
                                    task_id: taskId ?? "",
                                    file_name: data.file_name,
                                    file_url: data.file_path,
                                })
                                setDataUpload(!dataUpload)
                            }
                            catch (err) {
                                console.error("Upload failed:", err);
                            }
                        }
                    }}
                />

                {newFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {newFiles.map((file, idx) => (
                            <li
                                key={idx}
                                className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
                            >
                                <span className="truncate max-w-[80%]">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                >
                                    ✖
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Danh sách file đã có */}
            <div>
                <Label className="mb-2 block font-semibold">File đã đính kèm</Label>
                {loading ? (
                    <p className="text-sm text-gray-500">Đang tải...</p>
                ) : files.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có file nào</p>
                ) : (
                    <ul className="space-y-1">
                        {files.map((file) => (
                            <li
                                key={file.id}
                                className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
                            >
                                <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate max-w-[80%] text-blue-600 hover:underline"
                                >
                                    {file.file_name}
                                </a>
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(file.id)}
                                >
                                    ✖
                                </Button> */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
