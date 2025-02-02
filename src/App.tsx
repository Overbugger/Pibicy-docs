import { useState } from "react";
import FileViewer from './components/FileViewer';
import { FileUpload } from './components/FileUpload';
import { Pencil, Image, Download } from 'lucide-react';

export const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const features = [
    {
      icon: <Image className="w-6 h-6 text-blue-500" />,
      title: "Upload Your Image",
      description: "Start by uploading any image file (JPG, PNG) you want to annotate or edit."
    },
    {
      icon: <Pencil className="w-6 h-6 text-green-500" />,
      title: "Add Annotations",
      description: "Draw shapes, add text, highlight important areas, or cover sensitive information."
    },
    {
      icon: <Download className="w-6 h-6 text-purple-500" />,
      title: "Save & Export",
      description: "Download your edited image in its original format or export as a new image file."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!selectedFile ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Image Annotation Made Simple
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A powerful tool for adding shapes, text, and highlights to your images. Perfect for documentation, presentations, or quick edits.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-24">
            <FileUpload onFileSelect={setSelectedFile} />
          </div>

          {/* How it Works Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Powerful Features
            </h2>
            <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-700">✨ Multiple Shapes</div>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-700">📝 Text Annotation</div>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-700">🎨 Custom Colors</div>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm text-gray-700">💾 Original Format</div>
            </div>
          </div>
        </div>
      ) : (
        <FileViewer file={selectedFile} />
      )}
    </div>
  );
};
