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
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      <p>Drag & drop an image here, or click to select</p>
      <p className="text-sm text-gray-500">Supported formats: JPG, JPEG, PNG</p>
    </div>
  );
};

export default FileUpload;
