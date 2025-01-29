import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { ShapeType, TextStyle, ShapeStyle, IEvent } from '../types';

interface CanvasProps {
  file: File;
  selectedShape: ShapeType;
  textStyle: TextStyle;
  shapeStyle: ShapeStyle;
  isSelectionMode: boolean;
  isTextMode: boolean;
  onObjectAdded?: (e: fabric.IEvent) => void;
  onSelectionChanged?: (e: fabric.IEvent<Event>) => void;
  onTextSelected?: (e: fabric.IEvent<Event>) => void;
  onError?: (error: string) => void;
}

export const Canvas = ({
  file,
  selectedShape,
  textStyle,
  shapeStyle,
  isSelectionMode,
  isTextMode,
  onObjectAdded,
  onSelectionChanged,
  onTextSelected,
  onError,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeShape, setActiveShape] = useState<fabric.Object | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });
    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
      fabricRef.current = null;
    };
  }, []);

  // Load image
  useEffect(() => {
    if (!fabricRef.current || !file) return;

    const type = file.type;
    if (!type.startsWith('image/')) {
      onError?.('Only image files are supported');
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    fabric.Image.fromURL(url, (img) => {
      if (!fabricRef.current || !img) return;

      fabricRef.current.clear();

      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
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
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: false,
      });

      fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current));
    });
  }, [file]);

  // Create shape
  const createShape = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricRef.current || !selectedShape) return null;

    const shapeProps = {
      stroke: shapeStyle.strokeColor,
      strokeWidth: shapeStyle.strokeWidth,
      fill: shapeStyle.fillColor,
      left: pointer.x,
      top: pointer.y,
      selectable: isSelectionMode,
      hasControls: isSelectionMode,
      hasBorders: isSelectionMode,
      lockMovementX: !isSelectionMode,
      lockMovementY: !isSelectionMode,
    };

    switch (selectedShape) {
      case 'line':
        return new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          ...shapeProps,
          fill: shapeStyle.strokeColor,
        });
      case 'circle':
        return new fabric.Circle({
          ...shapeProps,
          radius: 0,
        });
      case 'rectangle':
        return new fabric.Rect({
          ...shapeProps,
          width: 0,
          height: 0,
        });
      case 'triangle':
        return new fabric.Triangle({
          ...shapeProps,
          width: 0,
          height: 0,
        });
      default:
        return null;
    }
  }, [selectedShape, shapeStyle, isSelectionMode]);

  // Create text
  const createTextbox = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricRef.current) return null;

    const textbox = new fabric.IText('', {
      left: pointer.x,
      top: pointer.y,
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      textAlign: textStyle.textAlign,
      fontWeight: textStyle.isBold ? 'bold' : 'normal',
      fontStyle: textStyle.isItalic ? 'italic' : 'normal',
      underline: textStyle.isStrikethrough,
      fill: shapeStyle.strokeColor,
      padding: 5,
      selectable: true,
      hasControls: true,
    });

    textbox.on('editing:entered', () => {
      if (onTextSelected) {
        onTextSelected({
          e: new Event('text:editing:entered'),
          target: textbox,
        } as fabric.IEvent<Event>);
      }
    });

    textbox.on('editing:exited', () => {
      if (!textbox.text) {
        fabricRef.current?.remove(textbox);
      }
    });

    return textbox;
  }, [textStyle, shapeStyle.strokeColor, onTextSelected]);

  // Handle mouse events
  useEffect(() => {
    if (!fabricRef.current) return;

    const handleMouseDown = (e: IEvent) => {
      if (!fabricRef.current || isSelectionMode) return;

      const pointer = fabricRef.current.getPointer(e.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      if (isTextMode) {
        const textbox = createTextbox(pointer);
        if (textbox) {
          fabricRef.current.add(textbox);
          fabricRef.current.setActiveObject(textbox);
          textbox.enterEditing();
          fabricRef.current.renderAll();
          if (onObjectAdded) {
            onObjectAdded({
              e: e.e,
              target: textbox,
            } as fabric.IEvent);
          }
        }
        return;
      }

      if (!selectedShape || isDrawing) return;

      setIsDrawing(true);
      const shape = createShape(pointer);
      if (shape) {
        fabricRef.current.add(shape);
        fabricRef.current.setActiveObject(shape);
        setActiveShape(shape);
        if (onObjectAdded) {
          onObjectAdded({
            e: e.e,
            target: shape,
          } as fabric.IEvent);
        }
      }
    };

    const handleMouseMove = (e: IEvent) => {
      if (!fabricRef.current || !isDrawing || !activeShape || !startPointRef.current) return;

      const pointer = fabricRef.current.getPointer(e.e);

      if (activeShape instanceof fabric.Line) {
        activeShape.set({ x2: pointer.x, y2: pointer.y });
      } else {
        const width = Math.abs(pointer.x - startPointRef.current.x);
        const height = Math.abs(pointer.y - startPointRef.current.y);

        if (activeShape instanceof fabric.Circle) {
          const radius = Math.sqrt(width * width + height * height) / 2;
          activeShape.set({ radius });
        } else {
          activeShape.set({ width, height });
        }
      }

      fabricRef.current.renderAll();
    };

    const handleMouseUp = () => {
      if (!fabricRef.current) return;
      setIsDrawing(false);
      setActiveShape(null);
      startPointRef.current = null;
    };

    const safeSelectionChanged = (e: fabric.IEvent<Event>) => {
      if (onSelectionChanged) onSelectionChanged(e);
    };

    const safeTextChanged = (e: fabric.IEvent<Event>) => {
      if (onTextSelected) onTextSelected(e);
    };

    fabricRef.current.on('mouse:down', handleMouseDown);
    fabricRef.current.on('mouse:move', handleMouseMove);
    fabricRef.current.on('mouse:up', handleMouseUp);
    fabricRef.current.on('selection:created', safeSelectionChanged as any);
    fabricRef.current.on('selection:updated', safeSelectionChanged as any);
    fabricRef.current.on('text:changed', safeTextChanged as any);

    return () => {
      if (fabricRef.current) {
        fabricRef.current.off('mouse:down', handleMouseDown);
        fabricRef.current.off('mouse:move', handleMouseMove);
        fabricRef.current.off('mouse:up', handleMouseUp);
        fabricRef.current.off('selection:created', safeSelectionChanged as any);
        fabricRef.current.off('selection:updated', safeSelectionChanged as any);
        fabricRef.current.off('text:changed', safeTextChanged as any);
      }
    };
  }, [
    isSelectionMode,
    isTextMode,
    selectedShape,
    isDrawing,
    activeShape,
    createShape,
    createTextbox,
    onObjectAdded,
    onSelectionChanged,
    onTextSelected,
  ]);

  // Update selection mode
  useEffect(() => {
    if (!fabricRef.current) return;

    fabricRef.current.getObjects().forEach((obj) => {
      if (obj !== fabricRef.current?.backgroundImage) {
        obj.set({
          selectable: isSelectionMode,
          hasControls: isSelectionMode,
          hasBorders: isSelectionMode,
          lockMovementX: !isSelectionMode,
          lockMovementY: !isSelectionMode,
        });
      }
    });

    fabricRef.current.selection = isSelectionMode;
    fabricRef.current.defaultCursor = isSelectionMode ? 'default' : 'crosshair';
    fabricRef.current.hoverCursor = isSelectionMode ? 'move' : 'crosshair';
    fabricRef.current.renderAll();
  }, [isSelectionMode]);

  // Update text styles
  useEffect(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject && activeObject instanceof fabric.IText) {
      activeObject.set({
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        textAlign: textStyle.textAlign,
        fontWeight: textStyle.isBold ? 'bold' : 'normal',
        fontStyle: textStyle.isItalic ? 'italic' : 'normal',
        underline: textStyle.isStrikethrough,
      });
      fabricRef.current.renderAll();
    }
  }, [textStyle]);

  // Update shape styles
  useEffect(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject && !(activeObject instanceof fabric.IText)) {
      activeObject.set({
        stroke: shapeStyle.strokeColor,
        strokeWidth: shapeStyle.strokeWidth,
        fill: shapeStyle.fillColor,
      });
      fabricRef.current.renderAll();
    }
  }, [shapeStyle]);

  // Handle keyboard events for delete
  useEffect(() => {
    if (!fabricRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObj = fabricRef.current?.getActiveObject();
        if (activeObj && activeObj !== fabricRef.current?.backgroundImage) {
          if (activeObj instanceof fabric.IText && activeObj.isEditing) return;
          fabricRef.current?.remove(activeObj);
          fabricRef.current?.renderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}; 
