import { ArrowLeftFromLine, Download, X } from "lucide-react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onQuit: () => void;
}

const UnsavedChangesDialog = ({
  isOpen,
  onClose,
  onQuit,
}: UnsavedChangesDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Unsaved Changes
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          You have some unsaved changes, download doc?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onQuit}
            className="px-4 py-2 rounded-lg  bg-red-50 text-red-600 hover:bg-red-100  transition-colors flex gap-1 items-center"
          >
            <ArrowLeftFromLine className="w-5 h-5 text-red-600" />
            Quit Anyway
          </button>

          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex gap-1 items-center"
            disabled
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
