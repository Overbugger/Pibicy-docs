"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, FileUp } from "lucide-react";
import { cn } from "../lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
  maxSize?: number;
}

const FileUpload = ({
  onFileUpload,
  isUploading = false,
  maxSize = 5 * 1024 * 1024,
}: FileUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const { code, message } = rejectedFiles[0].errors[0];
        if (code === "file-too-large") {
          setError(
            `File is too large. Max size is ${maxSize / (1024 * 1024)}MB`
          );
        } else {
          setError(message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative p-8 border-2 border-dashed rounded-lg transition-all duration-150 ease-in-out",
        "hover:border-primary/50 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        {
          "border-primary/50 bg-primary/5 ring-2 ring-primary/20": isDragActive,
          "border-destructive/50 bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/5":
            isDragReject || error,
          "pointer-events-none opacity-60": isUploading,
          "border-muted-foreground/25":
            !isDragActive && !isDragReject && !isUploading && !error,
        }
      )}
      role="button"
      tabIndex={0}
      aria-label="File upload area"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div
          className={cn(
            "p-4 rounded-full bg-muted/80 transition-transform duration-150",
            isDragActive && "scale-110",
            isUploading && "animate-pulse"
          )}
        >
          {isUploading ? (
            <Upload
              className="w-8 h-8 animate-bounce text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <FileUp
              className="w-8 h-8 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="space-y-2">
          <p className="font-medium">
            {error
              ? error
              : isDragReject
              ? "This file type is not supported"
              : isUploading
              ? "Uploading file..."
              : isDragActive
              ? "Drop file here"
              : "Drag & drop an image here, or click to select"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, JPEG, PNG (max {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>
      {isDragActive && (
        <div
          className="absolute inset-0 rounded-lg bg-primary/10 animate-in fade-in-0 duration-150"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FileUpload;
