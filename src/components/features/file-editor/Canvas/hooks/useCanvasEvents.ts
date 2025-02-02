import { fabric } from 'fabric';
import { useEffect } from 'react';

export const useCanvasEvents = (canvas: fabric.Canvas) => {
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = () => {
      // Handle mouse down logic here
    };

    const handleMouseMove = () => {
      // Handle mouse move logic here
    };

    const handleMouseUp = () => {
      // Handle mouse up logic here
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas]);
}; 
