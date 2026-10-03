import React from 'react';
import { RotateCcw, Sliders, Sparkles, Sun, Wand2 } from 'lucide-react';
import { CanvasConfig, CanvasEffects } from '../../types/pixellab';

interface EffectsToolsPanelProps {
  canvasConfig: CanvasConfig;
  onUpdateCanvasConfig: (config: CanvasConfig) => void;
}

export const EffectsToolsPanel: React.FC<EffectsToolsPanelProps> = ({
  canvasConfig,
  onUpdateCanvasConfig,
}) => {
  const { effects } = canvasConfig;

  const updateEffects = (partial: Partial<CanvasEffects>) => {
    onUpdateCanvasConfig({
      ...canvasConfig,
      effects: {
        ...canvasConfig.effects,
        ...partial,
      },
    });
  };

  const handleResetEffects = () => {
    updateEffects({
      vignette: 0,
      vignetteColor: '#000000',
      noise: 0,
      stripes: 0,
      brightness: 0,
      contrast: 0,
      hue: 0,
      saturation: 0,
    });
  };

  return (
    <div className="h-56 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      {/* Header with Reset */}
      <div className="h-10 border-b border-neutral-800/80 px-4 flex items-center justify-between bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Post-Processing & FX Studio</span>
        </div>
        <button
          onClick={handleResetEffects}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All FX</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs max-w-4xl mx-auto">
          {/* Vignette */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Vignette Darkness:</span>
              <span className="font-mono text-cyan-400">{effects.vignette}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={effects.vignette}
              onChange={(e) => updateEffects({ vignette: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Noise */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Film Grain / Noise:</span>
              <span className="font-mono text-cyan-400">{effects.noise}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={effects.noise}
              onChange={(e) => updateEffects({ noise: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Stripes */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Scanlines / Stripes:</span>
              <span className="font-mono text-cyan-400">{effects.stripes}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={effects.stripes}
              onChange={(e) => updateEffects({ stripes: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Brightness */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Brightness:</span>
              <span className="font-mono text-cyan-400">{effects.brightness}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={effects.brightness}
              onChange={(e) => updateEffects({ brightness: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Contrast:</span>
              <span className="font-mono text-cyan-400">{effects.contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={effects.contrast}
              onChange={(e) => updateEffects({ contrast: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-neutral-300 mb-1">
              <span>Saturation:</span>
              <span className="font-mono text-cyan-400">{effects.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={effects.saturation}
              onChange={(e) => updateEffects({ saturation: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
