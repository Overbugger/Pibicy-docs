import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/jpeg": [".jpg"],
      "image/png": [".png"],
      "application/vnd.ms-outlook": [".msg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      <p>Drag & drop a file here, or click to select a file</p>
      <p className="text-sm text-gray-500">Supported formats: PDF, DOC, XLS, JPG, PNG, MSG</p>
    </div>
  );
};

export default FileUpload;