import { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";
import {
  Circle,
  Square,
  Triangle,
  Circle as CircleIcon,
  Trash2,
  Minus,
  MousePointer,
  Type,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

interface FileViewerProps {
  file: File;
}

type ShapeType = "line" | "rectangle" | "circle" | "triangle" | "ellipse" | "highlight" | "cover" | "text" | null;

interface ShapeOption {
  type: ShapeType;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const shapeOptions: ShapeOption[] = [
  { type: "line", icon: <Minus className="w-4 h-4" />, label: "Line" },
  { type: "rectangle", icon: <Square className="w-4 h-4" />, label: "Rectangle" },
  { type: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
  { type: "triangle", icon: <Triangle className="w-4 h-4" />, label: "Triangle" },
  { type: "ellipse", icon: <CircleIcon className="w-4 h-4 transform scale-x-150" />, label: "Ellipse" },
  { type: "highlight", icon: <Eye className="w-4 h-4" />, label: "Highlight", color: "#ffeb3b" },
  { type: "cover", icon: <EyeOff className="w-4 h-4" />, label: "Cover" },
];

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const fontFamilies = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];

const FileViewer = ({ file }: FileViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("transparent");
  const [showShapeDropdown, setShowShapeDropdown] = useState(true);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [showTextControls, setShowTextControls] = useState(false);
  const [activeTextObj, setActiveTextObj] = useState<fabric.IText | null>(null);
  const [highlightColor, setHighlightColor] = useState("#ffeb3b");
  const [highlightOpacity, setHighlightOpacity] = useState(0.3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Get the parent container dimensions
    const container = canvasRef.current.parentElement;
    if (!container) return;

    // Calculate canvas size based on viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Set canvas size accounting for padding and tools panel
    const canvasWidth = Math.min(viewportWidth - 400, 1200); // Max width 1200px
    const canvasHeight = Math.min(viewportHeight - 200, 800); // Max height 800px

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
      centeredScaling: true,
    });

    // Add resize handler
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth - 400, 1200);
      const newHeight = Math.min(window.innerHeight - 200, 800);
      fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    fabricCanvas.on("object:added", function (e) {
      if (e.target) {
        e.target.set({
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });
      }
    });

    setCanvas(fabricCanvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas || !file) return;

    const type = file.type;
    if (!type.startsWith("image/")) {
      setError("Only JPG and PNG files are supported");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    fabric.Image.fromURL(url, (img) => {
      if (!canvas || !img) return;

      canvas.clear();

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width!;
      const imgHeight = img.height!;

      // Calculate scaling to fit the image within the canvas while maintaining aspect ratio
      const scaleX = (canvasWidth * 0.9) / imgWidth;
      const scaleY = (canvasHeight * 0.9) / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      // Center the image
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: false,
        crossOrigin: 'anonymous'
      });

      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
        // Optionally zoom to fit if image is too small
        if (scale < 0.5) {
          canvas.setZoom(Math.min(0.9, 1 / scale));
          canvas.renderAll();
        }
      });

      // Reset the view
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    });

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file, canvas]);

  const createShape = (pointer: { x: number; y: number }) => {
    if (!canvas) return null;

    const shapeProps = {
      stroke: activeShape === "highlight" ? "transparent" : strokeColor,
      strokeWidth: strokeWidth,
      fill: activeShape === "highlight" 
        ? `${highlightColor}${Math.round(highlightOpacity * 255).toString(16).padStart(2, '0')}` 
        : activeShape === "cover"
        ? "#000000"
        : fillColor,
      left: pointer.x,
      top: pointer.y,
      selectable: isSelectionMode,
      hasControls: isSelectionMode,
      hasBorders: isSelectionMode,
      lockMovementX: !isSelectionMode,
      lockMovementY: !isSelectionMode,
    };

    switch (activeShape) {
      case "line":
        return new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          ...shapeProps,
          fill: strokeColor,
        });
      case "rectangle":
      case "highlight":
      case "cover":
        return new fabric.Rect({
          ...shapeProps,
          width: 0,
          height: 0,
        });
      case "circle":
        return new fabric.Circle({
          ...shapeProps,
          radius: 0,
        });
      case "triangle":
        return new fabric.Triangle({
          ...shapeProps,
          width: 0,
          height: 0,
        });
      case "ellipse":
        return new fabric.Ellipse({
          ...shapeProps,
          rx: 0,
          ry: 0,
        });
      default:
        return null;
    }
  };

  const createTextbox = (pointer: { x: number; y: number }) => {
    if (!canvas) return null;

    const textbox = new fabric.IText("", {
      left: pointer.x,
      top: pointer.y,
      fill: strokeColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      padding: 5,
      selectable: true,
      hasControls: true,
    });

    textbox.on("editing:entered", () => {
      setIsTextMode(true);
      setShowTextControls(true);
      setActiveTextObj(textbox);
    });

    textbox.on("editing:exited", () => {
      if (!textbox.text) {
        canvas.remove(textbox);
      }
    });

    return textbox;
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (obj !== canvas.backgroundImage) {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: fabric.IEvent<Event>) => {
      if (!canvas) return;

      if (isSelectionMode) return;

      const pointer = canvas.getPointer(e.e);

      if (isTextMode && !activeTextObj) {
        const textbox = createTextbox({ x: pointer.x, y: pointer.y });
        if (textbox) {
          canvas.add(textbox);
          canvas.setActiveObject(textbox);
          textbox.enterEditing();
          canvas.renderAll();
        }
        return;
      }

      if (!activeShape || isDrawing) return;

      setIsDrawing(true);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      const shape = createShape({ x: pointer.x, y: pointer.y });
      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
      }
    };

    const handleMouseMove = (e: fabric.IEvent<Event>) => {
      if (!isDrawing || !canvas || !activeShape || !startPointRef.current)
        return;

      const pointer = canvas.getPointer(e.e);
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      switch (activeShape) {
        case "line":
          (activeObject as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
          break;
        case "rectangle":
        case "highlight":
        case "cover":
        case "triangle":
          activeObject.set({
            width: Math.abs(pointer.x - startPointRef.current.x),
            height: Math.abs(pointer.y - startPointRef.current.y),
          });
          break;
        case "circle":
          {
            const radius = Math.sqrt(
              Math.pow(pointer.x - startPointRef.current.x, 2) +
              Math.pow(pointer.y - startPointRef.current.y, 2)
            );
            (activeObject as fabric.Circle).set({ radius });
          }
          break;
        case "ellipse":
          (activeObject as fabric.Ellipse).set({
            rx: Math.abs(pointer.x - startPointRef.current.x) / 2,
            ry: Math.abs(pointer.y - startPointRef.current.y) / 2,
          });
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!canvas) return;
      setIsDrawing(false);
      startPointRef.current = null;
      canvas.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, activeShape, isDrawing, isTextMode, activeTextObj, isSelectionMode]);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObj = canvas.getActiveObject();
        if (activeObj instanceof fabric.IText && activeObj.isEditing) {
          return;
        }
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas]);

  const handleClearCanvas = () => {
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const updateSelectedObject = () => {
    if (!selectedObject || !canvas) return;

    selectedObject.set({
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: fillColor,
    });
    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const selected = canvas.getActiveObject();
      setSelectedObject(selected || null);
      if (selected) {
        setStrokeColor((selected.stroke as string) || "#000000");
        setStrokeWidth(selected.strokeWidth || 2);
        setFillColor((selected.fill as string) || "transparent");
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowShapeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const handleObjectAdded = () => setHasUnsavedChanges(true);
    const handleObjectRemoved = () => setHasUnsavedChanges(true);
    const handleObjectModified = () => setHasUnsavedChanges(true);

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvas]);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      // Navigate back to file upload
      window.location.reload();
    }
  };

  const handleAddNew = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      window.location.reload();
    }
  };

  const handleDownload = () => {
    if (!canvas) return;

    // Create a temporary canvas for the final image
    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');
    if (!context) return;

    // Set the canvas dimensions
    tempCanvas.width = canvas.getWidth();
    tempCanvas.height = canvas.getHeight();

    // Draw the background color
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Get the canvas data URL
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });

    // Create a download link
    const link = document.createElement('a');
    link.download = `edited_${file.name.split('.')[0]}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 text-red-600 rounded-lg mt-4">
          {error}
        </div>
      )}
      {!error && (
        <div className="flex flex-col h-full max-w-[1800px] mx-auto px-6">
          {/* Header */}
          <div className="py-4 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex gap-6 h-[calc(100vh-120px)]">
            {/* Canvas Section */}
            <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center bg-[#f8fafc] p-4">
                <canvas ref={canvasRef} className="max-w-full max-h-full" />
              </div>
            </div>

            {/* Tools Panel */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                {/* Main Tools */}
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Tools
                  </h3>
                  {/* Tool Selection Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all ${
                        isSelectionMode
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => {
                        setIsSelectionMode(true);
                        setActiveShape(null);
                        setShowShapeDropdown(false);
                        setIsTextMode(false);
                        setShowTextControls(false);
                      }}
                    >
                      <MousePointer className="w-5 h-5" />
                      <span className="text-xs font-medium">Select</span>
                    </button>

                    <button
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all ${
                        activeShape || showShapeDropdown
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => {
                        setShowShapeDropdown(!showShapeDropdown);
                        setIsSelectionMode(false);
                        setIsTextMode(false);
                        setShowTextControls(false);
                      }}
                    >
                      <Square className="w-5 h-5" />
                      <span className="text-xs font-medium">Draw</span>
                    </button>

                    <button
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all ${
                        isTextMode
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => {
                        setIsTextMode(!isTextMode);
                        setIsSelectionMode(false);
                        setActiveShape(null);
                        setShowShapeDropdown(false);
                        setShowTextControls(!isTextMode);
                      }}
                    >
                      <Type className="w-5 h-5" />
                      <span className="text-xs font-medium">Text</span>
                    </button>
                  </div>

                  {/* Dynamic Tool Content */}
                  <div className="space-y-4">
                    {/* Shape Tools */}
                    {showShapeDropdown && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-600">
                          Drawing Tools
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {shapeOptions.map(({ type, icon, label }) => (
                            <button
                              key={type}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                activeShape === type
                                  ? "bg-blue-50 text-blue-600"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                              onClick={() => {
                                setActiveShape(
                                  activeShape === type ? null : type
                                );
                                setIsSelectionMode(false);
                              }}
                            >
                              {icon}
                              <span className="text-sm">{label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Highlight Controls */}
                        {activeShape === "highlight" && (
                          <div className="space-y-3 pt-3 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-600">
                              Highlight Options
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">
                                  Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <input
                                      type="color"
                                      value={highlightColor}
                                      onChange={(e) => setHighlightColor(e.target.value)}
                                      className="w-10 h-10 cursor-pointer opacity-0 absolute"
                                    />
                                    <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                                      <div
                                        className="w-8 h-8 rounded"
                                        style={{ backgroundColor: highlightColor }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <select
                                      value={highlightColor}
                                      onChange={(e) => setHighlightColor(e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200"
                                    >
                                      <option value="#ffeb3b">Yellow</option>
                                      <option value="#4caf50">Green</option>
                                      <option value="#2196f3">Blue</option>
                                      <option value="#f44336">Red</option>
                                      <option value="#9c27b0">Purple</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">
                                  Opacity: {Math.round(highlightOpacity * 100)}%
                                </label>
                                <input
                                  type="range"
                                  min="10"
                                  max="80"
                                  value={highlightOpacity * 100}
                                  onChange={(e) => setHighlightOpacity(Number(e.target.value) / 100)}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Tools */}
                    {isTextMode && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-600">
                          Text Options
                        </h4>
                        <div className="grid gap-3">
                          <div className="flex gap-2">
                            <select
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200"
                            >
                              {fontFamilies.map((font) => (
                                <option key={font} value={font}>
                                  {font}
                                </option>
                              ))}
                            </select>
                            <select
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(Number(e.target.value))
                              }
                              className="w-24 px-3 py-1.5 rounded-lg border border-gray-200"
                            >
                              {fontSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}px
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Color:</label>
                            <div className="relative">
                              <input
                                type="color"
                                value={strokeColor}
                                onChange={(e) => setStrokeColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer opacity-0 absolute"
                              />
                              <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">
                                <div
                                  className="w-6 h-6 rounded"
                                  style={{ backgroundColor: strokeColor }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Object Properties */}
                    {selectedObject && !isTextMode && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-600">
                            Properties
                          </h4>
                          <div className="space-y-2">
                            {activeShape !== "highlight" && activeShape !== "cover" && (
                              <>
                                <label className="text-sm font-medium text-gray-600">
                                  Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <input
                                      type="color"
                                      value={strokeColor}
                                      onChange={(e) => {
                                        setStrokeColor(e.target.value);
                                        updateSelectedObject();
                                      }}
                                      className="w-10 h-10 cursor-pointer opacity-0 absolute"
                                    />
                                    <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                                      <div
                                        className="w-8 h-8 rounded"
                                        style={{ backgroundColor: strokeColor }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Width
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="1"
                                  max="20"
                                  value={strokeWidth}
                                  onChange={(e) => {
                                    setStrokeWidth(Number(e.target.value));
                                    updateSelectedObject();
                                  }}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium text-gray-600 w-12">
                                  {strokeWidth}px
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clear Canvas Button */}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        onClick={handleClearCanvas}
                        disabled={
                          !canvas || (canvas && canvas.getObjects().length <= 1)
                        }
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-medium">Clear all</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <UnsavedChangesDialog
            isOpen={showUnsavedDialog}
            onClose={() => setShowUnsavedDialog(false)}
            onBack={() => {
              setShowUnsavedDialog(false);
              window.location.reload();
            }}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
};

export default FileViewer;
