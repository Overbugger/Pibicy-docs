import { fabric } from "fabric";
import { ReactNode } from "react";

export interface FileEditorProps {
  file: File;
}

export type ShapeType =
  | "line"
  | "circle"
  | "rectangle"
  | "triangle"
  | "ellipse"
  | "text"
  | null;

export interface ShapeOption {
  type: ShapeType;
  icon: ReactNode;
  label: string;
}

export interface IEvent<T extends Event = Event> {
  e: T;
  target?: fabric.Object;
  subTargets?: fabric.Object[];
  button?: number;
  isClick?: boolean;
  pointer?: fabric.Point;
  transform?: { corner: string };
}

export interface SelectionEvent extends IEvent {
  target: fabric.Object;
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
}

export interface MouseEvent extends IEvent {
  pointer: fabric.Point;
  absolutePointer: fabric.Point;
  button: number;
  isClick: boolean;
}

export interface CanvasRef {
  canvas: fabric.Canvas | null;
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  isBold: boolean;
  isItalic: boolean;
  isStrikethrough: boolean;
}

export interface ShapeStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
export const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
]; 