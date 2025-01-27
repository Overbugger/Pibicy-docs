import { useEffect, useState, useRef, useCallback } from "react";
import { fabric } from "fabric";
import {
  Shapes,
  Circle,
  Square,
  Triangle,
  Circle as CircleIcon,
  Hexagon,
  ChevronDown,
  Trash2,
  Minus,
  MousePointer,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Bold,
  Italic,
  Strikethrough,
} from "lucide-react";

interface FileViewerProps {
  file: File;
}

type ShapeType =
  | "line"
  | "circle"
  | "rectangle"
  | "triangle"
  | "ellipse"
  | "polygon"
  | "text"
  | null;

interface ShapeOption {
  type: ShapeType;
  icon: React.ReactNode;
  label: string;
}

const shapeOptions: ShapeOption[] = [
  { type: "line", icon: <Minus className="w-4 h-4" />, label: "Line" },
  { type: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
  {
    type: "rectangle",
    icon: <Square className="w-4 h-4" />,
    label: "Rectangle",
  },
  {
    type: "triangle",
    icon: <Triangle className="w-4 h-4" />,
    label: "Triangle",
  },
  {
    type: "ellipse",
    icon: <CircleIcon className="w-4 h-4 transform scale-x-150" />,
    label: "Ellipse",
  },
  { type: "polygon", icon: <Hexagon className="w-4 h-4" />, label: "Polygon" },
];

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const fontFamilies = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

// Add proper type imports for fabric.js events
interface IEvent<T extends Event = Event> {
  e: T;
  target?: fabric.Object;
  subTargets?: fabric.Object[];
  button?: number;
  isClick?: boolean;
  pointer?: fabric.Point;
  transform?: { corner: string };
}

interface SelectionEvent extends IEvent {
  target: fabric.Object;
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
}

interface MouseEvent extends IEvent {
  pointer: fabric.Point;
  absolutePointer: fabric.Point;
  button: number;
  isClick: boolean;
}

const FileViewer = ({ file }: FileViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeShape, setActiveShape] = useState<ShapeType>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("transparent");
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [isSelectionMode, setIsSelectionMode] = useState(true);
  const [isTextMode, setIsTextMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left"
  );
  const [showTextControls, setShowTextControls] = useState(false);
  const [activeTextObj, setActiveTextObj] = useState<fabric.IText | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDeleteSelected = useCallback(() => {
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
  }, [canvas]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

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
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        obj.set({
          selectable: isSelectionMode,
          hasControls: isSelectionMode,
          hasBorders: isSelectionMode,
        });
      }
    });

    canvas.selection = isSelectionMode;
    canvas.defaultCursor = isSelectionMode ? "default" : "crosshair";
    canvas.renderAll();
  }, [canvas, isSelectionMode]);

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
      const imgAspectRatio = img.width! / img.height!;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let scaleX, scaleY;
      if (imgAspectRatio > canvasAspectRatio) {
        scaleX = canvasWidth / img.width!;
        scaleY = scaleX;
      } else {
        scaleY = canvasHeight / img.height!;
        scaleX = scaleY;
      }

      img.set({
        scaleX: scaleX,
        scaleY: scaleY,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: false,
      });

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
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
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: fillColor,
      left: pointer.x,
      top: pointer.y,
    };

    switch (activeShape) {
      case "line":
        return new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          ...shapeProps,
          fill: strokeColor,
        });
      case "circle":
        return new fabric.Circle({
          ...shapeProps,
          radius: 0,
        });
      case "rectangle":
        return new fabric.Rect({
          ...shapeProps,
          width: 0,
          height: 0,
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
      case "polygon":
        return new fabric.Polygon(
          [
            { x: pointer.x, y: pointer.y },
            { x: pointer.x, y: pointer.y },
            { x: pointer.x, y: pointer.y },
          ],
          {
            ...shapeProps,
          }
        );
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
      textAlign: textAlign,
      padding: 5,
      selectable: true,
      hasControls: true,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      underline: isStrikethrough,
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

  const handleDoneEditing = () => {
    if (!canvas || !activeTextObj) return;

    activeTextObj.exitEditing();
    canvas.renderAll();
    setIsTextMode(false);
    setShowTextControls(false);
    setActiveTextObj(null);
  };

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: fabric.IEvent<Event>) => {
      if (!canvas) return;

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
        case "circle":
          {
            const radius = Math.sqrt(
              Math.pow(pointer.x - startPointRef.current.x, 2) +
                Math.pow(pointer.y - startPointRef.current.y, 2)
            );
            (activeObject as fabric.Circle).set({ radius });
          }
          break;
        case "rectangle":
        case "triangle":
          activeObject.set({
            width: Math.abs(pointer.x - startPointRef.current.x),
            height: Math.abs(pointer.y - startPointRef.current.y),
          });
          break;
        case "ellipse":
          (activeObject as fabric.Ellipse).set({
            rx: Math.abs(pointer.x - startPointRef.current.x) / 2,
            ry: Math.abs(pointer.y - startPointRef.current.y) / 2,
          });
          break;
        case "polygon":
          {
            const points = [
              new fabric.Point(
                startPointRef.current.x,
                startPointRef.current.y
              ),
              new fabric.Point(pointer.x, startPointRef.current.y),
              new fabric.Point(pointer.x, pointer.y),
            ];
            (activeObject as fabric.Polygon).set({ points });
          }
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!canvas) return;
      setIsDrawing(false);
      startPointRef.current = null;
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        canvas.setActiveObject(objects[objects.length - 1]);
      }
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
  }, [canvas, activeShape, isDrawing, isTextMode, activeTextObj]);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Check if we're currently editing a text object
        const activeObj = canvas.getActiveObject();
        if (activeObj instanceof fabric.IText && activeObj.isEditing) {
          return; // Don't delete the object if we're editing text
        }
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, handleDeleteSelected]);

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
    if (!activeTextObj || !canvas) return;

    const updateSelectedTextStyle = () => {
      const selectionStart = activeTextObj.selectionStart;
      const selectionEnd = activeTextObj.selectionEnd;

      if (
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number" &&
        selectionStart !== selectionEnd
      ) {
        // Apply styles only to selected text
        activeTextObj.setSelectionStyles(
          {
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            underline: isStrikethrough,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: strokeColor,
          },
          selectionStart,
          selectionEnd
        );
      } else {
        // If no selection, set the style for the next input
        activeTextObj.setSelectionStyles({
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          underline: isStrikethrough,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: strokeColor,
        });
      }
      canvas.renderAll();
    };

    updateSelectedTextStyle();
  }, [
    isBold,
    isItalic,
    isStrikethrough,
    fontSize,
    fontFamily,
    strokeColor,
    activeTextObj,
    canvas,
  ]);

  useEffect(() => {
    if (!canvas) return;

    const handleTextSelected = (e: fabric.IEvent<Event>) => {
      const target = e.target;
      if (target && target instanceof fabric.IText) {
        setActiveTextObj(target);
        setIsTextMode(true);
        setShowTextControls(true);

        // Get styles of selected text
        const selectionStart = target.selectionStart;
        const selectionEnd = target.selectionEnd;

        if (
          typeof selectionStart === "number" &&
          typeof selectionEnd === "number" &&
          selectionStart !== selectionEnd
        ) {
          const selectedStyles = target.getSelectionStyles(
            selectionStart,
            selectionEnd
          );
          if (selectedStyles.length > 0) {
            const firstStyle = selectedStyles[0];
            setIsBold(firstStyle.fontWeight === "bold");
            setIsItalic(firstStyle.fontStyle === "italic");
            setIsStrikethrough(!!firstStyle.underline);
            if (firstStyle.fontSize) setFontSize(firstStyle.fontSize as number);
            if (firstStyle.fontFamily)
              setFontFamily(firstStyle.fontFamily as string);
            if (firstStyle.fill) setStrokeColor(firstStyle.fill as string);
          }
        }
      }
    };

    const handleSelectionChanged = (e: fabric.IEvent<Event>) => {
      const target = e.target;
      if (target && target instanceof fabric.IText && target.isEditing) {
        const selectionStart = target.selectionStart;
        const selectionEnd = target.selectionEnd;

        if (
          typeof selectionStart === "number" &&
          typeof selectionEnd === "number" &&
          selectionStart !== selectionEnd
        ) {
          const selectedStyles = target.getSelectionStyles(
            selectionStart,
            selectionEnd
          );
          if (selectedStyles.length > 0) {
            const firstStyle = selectedStyles[0];
            setIsBold(firstStyle.fontWeight === "bold");
            setIsItalic(firstStyle.fontStyle === "italic");
            setIsStrikethrough(!!firstStyle.underline);
            if (firstStyle.fontSize) setFontSize(firstStyle.fontSize as number);
            if (firstStyle.fontFamily)
              setFontFamily(firstStyle.fontFamily as string);
            if (firstStyle.fill) setStrokeColor(firstStyle.fill as string);
          }
        }
      }
    };

    canvas.on("selection:created", handleTextSelected);
    canvas.on("selection:updated", handleTextSelected);
    canvas.on("text:selection:changed", handleSelectionChanged);
    canvas.on("selection:cleared", () => {
      if (!isTextMode) {
        setActiveTextObj(null);
        setShowTextControls(false);
      }
    });

    return () => {
      canvas.off("selection:created", handleTextSelected);
      canvas.off("selection:updated", handleTextSelected);
      canvas.off("text:selection:changed", handleSelectionChanged);
    };
  }, [canvas]);

  return (
    <div className="mt-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!error && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 p-2 border-b border-gray-200">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded ${
                    isSelectionMode
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setIsSelectionMode(true);
                    setActiveShape(null);
                    setShowShapeDropdown(false);
                    setIsTextMode(false);
                    setShowTextControls(false);
                  }}
                  title="Select and modify shapes"
                >
                  <MousePointer className="w-5 h-5" />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded ${
                      !isSelectionMode && showShapeDropdown
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    } ${activeShape ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => {
                      setShowShapeDropdown(!showShapeDropdown);
                      setIsSelectionMode(false);
                      setIsTextMode(false);
                      setShowTextControls(false);
                    }}
                  >
                    <Shapes className="w-5 h-5" />
                    <span className="text-sm font-medium">Shapes</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showShapeDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {shapeOptions.map(({ type, icon, label }) => (
                        <button
                          key={type}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                            activeShape === type
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }`}
                          onClick={() => {
                            setActiveShape(activeShape === type ? null : type);
                            setShowShapeDropdown(false);
                            setIsSelectionMode(false);
                          }}
                        >
                          {icon}
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded ${
                    isTextMode ? "bg-blue-500 text-white" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (!isTextMode) {
                      setIsTextMode(true);
                      setIsSelectionMode(false);
                      setActiveShape(null);
                      setShowShapeDropdown(false);
                      setShowTextControls(true);
                    }
                  }}
                  title="Add text"
                >
                  <Type className="w-5 h-5" />
                  <span className="text-sm font-medium">Text</span>
                </button>

                <div className="w-px h-6 bg-gray-200" />

                <div
                  className={`flex items-center gap-4 ${
                    !selectedObject ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Stroke:</label>
                    <div className="relative">
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => {
                          setStrokeColor(e.target.value);
                          updateSelectedObject();
                        }}
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

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Fill:</label>
                    <div className="relative">
                      <input
                        type="color"
                        value={
                          fillColor === "transparent" ? "#ffffff" : fillColor
                        }
                        onChange={(e) => {
                          setFillColor(e.target.value);
                          updateSelectedObject();
                        }}
                        className="w-8 h-8 cursor-pointer opacity-0 absolute"
                      />
                      <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center">
                        <div
                          className="w-6 h-6 rounded"
                          style={{
                            backgroundColor: fillColor,
                            backgroundImage:
                              fillColor === "transparent"
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                : undefined,
                            backgroundSize: "6px 6px",
                            backgroundPosition:
                              "0 0, 0 3px, 3px -3px, -3px 0px",
                          }}
                        />
                      </div>
                    </div>
                    <button
                      className={`px-2 py-1 rounded text-sm ${
                        fillColor === "transparent"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => {
                        setFillColor(
                          fillColor === "transparent"
                            ? "#ffffff"
                            : "transparent"
                        );
                        updateSelectedObject();
                      }}
                    >
                      Transparent
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={strokeWidth}
                      onChange={(e) => {
                        setStrokeWidth(Number(e.target.value));
                        updateSelectedObject();
                      }}
                      className="w-24"
                    />
                    <span className="text-sm w-8">{strokeWidth}px</span>
                  </div>

                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={handleClearCanvas}
                    title="Delete selected shape"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {showTextControls && (
                <div className="flex items-center gap-4 p-2 border-b border-gray-200 bg-gray-50">
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>

                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="px-2 py-1 border rounded w-20"
                  >
                    {fontSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 border rounded">
                    <button
                      className={`p-1 ${isBold ? "bg-gray-200" : ""}`}
                      onClick={() => {
                        setIsBold(!isBold);
                        if (activeTextObj) {
                          activeTextObj.set(
                            "fontWeight",
                            !isBold ? "bold" : "normal"
                          );
                          canvas?.renderAll();
                        }
                      }}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1 ${isItalic ? "bg-gray-200" : ""}`}
                      onClick={() => {
                        setIsItalic(!isItalic);
                        if (activeTextObj) {
                          activeTextObj.set(
                            "fontStyle",
                            !isItalic ? "italic" : "normal"
                          );
                          canvas?.renderAll();
                        }
                      }}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1 ${isStrikethrough ? "bg-gray-200" : ""}`}
                      onClick={() => {
                        setIsStrikethrough(!isStrikethrough);
                        if (activeTextObj) {
                          activeTextObj.set("underline", !isStrikethrough);
                          canvas?.renderAll();
                        }
                      }}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                      className={`p-1 ${
                        textAlign === "left" ? "bg-gray-200" : ""
                      }`}
                      onClick={() => setTextAlign("left")}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1 ${
                        textAlign === "center" ? "bg-gray-200" : ""
                      }`}
                      onClick={() => setTextAlign("center")}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1 ${
                        textAlign === "right" ? "bg-gray-200" : ""
                      }`}
                      onClick={() => setTextAlign("right")}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
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

                  <button
                    className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleDoneEditing}
                  >
                    <Check className="w-4 h-4" />
                    <span>Done</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <canvas ref={canvasRef} />
            {canvas && (
              <>
                {(canvas.getObjects().length > 1 ||
                  activeShape ||
                  isTextMode) && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 rounded text-sm font-medium">
                    {isSelectionMode
                      ? "Selection Mode"
                      : isTextMode
                      ? "Type anything"
                      : activeShape
                      ? `Drawing ${activeShape}`
                      : "Select a shape"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
