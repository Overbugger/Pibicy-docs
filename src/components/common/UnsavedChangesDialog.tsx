interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onQuit: () => void;
}

export const UnsavedChangesDialog = ({
  isOpen,
  onClose,
  onQuit,
}: UnsavedChangesDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Unsaved Changes</h2>
        <p className="text-gray-600 mb-6">
          You have unsaved changes. Are you sure you want to quit? All changes will be lost.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={onQuit}
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}; 