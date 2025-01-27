import { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";

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
  | null;

const FileViewer = ({ file }: FileViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeShape, setActiveShape] = useState<ShapeType>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("transparent");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Load image
  useEffect(() => {
    if (!canvas || !file) return;

    const type = file.type;
    if (!type.startsWith("image/")) {
      setError("Only JPG and PNG files are supported");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Load image into Fabric canvas
    fabric.Image.fromURL(url, (img) => {
      if (!canvas || !img) return;

      // Clear any existing background
      canvas.clear();

      // Calculate scale to fit the canvas while maintaining aspect ratio
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

  // Handle mouse events for drawing
  useEffect(() => {
    if (!canvas || !activeShape) return;

    const handleMouseDown = (options: { e: Event }) => {
      if (!activeShape || isDrawing || !canvas) return;
      setIsDrawing(true);
      const pointer = canvas.getPointer(options.e as MouseEvent);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      const shape = createShape(pointer);
      if (shape) {
        canvas.add(shape);
      }
    };

    const handleMouseMove = (options: { e: Event }) => {
      if (!isDrawing || !startPointRef.current || !canvas) return;
      const pointer = canvas.getPointer(options.e as MouseEvent);
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
          (activeObject as fabric.Circle).set({
            radius:
              Math.sqrt(
                Math.pow(pointer.x - startPointRef.current.x, 2) +
                  Math.pow(pointer.y - startPointRef.current.y, 2)
              ) / 2,
          });
          break;
        case "rectangle":
        case "triangle": {
          const width = pointer.x - startPointRef.current.x;
          const height = pointer.y - startPointRef.current.y;
          (activeObject as fabric.Rect | fabric.Triangle).set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width > 0 ? startPointRef.current.x : pointer.x,
            top: height > 0 ? startPointRef.current.y : pointer.y,
          });
          break;
        }
        case "ellipse": {
          const width = Math.abs(pointer.x - startPointRef.current.x);
          const height = Math.abs(pointer.y - startPointRef.current.y);
          (activeObject as fabric.Ellipse).set({
            rx: width / 2,
            ry: height / 2,
          });
          break;
        }
        case "polygon": {
          const points = [
            new fabric.Point(startPointRef.current.x, startPointRef.current.y),
            new fabric.Point(pointer.x, startPointRef.current.y),
            new fabric.Point(
              (startPointRef.current.x + pointer.x) / 2,
              pointer.y
            ),
          ];
          (activeObject as fabric.Polygon).set({ points });
          break;
        }
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
  }, [canvas, activeShape, isDrawing, strokeColor, strokeWidth, fillColor]);

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const handleClearCanvas = () => {
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  return (
    <div className="mt-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!error && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col gap-4">
              {/* Shape Selection */}
              <div className="flex flex-wrap gap-2">
                {[
                  "line",
                  "circle",
                  "rectangle",
                  "triangle",
                  "ellipse",
                  "polygon",
                ].map((shape) => (
                  <button
                    key={shape}
                    className={`px-4 py-2 rounded ${
                      activeShape === shape
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() =>
                      setActiveShape(
                        activeShape === shape ? null : (shape as ShapeType)
                      )
                    }
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>

              {/* Color and Width Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Stroke:</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Fill:</label>
                  <input
                    type="color"
                    value={fillColor === "transparent" ? "#ffffff" : fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-8 h-8 cursor-pointer"
                  />
                  <button
                    className={`px-2 py-1 rounded text-sm ${
                      fillColor === "transparent"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() =>
                      setFillColor(
                        fillColor === "transparent" ? "#ffffff" : "transparent"
                      )
                    }
                  >
                    Transparent
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Width:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm w-6">{strokeWidth}</span>
                </div>
              </div>

              {/* Canvas Controls */}
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                  onClick={handleClearCanvas}
                >
                  Clear All Shapes
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative border border-gray-300 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
