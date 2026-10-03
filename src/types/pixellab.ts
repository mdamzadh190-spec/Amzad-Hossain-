export type LayerType = 'text' | 'shape' | 'image' | 'sticker' | 'drawing';

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  stops: GradientStop[];
  angle: number; // in degrees
}

export interface LayerShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface LayerStroke {
  enabled: boolean;
  color: string;
  width: number;
}

export interface LayerInnerShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface LayerEmboss {
  enabled: boolean;
  angle: number; // 0 to 360
  intensity: number; // 0 to 100
  ambient: number; // 0 to 100
  specular: number; // 0 to 100
}

export interface LayerRotate3D {
  enabled: boolean;
  rotateX: number; // -180 to 180
  rotateY: number; // -180 to 180
  rotateZ: number; // -180 to 180
  perspective: number;
}

export interface ColorFilter {
  hue: number; // -180 to 180
  saturation: number; // -100 to 100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  opacity: number; // 0 to 1
  locked: boolean;
  visible: boolean;
  shadow?: LayerShadow;
  stroke?: LayerStroke;
  innerShadow?: LayerInnerShadow;
  emboss?: LayerEmboss;
  rotate3D?: LayerRotate3D;
  colorFilter?: ColorFilter;
}

export interface Text3DConfig {
  enabled: boolean;
  depth: number; // 1 to 50
  color: string;
  darken: number; // 0 to 100
  direction: number; // angle in degrees 0 to 360
  oblique: boolean;
  simulateLighting: boolean;
}

export interface TextReflectionConfig {
  enabled: boolean;
  distance: number;
  opacity: number;
}

export interface TextBackgroundConfig {
  enabled: boolean;
  color: string;
  paddingX: number;
  paddingY: number;
  radius: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  align: 'left' | 'center' | 'right';
  colorType: 'solid' | 'gradient';
  color: string;
  gradient?: GradientConfig;
  letterSpacing: number;
  lineHeight: number;
  curve: number; // -100 to 100
  textBg?: TextBackgroundConfig;
  text3D?: Text3DConfig;
  reflection?: TextReflectionConfig;
  textureImage?: string;
}

export type ShapeKind =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'hexagon'
  | 'arrow'
  | 'speech_bubble'
  | 'shield'
  | 'ribbon';

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeKind: ShapeKind;
  fillType: 'solid' | 'gradient';
  fillColor: string;
  fillGradient?: GradientConfig;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius: number;
  blurRadius: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  colorErase?: {
    enabled: boolean;
    color: string;
    tolerance: number;
    smoothness: number;
  };
}

export interface StickerLayer extends BaseLayer {
  type: 'sticker';
  category: string;
  stickerKey: string;
  svgContent: string;
  colorTint?: string;
}

export interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  neon: boolean;
  blur: number;
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  strokes: DrawStroke[];
}

export type Layer = TextLayer | ShapeLayer | ImageLayer | StickerLayer | DrawingLayer;

export interface CanvasEffects {
  vignette: number; // 0 to 100
  vignetteColor: string;
  noise: number; // 0 to 100
  stripes: number; // 0 to 100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  hue: number; // -180 to 180
  saturation: number; // -100 to 100
}

export interface CanvasConfig {
  width: number;
  height: number;
  presetName: string;
  bgType: 'color' | 'gradient' | 'transparent' | 'image';
  bgColor: string;
  bgGradient: GradientConfig;
  bgImage?: string;
  effects: CanvasEffects;
}

export type ActiveTab = 'presets' | 'text' | 'shape' | 'canvas' | 'effects';

export interface ProjectData {
  id: string;
  name: string;
  updatedAt: number;
  canvasConfig: CanvasConfig;
  layers: Layer[];
}
