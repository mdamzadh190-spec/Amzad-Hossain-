import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileImage,
  Sparkles,
  X,
} from 'lucide-react';
import { CanvasConfig, Layer } from '../../types/pixellab';
import { exportCanvasToImage } from '../../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasConfig: CanvasConfig;
  layers: Layer[];
  onSaveToDrive?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasConfig,
  layers,
  onSaveToDrive,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Quality Presets
  const qualityOptions = [
    { label: 'Standard (1x)', scale: 1, desc: `${canvasConfig.width} × ${canvasConfig.height}` },
    { label: 'High (1.5x)', scale: 1.5, desc: `${Math.round(canvasConfig.width * 1.5)} × ${Math.round(canvasConfig.height * 1.5)}` },
    { label: 'Very High (2x)', scale: 2, desc: `${canvasConfig.width * 2} × ${canvasConfig.height * 2}` },
    { label: 'Ultra HD (4x)', scale: 4, desc: `${canvasConfig.width * 4} × ${canvasConfig.height * 4}` },
  ];

  // Generate preview
  useEffect(() => {
    if (!isOpen) return;
    setIsExporting(true);
    exportCanvasToImage(canvasConfig, layers, scale, format, 0.95)
      .then((url) => {
        setPreviewUrl(url);
        setIsExporting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsExporting(false);
      });
  }, [isOpen, canvasConfig, layers, scale, format]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const ext = format === 'image/png' ? 'png' : 'jpg';
    a.download = `PixelLab_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyToClipboard = async () => {
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const exportW = Math.round(canvasConfig.width * scale);
  const exportH = Math.round(canvasConfig.height * scale);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Save / Export Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Live Preview Frame */}
          <div className="relative aspect-video w-full rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden">
            {isExporting ? (
              <div className="flex items-center gap-2 text-cyan-400 text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Rendering High-Res Preview...</span>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Export preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : null}
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300">
              {exportW} × {exportH} px
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Image Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('image/png')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  format === 'image/png'
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                PNG (Supports Transparency)
              </button>
              <button
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  format === 'image/jpeg'
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                JPEG (Standard Web Format)
              </button>
            </div>
          </div>

          {/* Quality / Resolution Scale */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Resolution Quality
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {qualityOptions.map((opt) => (
                <button
                  key={opt.scale}
                  onClick={() => setScale(opt.scale)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    scale === opt.scale
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div className="text-xs truncate">{opt.label}</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {onSaveToDrive && (
              <button
                onClick={() => {
                  onClose();
                  onSaveToDrive();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/40 transition-colors"
                title="Save this export directly to Google Drive"
              >
                <span>Save to Drive</span>
              </button>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={!previewUrl || isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
