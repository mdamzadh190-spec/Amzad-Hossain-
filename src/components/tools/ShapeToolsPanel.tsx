import React, { useState } from 'react';
import {
  Eraser,
  Flame,
  Palette,
  PenTool,
  Plus,
  Shapes,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { STICKER_LIBRARY } from '../../data/stickers';
import { DrawStroke, DrawingLayer, ImageLayer, Layer, ShapeKind, ShapeLayer } from '../../types/pixellab';

interface ShapeToolsPanelProps {
  selectedLayer: Layer | null;
  onUpdateLayer: (layer: Layer) => void;
  onAddShape: (kind: ShapeKind) => void;
  onAddSticker: (sticker: (typeof STICKER_LIBRARY)[0]) => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  drawingBrush: { color: string; size: number; neon: boolean; blur: number };
  onUpdateDrawingBrush: (brush: { color: string; size: number; neon: boolean; blur: number }) => void;
  onClearDrawing: () => void;
}

export const ShapeToolsPanel: React.FC<ShapeToolsPanelProps> = ({
  selectedLayer,
  onUpdateLayer,
  onAddShape,
  onAddSticker,
  isDrawingMode,
  onToggleDrawingMode,
  drawingBrush,
  onUpdateDrawingBrush,
  onClearDrawing,
}) => {
  const [activeTab, setActiveTab] = useState<'shapes' | 'stickers' | 'draw' | 'style'>('shapes');

  const shapeKinds: { kind: ShapeKind; label: string; icon: string }[] = [
    { kind: 'rectangle', label: 'Box', icon: '■' },
    { kind: 'circle', label: 'Circle', icon: '●' },
    { kind: 'star', label: 'Star', icon: '★' },
    { kind: 'triangle', label: 'Triangle', icon: '▲' },
    { kind: 'heart', label: 'Heart', icon: '♥' },
    { kind: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { kind: 'arrow', label: 'Arrow', icon: '➜' },
    { kind: 'shield', label: 'Shield', icon: '🛡️' },
    { kind: 'speech_bubble', label: 'Bubble', icon: '💬' },
    { kind: 'ribbon', label: 'Ribbon', icon: '🎗️' },
  ];

  const colors = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#FFFFFF',
    '#000000',
  ];

  const isShape = selectedLayer?.type === 'shape';
  const shapeLayer = isShape ? (selectedLayer as ShapeLayer) : null;

  return (
    <div className="h-56 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      {/* Top Category Tabs */}
      <div className="h-10 border-b border-neutral-800/80 px-3 flex items-center gap-2 bg-neutral-950/60">
        <button
          onClick={() => setActiveTab('shapes')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'shapes'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Add Shapes
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'stickers'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Sticker Library
        </button>
        <button
          onClick={() => setActiveTab('draw')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'draw'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Freehand Pen
        </button>
        {isShape && (
          <button
            onClick={() => setActiveTab('style')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'style'
                ? 'bg-cyan-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Shape Properties
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Tab 1: Shapes Picker */}
        {activeTab === 'shapes' && (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {shapeKinds.map((s) => (
              <button
                key={s.kind}
                onClick={() => onAddShape(s.kind)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 hover:border-cyan-500/50 transition-all group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform mb-1 text-cyan-400">
                  {s.icon}
                </span>
                <span className="text-[10px] text-neutral-300 capitalize">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Stickers Library */}
        {activeTab === 'stickers' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STICKER_LIBRARY.map((stk) => (
              <button
                key={stk.id}
                onClick={() => onAddSticker(stk)}
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 hover:border-cyan-500 transition-all text-left"
              >
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: stk.svg }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{stk.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{stk.category}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Freehand Drawing Pen */}
        {activeTab === 'draw' && (
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleDrawingMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDrawingMode
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isDrawingMode ? 'Drawing Active (Click Canvas)' : 'Start Drawing'}</span>
                </button>
                <button
                  onClick={onClearDrawing}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Strokes</span>
                </button>
              </div>

              {/* Neon Glow Toggle */}
              <button
                onClick={() =>
                  onUpdateDrawingBrush({
                    ...drawingBrush,
                    neon: !drawingBrush.neon,
                  })
                }
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                  drawingBrush.neon
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-sm shadow-cyan-500/30'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Neon Glow</span>
              </button>
            </div>

            {/* Brush Size & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Brush Stroke Size:</span>
                  <span className="font-mono text-cyan-400">{drawingBrush.size}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={drawingBrush.size}
                  onChange={(e) =>
                    onUpdateDrawingBrush({
                      ...drawingBrush,
                      size: Number(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Color:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateDrawingBrush({ ...drawingBrush, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        drawingBrush.color === c ? 'scale-125 border-cyan-400' : 'border-neutral-700'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={drawingBrush.color}
                    onChange={(e) =>
                      onUpdateDrawingBrush({ ...drawingBrush, color: e.target.value })
                    }
                    className="w-6 h-6 rounded bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Shape Styling (Fill, Stroke, Radius, Blur) */}
        {activeTab === 'style' && shapeLayer && (
          <div className="space-y-3 max-w-xl mx-auto text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fill Color */}
              <div>
                <span className="text-neutral-400 block mb-1">Fill Color:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={shapeLayer.fillColor === 'transparent' ? '#ffffff' : shapeLayer.fillColor}
                    onChange={(e) => onUpdateLayer({ ...shapeLayer, fillColor: e.target.value })}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      onUpdateLayer({
                        ...shapeLayer,
                        fillColor: shapeLayer.fillColor === 'transparent' ? '#3B82F6' : 'transparent',
                      })
                    }
                    className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-[10px]"
                  >
                    {shapeLayer.fillColor === 'transparent' ? 'Solid' : 'Transparent'}
                  </button>
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Stroke Width:</span>
                  <span className="font-mono text-cyan-400">{shapeLayer.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={shapeLayer.strokeWidth}
                  onChange={(e) =>
                    onUpdateLayer({ ...shapeLayer, strokeWidth: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Corner Radius:</span>
                  <span className="font-mono text-cyan-400">{shapeLayer.cornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shapeLayer.cornerRadius}
                  onChange={(e) =>
                    onUpdateLayer({ ...shapeLayer, cornerRadius: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
