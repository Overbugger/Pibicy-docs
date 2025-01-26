import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FileViewer from "./components/FileViewer";

function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Viewer</h1>
      <FileUpload onFileUpload={handleFileUpload} />
     <div className="justify-items-center place-content-center">{file && <FileViewer file={file} />}</div>
    </div>
  );
}

export default App;