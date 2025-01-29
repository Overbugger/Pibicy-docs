import { useState } from "react";
import { FileEditor } from './components/features/file-editor/FileEditor';
import { FileUpload } from './components/FileUpload';

export const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">File Editor</h1>
        
        {!selectedFile ? (
          <FileUpload onFileSelect={setSelectedFile} />
        ) : (
          <FileEditor file={selectedFile} />
        )}
      </div>
    </div>
  );
};
