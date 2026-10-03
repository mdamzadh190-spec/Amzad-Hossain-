import React, { useState } from 'react';
import {
  Check,
  Crop,
  Grid,
  Maximize2,
  Palette,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { CANVAS_SIZE_PRESETS, GRADIENT_PRESETS } from '../../data/fonts';
import { CanvasConfig } from '../../types/pixellab';

interface CanvasToolsPanelProps {
  canvasConfig: CanvasConfig;
  onUpdateCanvasConfig: (config: CanvasConfig) => void;
  onOpenImageSizeModal: () => void;
}

export const CanvasToolsPanel: React.FC<CanvasToolsPanelProps> = ({
  canvasConfig,
  onUpdateCanvasConfig,
  onOpenImageSizeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'bg' | 'size' | 'gradient'>('bg');

  const solidColors = [
    '#000000',
    '#0F172A',
    '#18181B',
    '#1E1B4B',
    '#311042',
    '#14532D',
    '#7F1D1D',
    '#FFFFFF',
    '#F8FAFC',
    '#E2E8F0',
  ];

  return (
    <div className="h-56 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      {/* Category Tabs */}
      <div className="h-10 border-b border-neutral-800/80 px-3 flex items-center gap-2 bg-neutral-950/60">
        <button
          onClick={() => setActiveTab('bg')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'bg'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Background Style
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'gradient'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Gradient Presets
        </button>
        <button
          onClick={() => setActiveTab('size')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'size'
              ? 'bg-cyan-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Canvas Dimensions
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'bg' && (
          <div className="space-y-3 max-w-xl mx-auto">
            {/* Quick Mode Switches: Transparent vs Solid vs Gradient */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateCanvasConfig({
                    ...canvasConfig,
                    bgType: 'transparent',
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  canvasConfig.bgType === 'transparent'
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                <div className="w-3.5 h-3.5 border border-current grid grid-cols-2 grid-rows-2">
                  <div className="bg-neutral-600" />
                  <div className="bg-neutral-300" />
                  <div className="bg-neutral-300" />
                  <div className="bg-neutral-600" />
                </div>
                <span>Transparent (PNG)</span>
              </button>

              <button
                onClick={() =>
                  onUpdateCanvasConfig({
                    ...canvasConfig,
                    bgType: 'color',
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  canvasConfig.bgType === 'color'
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Solid Color</span>
              </button>

              <button
                onClick={() =>
                  onUpdateCanvasConfig({
                    ...canvasConfig,
                    bgType: 'gradient',
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  canvasConfig.bgType === 'gradient'
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gradient Mesh</span>
              </button>
            </div>

            {/* Solid color selection */}
            {canvasConfig.bgType === 'color' && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-xs text-neutral-400 mr-1">Palette:</span>
                {solidColors.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      onUpdateCanvasConfig({
                        ...canvasConfig,
                        bgColor: c,
                      })
                    }
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      canvasConfig.bgColor === c
                        ? 'border-cyan-400 scale-110 shadow-lg'
                        : 'border-neutral-700'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={canvasConfig.bgColor}
                  onChange={(e) =>
                    onUpdateCanvasConfig({
                      ...canvasConfig,
                      bgColor: e.target.value,
                    })
                  }
                  className="w-7 h-7 rounded-full bg-transparent cursor-pointer ml-1"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Gradient Presets */}
        {activeTab === 'gradient' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((gp) => (
                <button
                  key={gp.name}
                  onClick={() =>
                    onUpdateCanvasConfig({
                      ...canvasConfig,
                      bgType: 'gradient',
                      bgGradient: {
                        type: 'linear',
                        angle: 135,
                        stops: gp.stops,
                      },
                    })
                  }
                  style={{
                    background: `linear-gradient(135deg, ${gp.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`,
                  }}
                  className="h-12 rounded-lg border border-neutral-700/60 p-2 flex items-end justify-start shadow hover:scale-105 transition-transform"
                >
                  <span className="text-[10px] font-bold text-white drop-shadow bg-black/40 px-1 rounded">
                    {gp.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Canvas Dimensions */}
        {activeTab === 'size' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-300">
                Current Size:{' '}
                <strong className="text-cyan-400 font-mono">
                  {canvasConfig.width} × {canvasConfig.height}
                </strong>{' '}
                <span className="text-neutral-500">({canvasConfig.presetName})</span>
              </div>
              <button
                onClick={onOpenImageSizeModal}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-md transition-colors"
              >
                Custom Dimensions
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CANVAS_SIZE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() =>
                    onUpdateCanvasConfig({
                      ...canvasConfig,
                      width: p.width,
                      height: p.height,
                      presetName: `${p.name} (${p.width}x${p.height})`,
                    })
                  }
                  className={`p-2 rounded-lg border text-left transition-all ${
                    canvasConfig.width === p.width && canvasConfig.height === p.height
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                      : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {p.width} × {p.height} · {p.ratio}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
