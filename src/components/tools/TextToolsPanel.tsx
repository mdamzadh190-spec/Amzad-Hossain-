import React, { useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Box,
  Copy,
  FolderOpen,
  Italic,
  Layers,
  Move,
  Palette,
  RotateCcw,
  RotateCw,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Underline,
  X,
} from 'lucide-react';
import { FONTS_LIST, GRADIENT_PRESETS } from '../../data/fonts';
import { TextLayer } from '../../types/pixellab';

interface TextToolsPanelProps {
  layer: TextLayer | null;
  onUpdateLayer: (layer: TextLayer) => void;
  onAddTextLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

type TextSubTool =
  | 'edit'
  | 'position'
  | 'rel_position'
  | 'size'
  | 'color'
  | 'font'
  | 'style'
  | 'curve'
  | 'bg'
  | 'stroke'
  | 'shadow'
  | '3d'
  | 'emboss'
  | 'reflection'
  | 'rotate3d'
  | null;

export const TextToolsPanel: React.FC<TextToolsPanelProps> = ({
  layer,
  onUpdateLayer,
  onAddTextLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onBringForward,
  onSendBackward,
  canvasWidth,
  canvasHeight,
}) => {
  const [activeSubTool, setActiveSubTool] = useState<TextSubTool>(null);
  const [newTextInput, setNewTextInput] = useState('');

  const solidPalette = [
    '#FFFFFF',
    '#000000',
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#EAB308',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
  ];

  if (!layer) {
    return (
      <div className="h-56 bg-neutral-900 border-t border-neutral-800 p-4 flex flex-col items-center justify-center text-center">
        <Type className="w-8 h-8 text-cyan-400 mb-2 stroke-[1.5]" />
        <h3 className="text-sm font-bold text-white mb-1">Text Tool</h3>
        <p className="text-xs text-neutral-400 mb-3 max-w-sm">
          Add customizable typography with font choices, size adjustments, color gradients, and bold/italic/underline formatting.
        </p>
        <div className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Type your text here..."
            value={newTextInput}
            onChange={(e) => setNewTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAddTextLayer();
                setNewTextInput('');
              }
            }}
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => {
              onAddTextLayer();
              setNewTextInput('');
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Add Text</span>
          </button>
        </div>
      </div>
    );
  }

  // Update helper
  const update = (partial: Partial<TextLayer>) => {
    onUpdateLayer({ ...layer, ...partial });
  };

  const isBold = layer.fontWeight === '900' || layer.fontWeight === 'bold';
  const isItalic = layer.fontStyle === 'italic';
  const isUnderline = layer.textDecoration === 'underline';

  return (
    <div className="h-60 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      {/* Active Sub-Tool Detail Panel (when sub-tool is selected) */}
      <div className="flex-1 bg-neutral-950/70 border-b border-neutral-800/80 p-3 overflow-y-auto">
        {/* DEFAULT VIEW: PRIMARY TEXT TOOLBAR (Direct Text Input, Font, Size, Color, Bold/Italic/Underline) */}
        {!activeSubTool && (
          <div className="space-y-2.5 max-w-5xl mx-auto">
            {/* Row 1: Direct Text Input & Font Family Dropdown */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1">
                <Type className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={layer.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Enter text..."
                  className="w-full bg-transparent text-xs text-white focus:outline-none font-medium"
                />
              </div>

              {/* Font Family Selector Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-neutral-400">Font:</span>
                <select
                  value={layer.fontFamily}
                  onChange={(e) => update({ fontFamily: e.target.value })}
                  className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans cursor-pointer max-w-[160px] truncate"
                >
                  {FONTS_LIST.map((f) => (
                    <option key={f.name} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setActiveSubTool('font')}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-xs rounded border border-neutral-700 transition-colors"
                  title="Browse All Fonts"
                >
                  Browse
                </button>
              </div>

              {/* Alignment Buttons */}
              <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-700 p-0.5 shrink-0">
                <button
                  onClick={() => update({ align: 'left' })}
                  className={`p-1 rounded ${
                    layer.align === 'left' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update({ align: 'center' })}
                  className={`p-1 rounded ${
                    layer.align === 'center' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update({ align: 'right' })}
                  className={`p-1 rounded ${
                    layer.align === 'right' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Row 2: Font Size Slider + Number, Text Color Swatches, Bold, Italic, Underline */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Font Size */}
              <div className="flex items-center gap-2 min-w-[200px] flex-1">
                <span className="text-[11px] text-neutral-400 shrink-0">Size:</span>
                <input
                  type="range"
                  min="14"
                  max="200"
                  value={layer.fontSize}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
                <input
                  type="number"
                  min="10"
                  max="400"
                  value={layer.fontSize}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                  className="w-14 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-xs text-cyan-400 font-mono text-center focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">px</span>
              </div>

              {/* Formatting: Bold, Italic, Underline */}
              <div className="flex items-center gap-1 bg-neutral-900 rounded-lg border border-neutral-700 p-0.5 shrink-0">
                <button
                  onClick={() => update({ fontWeight: isBold ? '400' : '900' })}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    isBold
                      ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Bold (Formatting)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update({ fontStyle: isItalic ? 'normal' : 'italic' })}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    isItalic
                      ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Italic (Formatting)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update({ textDecoration: isUnderline ? 'none' : 'underline' })}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    isUnderline
                      ? 'bg-cyan-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Underline (Formatting)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Color Swatches & Native Color Picker */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-neutral-400">Color:</span>
                <div className="flex items-center gap-1">
                  {solidPalette.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ colorType: 'solid', color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        layer.color === c && layer.colorType === 'solid'
                          ? 'border-cyan-400 scale-125 shadow-sm'
                          : 'border-neutral-700 hover:scale-110'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={layer.color}
                    onChange={(e) => update({ colorType: 'solid', color: e.target.value })}
                    className="w-6 h-6 rounded-full bg-transparent cursor-pointer"
                    title="Custom Color Picker"
                  />
                  <button
                    onClick={() => setActiveSubTool('color')}
                    className="ml-1 px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] rounded border border-neutral-700"
                  >
                    Gradients
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TOOL: EDIT TEXT MODAL / EXPANDED */}
        {activeSubTool === 'edit' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Edit Text Content</span>
              <button
                onClick={() => setActiveSubTool(null)}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={layer.text}
              onChange={(e) => update({ text: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
              placeholder="Enter text..."
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={() => setActiveSubTool(null)}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors"
              >
                Apply Text
              </button>
            </div>
          </div>
        )}

        {/* SUB-TOOL: FONT SELECTION */}
        {activeSubTool === 'font' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Select Typography Font</span>
              <button
                onClick={() => setActiveSubTool(null)}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONTS_LIST.map((f) => (
                <button
                  key={f.name}
                  onClick={() => {
                    update({ fontFamily: f.family });
                    setActiveSubTool(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    layer.fontFamily === f.family
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-[10px] text-neutral-500 truncate">{f.name}</div>
                  <div className="text-base truncate mt-0.5" style={{ fontFamily: f.family }}>
                    {f.previewText || 'PixelLab'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TOOL: COLOR & GRADIENTS */}
        {activeSubTool === 'color' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update({ colorType: 'solid' })}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    layer.colorType === 'solid'
                      ? 'bg-cyan-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  onClick={() =>
                    update({
                      colorType: 'gradient',
                      gradient: layer.gradient || {
                        type: 'linear',
                        angle: 90,
                        stops: GRADIENT_PRESETS[0].stops,
                      },
                    })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    layer.colorType === 'gradient'
                      ? 'bg-cyan-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Gradients
                </button>
              </div>
              <button
                onClick={() => setActiveSubTool(null)}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>

            {layer.colorType === 'solid' ? (
              <div className="flex items-center gap-2 flex-wrap">
                {solidPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      layer.color === c ? 'border-cyan-400 scale-110 shadow-lg' : 'border-neutral-700'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={layer.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="w-7 h-7 rounded-full bg-transparent cursor-pointer border-0 p-0"
                  title="Custom Color Picker"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {GRADIENT_PRESETS.map((gp) => (
                    <button
                      key={gp.name}
                      onClick={() =>
                        update({
                          gradient: {
                            type: 'linear',
                            angle: layer.gradient?.angle || 90,
                            stops: gp.stops,
                          },
                        })
                      }
                      style={{
                        background: `linear-gradient(90deg, ${gp.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`,
                      }}
                      className="px-3 py-1.5 rounded-lg border border-neutral-700 text-[10px] font-bold text-white shadow hover:scale-105 transition-transform shrink-0"
                    >
                      {gp.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-neutral-400">Angle:</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={layer.gradient?.angle || 90}
                    onChange={(e) =>
                      update({
                        gradient: {
                          type: layer.gradient?.type || 'linear',
                          angle: Number(e.target.value),
                          stops: layer.gradient?.stops || GRADIENT_PRESETS[0].stops,
                        },
                      })
                    }
                    className="flex-1 accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 w-8">{layer.gradient?.angle || 90}°</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TOOL: 3D TEXT EXTRUSION */}
        {activeSubTool === '3d' && (
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">3D Extrusion Effect</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    update({
                      text3D: {
                        enabled: !layer.text3D?.enabled,
                        depth: layer.text3D?.depth || 20,
                        color: layer.text3D?.color || '#333333',
                        darken: layer.text3D?.darken || 40,
                        direction: layer.text3D?.direction || 270,
                        oblique: false,
                        simulateLighting: true,
                      },
                    })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    layer.text3D?.enabled ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {layer.text3D?.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button onClick={() => setActiveSubTool(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {layer.text3D?.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Depth:</span>
                    <span className="font-mono text-cyan-400">{layer.text3D.depth}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={layer.text3D.depth}
                    onChange={(e) =>
                      update({
                        text3D: { ...layer.text3D!, depth: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Direction Angle:</span>
                    <span className="font-mono text-cyan-400">{layer.text3D.direction}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={layer.text3D.direction}
                    onChange={(e) =>
                      update({
                        text3D: { ...layer.text3D!, direction: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Darken Shading:</span>
                    <span className="font-mono text-cyan-400">{layer.text3D.darken}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={layer.text3D.darken}
                    onChange={(e) =>
                      update({
                        text3D: { ...layer.text3D!, darken: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <span className="text-neutral-400 block mb-1">Extrusion Base Color:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layer.text3D.color || '#333333'}
                      onChange={(e) =>
                        update({
                          text3D: { ...layer.text3D!, color: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-xs text-neutral-300">{layer.text3D.color}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TOOL: CURVE / ARC */}
        {activeSubTool === 'curve' && (
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Circular Arc Bend</span>
              <button onClick={() => setActiveSubTool(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={layer.curve}
              onChange={(e) => update({ curve: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>-100% (Arch Down)</span>
              <button onClick={() => update({ curve: 0 })} className="text-cyan-400 hover:underline">
                Reset (0%)
              </button>
              <span>+100% (Arch Up)</span>
            </div>
          </div>
        )}

        {/* SUB-TOOL: STROKE */}
        {activeSubTool === 'stroke' && (
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Outer Border Stroke</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    update({
                      stroke: {
                        enabled: !layer.stroke?.enabled,
                        color: layer.stroke?.color || '#000000',
                        width: layer.stroke?.width || 6,
                      },
                    })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    layer.stroke?.enabled ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {layer.stroke?.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button onClick={() => setActiveSubTool(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {layer.stroke?.enabled && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Stroke Width</span>
                  <span className="font-mono text-cyan-400">{layer.stroke.width}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={layer.stroke.width}
                  onChange={(e) =>
                    update({
                      stroke: { ...layer.stroke!, width: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Stroke Color:</span>
                  <input
                    type="color"
                    value={layer.stroke.color}
                    onChange={(e) =>
                      update({
                        stroke: { ...layer.stroke!, color: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <div className="flex gap-1.5 ml-2">
                    {['#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          update({
                            stroke: { ...layer.stroke!, color: c },
                          })
                        }
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-full border border-neutral-600"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TOOL: SHADOW */}
        {activeSubTool === 'shadow' && (
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Drop Shadow & Glow</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    update({
                      shadow: {
                        enabled: !layer.shadow?.enabled,
                        color: layer.shadow?.color || '#000000',
                        blur: layer.shadow?.blur || 20,
                        offsetX: layer.shadow?.offsetX || 0,
                        offsetY: layer.shadow?.offsetY || 8,
                        opacity: layer.shadow?.opacity || 0.8,
                      },
                    })
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    layer.shadow?.enabled ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {layer.shadow?.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button onClick={() => setActiveSubTool(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {layer.shadow?.enabled && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Blur Radius:</span>
                    <span className="font-mono text-cyan-400">{layer.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={layer.shadow.blur}
                    onChange={(e) =>
                      update({
                        shadow: { ...layer.shadow!, blur: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Offset Y:</span>
                    <span className="font-mono text-cyan-400">{layer.shadow.offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={layer.shadow.offsetY}
                    onChange={(e) =>
                      update({
                        shadow: { ...layer.shadow!, offsetY: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <span className="text-neutral-400">Glow Color:</span>
                  <input
                    type="color"
                    value={layer.shadow.color}
                    onChange={(e) =>
                      update({
                        shadow: { ...layer.shadow!, color: e.target.value },
                      })
                    }
                    className="w-7 h-7 rounded bg-transparent cursor-pointer"
                  />
                  <div className="flex gap-1.5">
                    {['#000000', '#EF4444', '#06B6D4', '#8B5CF6', '#F59E0B'].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          update({
                            shadow: { ...layer.shadow!, color: c },
                          })
                        }
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-full border border-neutral-600"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Action Bar (PixelLab Signature Tools Strip) */}
      <div className="h-16 flex items-center gap-1 px-2 overflow-x-auto bg-neutral-900 scrollbar-none">
        <button
          onClick={() => setActiveSubTool(activeSubTool === 'edit' ? null : 'edit')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'edit'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Edit Text"
        >
          <Type className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Edit Text</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === 'font' ? null : 'font')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'font'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Font Selector"
        >
          <span className="font-serif font-bold text-sm mb-0.5">AB</span>
          <span className="text-[10px]">Font</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === 'color' ? null : 'color')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'color'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Color & Gradient"
        >
          <Palette className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Color</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === 'curve' ? null : 'curve')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'curve'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Curve Arc Text"
        >
          <RotateCw className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Curve Arc</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === 'stroke' ? null : 'stroke')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'stroke'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Stroke Outline"
        >
          <span className="w-4 h-4 rounded-full border-2 border-current mb-1" />
          <span className="text-[10px]">Stroke</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === 'shadow' ? null : 'shadow')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === 'shadow'
              ? 'text-cyan-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Shadow & Glow"
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Shadow</span>
        </button>

        <button
          onClick={() => setActiveSubTool(activeSubTool === '3d' ? null : '3d')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs transition-colors ${
            activeSubTool === '3d'
              ? 'text-cyan-400 bg-neutral-800 font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="3D Text Extrusion"
        >
          <Box className="w-4 h-4 mb-1" />
          <span className="text-[10px]">3D Extrude</span>
        </button>

        <div className="h-6 w-px bg-neutral-800 mx-1" />

        <button
          onClick={() => onDuplicateLayer(layer.id)}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
          title="Duplicate Text"
        >
          <Copy className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Duplicate</span>
        </button>

        <button
          onClick={() => onDeleteLayer(layer.id)}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 rounded-md text-xs text-rose-400 hover:text-rose-300 hover:bg-neutral-800/60 transition-colors"
          title="Delete Text"
        >
          <Trash2 className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Delete</span>
        </button>
      </div>
    </div>
  );
};
