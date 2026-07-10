"use client";

import { useRef } from "react";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { Link2 } from "../animate-ui/icons/link-2";

export type FileData = {
  name: string;
  mimeType: string;
  size: number;
  file: File;
  fileId?: string;
  uploading?: boolean;
  url?: string;
  jobId?: string;
  jobStatus?: "active" | "completed" | "failed";
};

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "Image",
  "image/jpeg": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "image/svg+xml": "Image",
  "text/plain": "Text",
  "text/html": "HTML",
  "text/css": "CSS",
  "text/javascript": "Script",
  "application/json": "JSON",
  "application/zip": "Archive",
  "application/x-zip-compressed": "Archive",
  "application/gzip": "Archive",
  "application/x-tar": "Archive",
  "application/vnd.rar": "Archive",
  "video/mp4": "Video",
  "video/webm": "Video",
  "video/mpeg": "Video",
  "audio/mpeg": "Audio",
  "audio/wav": "Audio",
  "audio/ogg": "Audio",
  "audio/webm": "Audio",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
};

export function getFileTypeLabel(mimeType: string): string {
  return MIME_LABELS[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "File";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FileUploadProps = {
  onFileSelect: (file: FileData) => void;
  isSingleLine: boolean;
};

export default function FileUpload({ onFileSelect, isSingleLine }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect({ name: file.name, mimeType: file.type, size: file.size, file });
    e.target.value = "";

    console.log('File :',file)

  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex-shrink-0 cursor-pointer p-2 text-zinc-400 ${isSingleLine ? "mb-1" : ""}`}
      >
        <AnimateIcon animateOnHover>
          <Link2 />
        </AnimateIcon>
      </button>
    </>
  );
}
