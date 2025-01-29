import { useCallback } from 'react';
import { fabric } from 'fabric';
import { ShapeType } from '../../types';

interface UseShapeCreationProps {
  canvas: fabric.Canvas | null;
}

export const useShapeCreation = ({ canvas }: UseShapeCreationProps) => {
  const createShape = useCallback((shapeType: ShapeType, pointer: { x: number; y: number }) => {
    if (!canvas || !shapeType) return;

    let shape: fabric.Object;

    switch (shapeType) {
      case 'line':
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;

      case 'circle':
        shape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;

      case 'rectangle':
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;

      case 'triangle':
        shape = new fabric.Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;

      case 'text':
        shape = new fabric.Textbox('', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: '#000000',
          width: 200,
        });
        break;

      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    return shape;
  }, [canvas]);

  const updateShape = useCallback((shape: fabric.Object, pointer: { x: number; y: number }) => {
    if (!canvas || !shape) return;

    const origX = shape.left;
    const origY = shape.top;

    if (!origX || !origY) return;

    if (shape instanceof fabric.Line) {
      shape.set({ x2: pointer.x, y2: pointer.y });
    } else {
      const width = Math.abs(pointer.x - origX);
      const height = Math.abs(pointer.y - origY);

      if (shape instanceof fabric.Circle) {
        const radius = Math.sqrt(width * width + height * height) / 2;
        shape.set({ radius });
      } else {
        shape.set({ width, height });
      }
    }

    canvas.renderAll();
  }, [canvas]);

  return {
    createShape,
    updateShape,
  };
}; 