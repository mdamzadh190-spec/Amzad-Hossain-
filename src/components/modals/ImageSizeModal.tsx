import React, { useState } from 'react';
import { Check, Lock, Unlock, X } from 'lucide-react';
import { CANVAS_SIZE_PRESETS } from '../../data/fonts';
import { CanvasConfig } from '../../types/pixellab';

interface ImageSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasConfig: CanvasConfig;
  onApplySize: (width: number, height: number, presetName: string) => void;
}

export const ImageSizeModal: React.FC<ImageSizeModalProps> = ({
  isOpen,
  onClose,
  canvasConfig,
  onApplySize,
}) => {
  const [width, setWidth] = useState(canvasConfig.width);
  const [height, setHeight] = useState(canvasConfig.height);
  const [lockAspect, setLockAspect] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(canvasConfig.width / canvasConfig.height);
  const [selectedPreset, setSelectedPreset] = useState(canvasConfig.presetName);

  if (!isOpen) return null;

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockAspect) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockAspect) {
      setWidth(Math.round(h * aspectRatio));
    }
  };

  const handleSelectPreset = (preset: (typeof CANVAS_SIZE_PRESETS)[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setAspectRatio(preset.width / preset.height);
    setSelectedPreset(`${preset.name} (${preset.width}x${preset.height})`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (width > 50 && height > 50) {
      onApplySize(width, height, selectedPreset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Image Size & Aspect Ratio</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Popular Presets
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {CANVAS_SIZE_PRESETS.map((p) => {
                const isSelected = width === p.width && height === p.height;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="text-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {p.width} × {p.height}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Width & Height Inputs */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 block mb-1">Width (px)</label>
              <input
                type="number"
                min="100"
                max="5000"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setLockAspect(!lockAspect);
                setAspectRatio(width / height);
              }}
              className={`p-2.5 rounded-lg border mt-5 transition-colors ${
                lockAspect
                  ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
              title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
            >
              {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <div className="flex-1">
              <label className="text-xs text-neutral-400 block mb-1">Height (px)</label>
              <input
                type="number"
                min="100"
                max="5000"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors"
            >
              Apply Size
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
