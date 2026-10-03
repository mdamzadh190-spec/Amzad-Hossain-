import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Copy,
  Focus,
  Lock,
  Maximize2,
  Minimize2,
  RotateCw,
  Trash2,
  Unlock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { CanvasConfig, DrawStroke, DrawingLayer, Layer } from '../types/pixellab';
import { hitTestLayer, preloadImage, preloadSvg, renderEntireCanvas } from '../utils/canvasRenderer';

interface CanvasStageProps {
  canvasConfig: CanvasConfig;
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (layer: Layer) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  showGrid: boolean;
  isDrawingMode: boolean;
  drawingBrush: { color: string; size: number; neon: boolean; blur: number };
  onAddStroke: (stroke: DrawStroke) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  canvasConfig,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  showGrid,
  isDrawingMode,
  drawingBrush,
  onAddStroke,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport zoom & pan
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging & Transforming state
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layerInitialState, setLayerInitialState] = useState<Layer | null>(null);

  // Freehand drawing current stroke
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[] | null>(null);

  // Snapping guides
  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);
  const [snapGuideY, setSnapGuideY] = useState<number | null>(null);

  // Selected layer reference
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Auto-fit canvas on initial load
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = (clientWidth - 80) / canvasConfig.width;
      const scaleY = (clientHeight - 80) / canvasConfig.height;
      const initialZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 1.2);
      setZoom(initialZoom);
    }
  }, [canvasConfig.width, canvasConfig.height]);

  // Preload images and SVGs whenever layers change
  useEffect(() => {
    layers.forEach((l) => {
      if (l.type === 'image' && l.src) {
        preloadImage(l.src);
      } else if (l.type === 'sticker' && l.svgContent) {
        preloadSvg(l.svgContent, l.stickerKey);
      }
    });
  }, [layers]);

  // Render to canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render all elements
    renderEntireCanvas(ctx, canvasConfig, layers);

    // Render active freehand drawing preview if user is currently drawing
    if (currentStroke && currentStroke.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = drawingBrush.size;
      ctx.strokeStyle = drawingBrush.color;
      if (drawingBrush.neon) {
        ctx.shadowColor = drawingBrush.color;
        ctx.shadowBlur = drawingBrush.blur || 18;
      }
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [canvasConfig, layers, currentStroke, drawingBrush]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Helper to get canvas coordinate from mouse event
  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleFactorX = canvasConfig.width / rect.width;
    const scaleFactorY = canvasConfig.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleFactorX,
      y: (e.clientY - rect.top) * scaleFactorY,
    };
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Space key pan or middle mouse button or alt key
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only primary click

    const coords = getCanvasCoords(e);

    // Freehand drawing mode
    if (isDrawingMode) {
      setCurrentStroke([coords]);
      return;
    }

    // Check if clicked inside selected layer's bounding box or on a handle
    // If not, do hit test on layers from top to bottom
    let hitLayer: Layer | null = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (hitTestLayer(layers[i], coords.x, coords.y)) {
        hitLayer = layers[i];
        break;
      }
    }

    if (hitLayer) {
      onSelectLayer(hitLayer.id);
      setIsDragging(true);
      setDragHandle('move');
      setDragStart(coords);
      setLayerInitialState({ ...hitLayer });
    } else {
      onSelectLayer(null);
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const coords = getCanvasCoords(e);

    // Freehand drawing
    if (isDrawingMode && currentStroke) {
      setCurrentStroke((prev) => (prev ? [...prev, coords] : [coords]));
      return;
    }

    if (!isDragging || !selectedLayer || !layerInitialState) return;

    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;

    if (dragHandle === 'move') {
      let nextX = layerInitialState.x + dx;
      let nextY = layerInitialState.y + dy;

      // Smart Snapping to Center X and Center Y
      const centerX = canvasConfig.width / 2;
      const centerY = canvasConfig.height / 2;
      const snapThreshold = 12;

      if (Math.abs(nextX - centerX) < snapThreshold) {
        nextX = centerX;
        setSnapGuideX(centerX);
      } else {
        setSnapGuideX(null);
      }

      if (Math.abs(nextY - centerY) < snapThreshold) {
        nextY = centerY;
        setSnapGuideY(centerY);
      } else {
        setSnapGuideY(null);
      }

      onUpdateLayer({
        ...selectedLayer,
        x: Math.round(nextX),
        y: Math.round(nextY),
      });
    } else if (dragHandle === 'rotate') {
      const angleRad = Math.atan2(coords.y - selectedLayer.y, coords.x - selectedLayer.x);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      // Snap to 0, 45, 90, 180, 270, 360
      if (Math.abs(angleDeg % 45) < 3) {
        angleDeg = Math.round(angleDeg / 45) * 45;
      }
      onUpdateLayer({
        ...selectedLayer,
        rotation: angleDeg,
      });
    } else if (dragHandle?.startsWith('resize-')) {
      const dir = dragHandle.replace('resize-', '');
      let newW = layerInitialState.width;
      let newH = layerInitialState.height;

      if (dir.includes('e')) newW = Math.max(30, layerInitialState.width + dx * 2);
      if (dir.includes('w')) newW = Math.max(30, layerInitialState.width - dx * 2);
      if (dir.includes('s')) newH = Math.max(20, layerInitialState.height + dy * 2);
      if (dir.includes('n')) newH = Math.max(20, layerInitialState.height - dy * 2);

      // Proportional scale on corner drag
      if (['nw', 'ne', 'se', 'sw'].includes(dir)) {
        const aspect = layerInitialState.width / layerInitialState.height;
        if (selectedLayer.type === 'text') {
          const scale = newW / layerInitialState.width;
          const newFontSize = Math.max(12, Math.round((layerInitialState as any).fontSize * scale));
          onUpdateLayer({
            ...selectedLayer,
            width: Math.round(newW),
            height: Math.round(newH),
            fontSize: newFontSize,
          } as any);
          return;
        }
      }

      onUpdateLayer({
        ...selectedLayer,
        width: Math.round(newW),
        height: Math.round(newH),
      });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDragging) {
      setIsDragging(false);
      setDragHandle(null);
      setLayerInitialState(null);
      setSnapGuideX(null);
      setSnapGuideY(null);
    }
    if (isDrawingMode && currentStroke && currentStroke.length > 1) {
      onAddStroke({
        points: currentStroke,
        color: drawingBrush.color,
        size: drawingBrush.size,
        neon: drawingBrush.neon,
        blur: drawingBrush.blur,
      });
      setCurrentStroke(null);
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.15), 3));
    }
  };

  // Center Selected Layer
  const handleCenterSelected = () => {
    if (!selectedLayer) return;
    onUpdateLayer({
      ...selectedLayer,
      x: Math.round(canvasConfig.width / 2),
      y: Math.round(canvasConfig.height / 2),
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-neutral-950 overflow-hidden select-none flex items-center justify-center cursor-default"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Floating Canvas Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-neutral-900/90 border border-neutral-800 rounded-lg shadow-xl backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.max(0.15, z - 0.1))}
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs font-mono tabular-nums text-neutral-300 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-neutral-800 mx-0.5" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors text-xs font-mono"
          title="Reset Zoom (100%)"
        >
          100%
        </button>
      </div>

      {/* Canvas Wrapper positioned with Pan & Zoom transform */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging || isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
        className="relative shrink-0 shadow-2xl rounded-sm"
      >
        {/* Main Canvas Element */}
        <canvas
          ref={canvasRef}
          width={canvasConfig.width}
          height={canvasConfig.height}
          className="block rounded-sm ring-1 ring-neutral-800 shadow-2xl"
          style={{
            width: canvasConfig.width,
            height: canvasConfig.height,
          }}
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Snapping Guidelines */}
        {snapGuideX !== null && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-dashed border-cyan-400 z-30"
            style={{ left: `${snapGuideX}px` }}
          />
        )}
        {snapGuideY !== null && (
          <div
            className="absolute left-0 right-0 pointer-events-none border-t-2 border-dashed border-cyan-400 z-30"
            style={{ top: `${snapGuideY}px` }}
          />
        )}

        {/* Selected Layer Bounding Box & Interactive Handles */}
        {selectedLayer && selectedLayer.visible && !isDrawingMode && (
          <div
            className="absolute pointer-events-auto"
            style={{
              left: `${selectedLayer.x}px`,
              top: `${selectedLayer.y}px`,
              width: `${selectedLayer.width * selectedLayer.scaleX}px`,
              height: `${selectedLayer.height * selectedLayer.scaleY}px`,
              transform: `translate(-50%, -50%) rotate(${selectedLayer.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Outline Box */}
            <div className="absolute inset-0 border border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] pointer-events-none" />

            {/* Quick Action Top Floating Bar */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900 border border-cyan-500/40 rounded-md px-1.5 py-1 shadow-lg pointer-events-auto z-40 whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCenterSelected();
                }}
                className="p-1 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800 rounded transition-colors"
                title="Center on Canvas"
              >
                <Focus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateLayer(selectedLayer.id);
                }}
                className="p-1 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800 rounded transition-colors"
                title="Duplicate Layer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLayer({ ...selectedLayer, locked: !selectedLayer.locked });
                }}
                className="p-1 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800 rounded transition-colors"
                title={selectedLayer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {selectedLayer.locked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(selectedLayer.id);
                }}
                className="p-1 text-neutral-300 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                title="Delete Layer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Rotation Handle */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                  setDragHandle('rotate');
                  setDragStart(getCanvasCoords(e));
                  setLayerInitialState({ ...selectedLayer });
                }}
                className="w-4 h-4 rounded-full bg-cyan-400 border border-white cursor-grab hover:scale-125 transition-transform flex items-center justify-center shadow-md"
                title="Drag to Rotate"
              >
                <RotateCw className="w-2.5 h-2.5 text-neutral-950" />
              </div>
              <div className="w-px h-3 bg-cyan-400" />
            </div>

            {/* 8 Bounding Box Scale Handles */}
            {[
              { id: 'resize-nw', pos: '-top-1.5 -left-1.5', cursor: 'nwse-resize' },
              { id: 'resize-n', pos: '-top-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
              { id: 'resize-ne', pos: '-top-1.5 -right-1.5', cursor: 'nesw-resize' },
              { id: 'resize-w', pos: 'top-1/2 -left-1.5 -translate-y-1/2', cursor: 'ew-resize' },
              { id: 'resize-e', pos: 'top-1/2 -right-1.5 -translate-y-1/2', cursor: 'ew-resize' },
              { id: 'resize-sw', pos: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize' },
              { id: 'resize-s', pos: '-bottom-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
              { id: 'resize-se', pos: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize' },
            ].map((handle) => (
              <div
                key={handle.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                  setDragHandle(handle.id);
                  setDragStart(getCanvasCoords(e));
                  setLayerInitialState({ ...selectedLayer });
                }}
                className={`absolute ${handle.pos} w-3 h-3 bg-white border border-cyan-500 rounded-sm hover:scale-125 transition-transform ${handle.cursor}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
