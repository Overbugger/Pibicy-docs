import { MousePointer, Circle, Square, Triangle, Type, Minus, Shapes, Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ShapeType, TextStyle, ShapeStyle } from '../types';

interface ToolbarProps {
  selectedShape: ShapeType;
  isSelectionMode: boolean;
  isTextMode: boolean;
  showShapeDropdown: boolean;
  textStyle: TextStyle;
  shapeStyle: ShapeStyle;
  onShapeSelect: (shape: ShapeType) => void;
  onSelectionModeToggle: () => void;
  onTextModeToggle: () => void;
  onShapeDropdownToggle: () => void;
  onTextStyleChange: (updates: Partial<TextStyle>) => void;
  onShapeStyleChange: (updates: Partial<ShapeStyle>) => void;
  fontSizes: number[];
  fontFamilies: string[];
}

const shapeOptions = [
  { type: 'line' as ShapeType, icon: <Minus className="w-4 h-4" />, label: 'Line' },
  { type: 'circle' as ShapeType, icon: <Circle className="w-4 h-4" />, label: 'Circle' },
  { type: 'rectangle' as ShapeType, icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
  { type: 'triangle' as ShapeType, icon: <Triangle className="w-4 h-4" />, label: 'Triangle' },
];

export const Toolbar = ({
  selectedShape,
  isSelectionMode,
  isTextMode,
  showShapeDropdown,
  textStyle,
  shapeStyle,
  onShapeSelect,
  onSelectionModeToggle,
  onTextModeToggle,
  onShapeDropdownToggle,
  onTextStyleChange,
  onShapeStyleChange,
  fontSizes,
  fontFamilies,
}: ToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg w-64">
      {/* Main Tools */}
      <div className="flex gap-2">
        <button
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            isSelectionMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          onClick={onSelectionModeToggle}
          title="Select"
        >
          <MousePointer className="w-5 h-5" />
        </button>

        <button
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            showShapeDropdown ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          onClick={onShapeDropdownToggle}
          title="Shapes"
        >
          <Shapes className="w-5 h-5" />
        </button>

        <button
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            isTextMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          onClick={onTextModeToggle}
          title="Text"
        >
          <Type className="w-5 h-5" />
        </button>
      </div>

      {/* Shape Options */}
      {showShapeDropdown && (
        <div className="grid grid-cols-2 gap-2">
          {shapeOptions.map((option) => (
            <button
              key={option.type}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                selectedShape === option.type ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onShapeSelect(option.type)}
              title={option.label}
            >
              {option.icon}
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Text Controls */}
      {isTextMode && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Font Family</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={textStyle.fontFamily}
              onChange={(e) => onTextStyleChange({ fontFamily: e.target.value })}
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Font Size</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={textStyle.fontSize}
              onChange={(e) => onTextStyleChange({ fontSize: Number(e.target.value) })}
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className={`p-2 rounded-lg ${textStyle.isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => onTextStyleChange({ isBold: !textStyle.isBold })}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-lg ${textStyle.isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => onTextStyleChange({ isItalic: !textStyle.isItalic })}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-lg ${
                textStyle.isStrikethrough ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTextStyleChange({ isStrikethrough: !textStyle.isStrikethrough })}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              className={`p-2 rounded-lg ${
                textStyle.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTextStyleChange({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-lg ${
                textStyle.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTextStyleChange({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-lg ${
                textStyle.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTextStyleChange({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Shape Style Controls */}
      {(selectedShape || isSelectionMode) && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Stroke Color</label>
            <input
              type="color"
              value={shapeStyle.strokeColor}
              onChange={(e) => onShapeStyleChange({ strokeColor: e.target.value })}
              className="w-full h-8 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fill Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={shapeStyle.fillColor === 'transparent' ? '#ffffff' : shapeStyle.fillColor}
                onChange={(e) => onShapeStyleChange({ fillColor: e.target.value })}
                className="flex-1 h-8 rounded-lg"
              />
              <button
                className={`px-2 rounded-lg ${
                  shapeStyle.fillColor === 'transparent' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() =>
                  onShapeStyleChange({
                    fillColor: shapeStyle.fillColor === 'transparent' ? '#ffffff' : 'transparent',
                  })
                }
              >
                None
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Stroke Width</label>
            <input
              type="range"
              min="1"
              max="20"
              value={shapeStyle.strokeWidth}
              onChange={(e) => onShapeStyleChange({ strokeWidth: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-600">{shapeStyle.strokeWidth}px</div>
          </div>
        </div>
      )}
    </div>
  );
}; 