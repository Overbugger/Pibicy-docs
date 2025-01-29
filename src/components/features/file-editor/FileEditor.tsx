import { useState } from 'react';
import { Canvas } from './Canvas/Canvas';
import { Toolbar } from './Toolbar/Toolbar';
import { ShapeType, TextStyle, ShapeStyle, FONT_SIZES, FONT_FAMILIES } from './types';
import { UnsavedChangesDialog } from '../../common/UnsavedChangesDialog';

interface FileEditorProps {
  file: File;
}

export const FileEditor = ({ file }: FileEditorProps) => {
  // Shape and mode state
  const [selectedShape, setSelectedShape] = useState<ShapeType>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text styling state
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 20,
    fontFamily: 'Arial',
    textAlign: 'left',
    isBold: false,
    isItalic: false,
    isStrikethrough: false,
  });

  // Shape styling state
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    strokeColor: '#000000',
    strokeWidth: 2,
    fillColor: 'transparent',
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);

  const handleObjectAdded = (e: fabric.IEvent) => {
    console.log('Object added:', e);
  };

  const handleSelectionChanged = (e: fabric.IEvent<Event>) => {
    console.log('Selection changed:', e);
  };

  const handleTextSelected = (e: fabric.IEvent<Event>) => {
    console.log('Text selected:', e);
    setIsTextMode(true);
  };

  const handleQuit = () => {
    window.location.reload();
  };

  const handleShapeSelect = (shape: ShapeType) => {
    setSelectedShape(shape);
    setIsSelectionMode(false);
    setIsTextMode(false);
    setShowShapeDropdown(false);
  };

  const handleTextStyleChange = (updates: Partial<TextStyle>) => {
    setTextStyle(prev => ({ ...prev, ...updates }));
  };

  const handleShapeStyleChange = (updates: Partial<ShapeStyle>) => {
    setShapeStyle(prev => ({ ...prev, ...updates }));
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="flex h-full">
      {error ? (
        <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      ) : (
        <>
          <div className="flex-none">
            <Toolbar
              selectedShape={selectedShape}
              isSelectionMode={isSelectionMode}
              isTextMode={isTextMode}
              showShapeDropdown={showShapeDropdown}
              textStyle={textStyle}
              shapeStyle={shapeStyle}
              onShapeSelect={handleShapeSelect}
              onSelectionModeToggle={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedShape(null);
                setShowShapeDropdown(false);
                setIsTextMode(false);
              }}
              onTextModeToggle={() => {
                setIsTextMode(!isTextMode);
                setSelectedShape(isTextMode ? null : 'text');
                setIsSelectionMode(false);
                setShowShapeDropdown(false);
              }}
              onShapeDropdownToggle={() => setShowShapeDropdown(!showShapeDropdown)}
              onTextStyleChange={handleTextStyleChange}
              onShapeStyleChange={handleShapeStyleChange}
              fontSizes={FONT_SIZES}
              fontFamilies={FONT_FAMILIES}
            />
          </div>
          <div className="flex-1 ml-4">
            <Canvas
              file={file}
              selectedShape={selectedShape}
              textStyle={textStyle}
              shapeStyle={shapeStyle}
              isSelectionMode={isSelectionMode}
              isTextMode={isTextMode}
              onObjectAdded={handleObjectAdded}
              onSelectionChanged={handleSelectionChanged}
              onTextSelected={handleTextSelected}
              onError={handleError}
            />
          </div>
        </>
      )}
      <UnsavedChangesDialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onQuit={handleQuit}
      />
    </div>
  );
}; 