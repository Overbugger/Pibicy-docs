import { useEffect, useState, useRef } from "react";

interface FileViewerProps {
  file: File;
}

const FileViewer = ({ file }: FileViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = file.type;
    if (!type.startsWith("image/")) {
      setError("Only image files are supported");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file]);

  return (
    <div className="mt-4 relative">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!error && (
        <div className="relative">
          <img src={imageUrl} alt="Uploaded" className="max-w-full" />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-auto"
            style={{ zIndex: 1 }}
          />
        </div>
      )}
    </div>
  );
};

export default FileViewer;
