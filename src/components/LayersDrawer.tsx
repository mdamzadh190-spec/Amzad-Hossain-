import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  PenTool,
  Plus,
  Shapes,
  Trash2,
  Type,
  Unlock,
  X,
} from 'lucide-react';
import { Layer } from '../types/pixellab';

interface LayersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (layer: Layer) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayers: (newLayers: Layer[]) => void;
  onAddLayer: (type: any) => void;
}

export const LayersDrawer: React.FC<LayersDrawerProps> = ({
  isOpen,
  onClose,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayers,
  onAddLayer,
}) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  if (!isOpen) return null;

  // Move layer up in visual stack (which corresponds to higher index in layers array)
  const moveLayerIndex = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= layers.length) return;
    const updated = [...layers];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorderLayers(updated);
  };

  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case 'text':
        return <Type className="w-4 h-4 text-cyan-400" />;
      case 'shape':
        return <Shapes className="w-4 h-4 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'sticker':
        return <span className="text-xs">⭐</span>;
      case 'drawing':
        return <PenTool className="w-4 h-4 text-pink-400" />;
      default:
        return <Layers className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Visual layers: display from top (highest z-index, which is index layers.length - 1) to bottom (index 0)
  const reversedLayers = [...layers].map((layer, originalIndex) => ({
    layer,
    originalIndex,
  })).reverse();

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 bg-neutral-900 border-l border-neutral-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-12 border-b border-neutral-800 px-4 flex items-center justify-between bg-neutral-900/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Layers</span>
          <span className="text-xs text-neutral-500 font-mono">({layers.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-neutral-800/40">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
            <Layers className="w-10 h-10 mb-2 stroke-[1.5] text-neutral-600" />
            <p className="text-xs">No layers yet</p>
            <button
              onClick={() => onAddLayer('text')}
              className="mt-3 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-xs font-medium rounded-md transition-colors"
            >
              + Add Text Layer
            </button>
          </div>
        ) : (
          reversedLayers.map(({ layer, originalIndex }) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group relative flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 border-cyan-500/60 shadow-sm shadow-cyan-500/10'
                    : 'bg-neutral-900 hover:bg-neutral-800/70 border-neutral-800/80'
                }`}
              >
                {/* Type Icon */}
                <div className="w-7 h-7 rounded bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800">
                  {getLayerIcon(layer)}
                </div>

                {/* Layer Name / Text Preview */}
                <div className="flex-1 min-w-0">
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editNameText}
                      autoFocus
                      onChange={(e) => setEditNameText(e.target.value)}
                      onBlur={() => {
                        if (editNameText.trim()) {
                          onUpdateLayer({ ...layer, name: editNameText.trim() });
                        }
                        setEditingLayerId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editNameText.trim()) {
                            onUpdateLayer({ ...layer, name: editNameText.trim() });
                          }
                          setEditingLayerId(null);
                        }
                      }}
                      className="w-full bg-neutral-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingLayerId(layer.id);
                        setEditNameText(layer.name);
                      }}
                      className="truncate text-xs font-medium text-neutral-200"
                    >
                      {layer.type === 'text' ? `"${(layer as any).text}"` : layer.name}
                    </div>
                  )}
                  <div className="text-[10px] text-neutral-500 capitalize flex items-center gap-1.5">
                    <span>{layer.type}</span>
                    <span>·</span>
                    <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
                  </div>
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerIndex(originalIndex, originalIndex + 1);
                    }}
                    disabled={originalIndex === layers.length - 1}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-700/60 rounded"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerIndex(originalIndex, originalIndex - 1);
                    }}
                    disabled={originalIndex === 0}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-700/60 rounded"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Action icons: Visibility, Lock, Duplicate, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer({ ...layer, visible: !layer.visible });
                    }}
                    className={`p-1 rounded transition-colors ${
                      layer.visible
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-700/60'
                        : 'text-neutral-600 hover:text-neutral-400'
                    }`}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer({ ...layer, locked: !layer.locked });
                    }}
                    className={`p-1 rounded transition-colors ${
                      layer.locked
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/60'
                    }`}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLayer(layer.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700/60 rounded transition-colors"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/60 rounded transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (selectedLayerId) {
                const idx = layers.findIndex((l) => l.id === selectedLayerId);
                if (idx !== -1 && idx < layers.length - 1) {
                  moveLayerIndex(idx, layers.length - 1);
                }
              }
            }}
            disabled={!selectedLayerId}
            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 border border-neutral-800 rounded bg-neutral-950"
            title="Bring Selected to Top"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (selectedLayerId) {
                const idx = layers.findIndex((l) => l.id === selectedLayerId);
                if (idx > 0) {
                  moveLayerIndex(idx, 0);
                }
              }
            }}
            disabled={!selectedLayerId}
            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 border border-neutral-800 rounded bg-neutral-950"
            title="Send Selected to Bottom"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onAddLayer('text')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add Layer</span>
        </button>
      </div>
    </div>
  );
};
