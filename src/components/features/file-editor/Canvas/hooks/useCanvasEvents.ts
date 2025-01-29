import { useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { IEvent, MouseEvent, SelectionEvent } from '../../types';

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  isDrawing: boolean;
  selectedShape: string | null;
  onObjectAdded?: (e: fabric.IEvent) => void;
  onSelectionChanged?: (e: fabric.IEvent<Event>) => void;
  onTextSelected?: (e: fabric.IEvent<Event>) => void;
}

export const useCanvasEvents = ({
  canvas,
  isDrawing,
  selectedShape,
  onObjectAdded,
  onSelectionChanged,
  onTextSelected,
}: UseCanvasEventsProps) => {
  const handleMouseDown = useCallback((e: fabric.IEvent<Event>) => {
    if (!canvas || !isDrawing || !selectedShape) return;
    const pointer = canvas.getPointer(e.e);
    // Handle mouse down logic
  }, [canvas, isDrawing, selectedShape]);

  const handleMouseMove = useCallback((e: fabric.IEvent<Event>) => {
    if (!canvas || !isDrawing) return;
    const pointer = canvas.getPointer(e.e);
    // Handle mouse move logic
  }, [canvas, isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (!canvas) return;
    // Handle mouse up logic
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const safeObjectAdded = (e: fabric.IEvent) => {
      if (onObjectAdded) onObjectAdded(e);
    };

    const safeSelectionChanged = (e: fabric.IEvent<Event>) => {
      if (onSelectionChanged) onSelectionChanged(e);
    };

    const safeTextSelected = (e: fabric.IEvent<Event>) => {
      if (onTextSelected) onTextSelected(e);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('object:added', safeObjectAdded as any);
    canvas.on('selection:created', safeSelectionChanged as any);
    canvas.on('selection:updated', safeSelectionChanged as any);
    canvas.on('selection:cleared', safeSelectionChanged as any);
    canvas.on('text:selection:changed', safeTextSelected as any);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('object:added', safeObjectAdded as any);
      canvas.off('selection:created', safeSelectionChanged as any);
      canvas.off('selection:updated', safeSelectionChanged as any);
      canvas.off('selection:cleared', safeSelectionChanged as any);
      canvas.off('text:selection:changed', safeTextSelected as any);
    };
  }, [
    canvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    onObjectAdded,
    onSelectionChanged,
    onTextSelected,
  ]);
}; 
