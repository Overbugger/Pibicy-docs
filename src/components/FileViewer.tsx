import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import readXlsxFile from "read-excel-file";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FileViewerProps {
  file: File;
}

const FileViewer = ({ file }: FileViewerProps) => {
  const [fileType, setFileType] = useState<string>("");
  const [pdfPages, setPdfPages] = useState<number | null>(null);
  const [docContent, setDocContent] = useState<string>("");
  const [xlsContent, setXlsContent] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const type = file.type || file.name.split(".").pop()?.toLowerCase();
    setFileType(type || "");
    setError(null);
    setIsLoading(true);

    switch (type) {
      case "application/pdf":
        const pdfObjectUrl = URL.createObjectURL(file);
        setPdfUrl(pdfObjectUrl);
        setIsLoading(false);
        break;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        file.arrayBuffer()
          .then(buffer => {
            return mammoth.extractRawText({ arrayBuffer: buffer });
          })
          .then((result) => {
            setDocContent(result.value);
          })
          .catch((err) => {
            setError(`Error processing document: ${err.message}`);
          })
          .finally(() => setIsLoading(false));
        break;
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        readXlsxFile(file)
          .then((rows) => {
            setXlsContent(rows);
          })
          .catch((err) => {
            setError(`Error processing spreadsheet: ${err.message}`);
          })
          .finally(() => setIsLoading(false));
        break;
      case "image/jpeg":
      case "image/png":
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setIsLoading(false);
        break;
      case "application/vnd.ms-outlook":
        setDocContent("MSG files are not directly renderable.");
        setIsLoading(false);
        break;
      default:
        setDocContent("Unsupported file type.");
        setIsLoading(false);
    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file, imageUrl, pdfUrl]);

  const onPdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPdfPages(numPages);
    setIsLoading(false);
  };

  const onPdfLoadError = (error: Error) => {
    setError(`Error loading PDF: ${error.message}`);
    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {isLoading && <div className="text-gray-500">Loading...</div>}
      
      {!error && (
        <>
          {fileType === "application/pdf" && (
            <Document 
              file={pdfUrl}
              onLoadSuccess={onPdfLoadSuccess}
              onLoadError={onPdfLoadError}
              loading={<div>Loading PDF...</div>}
            >
              {pdfPages && Array.from(new Array(pdfPages), (_, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1}
                  loading={<div>Loading page {index + 1}...</div>}
                />
              ))}
            </Document>
          )}
          {fileType.startsWith("image/") && <img src={imageUrl} alt="Uploaded" className="max-w-full" />}
          {fileType.includes("document") && <pre className="whitespace-pre-wrap">{docContent}</pre>}
          {fileType.includes("excel") && (
            <table className="w-full border-collapse">
              <tbody>
                {xlsContent.map((row, i) => (
                  <tr key={i} className="border-b">
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="border px-4 py-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {fileType === "application/vnd.ms-outlook" && <pre>{docContent}</pre>}
        </>
      )}
    </div>
  );
};

export default FileViewer;