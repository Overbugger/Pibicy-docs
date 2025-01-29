import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FileViewer from "./components/FileViewer";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    // Simulate upload delay
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // console.log("Uploaded file:", file);
    setIsUploading(false);
    setFile(uploadedFile);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="relative min-h-[400px]">
        <div
          className={`transition-all duration-500 absolute inset-0 ${
            file ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FileUpload
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        </div>

        <div
          className={`transition-all duration-500 absolute inset-0 ${
            file ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {file && <FileViewer file={file} />}
        </div>
      </div>
    </div>
  );
}

export default App;
