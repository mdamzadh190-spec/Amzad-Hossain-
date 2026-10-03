/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { BottomNav } from './components/BottomNav';
import { CanvasStage } from './components/CanvasStage';
import { LayersDrawer } from './components/LayersDrawer';
import { ExportModal } from './components/modals/ExportModal';
import { GoogleContactsModal } from './components/modals/GoogleContactsModal';
import { GoogleDriveModal } from './components/modals/GoogleDriveModal';
import { ImageSizeModal } from './components/modals/ImageSizeModal';
import { QuotesModal } from './components/modals/QuotesModal';
import { CanvasToolsPanel } from './components/tools/CanvasToolsPanel';
import { EffectsToolsPanel } from './components/tools/EffectsToolsPanel';
import { ShapeToolsPanel } from './components/tools/ShapeToolsPanel';
import { TemplatesPanel } from './components/tools/TemplatesPanel';
import { TextToolsPanel } from './components/tools/TextToolsPanel';
import { TopBar } from './components/TopBar';
import { STICKER_LIBRARY } from './data/stickers';
import { TemplateItem, TEMPLATES_LIBRARY } from './data/templates';
import { GoogleContact } from './services/googleContacts';
import { getAccessToken, googleSignIn, initAuth, logout } from './services/googleAuth';
import {
  ActiveTab,
  CanvasConfig,
  DrawStroke,
  DrawingLayer,
  ImageLayer,
  Layer,
  LayerType,
  ProjectData,
  ShapeKind,
  ShapeLayer,
  StickerLayer,
  TextLayer,
} from './types/pixellab';

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 1280,
  height: 720,
  presetName: 'YouTube Thumbnail (1280x720)',
  bgType: 'gradient',
  bgColor: '#0F172A',
  bgGradient: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#090D16' },
      { offset: 0.5, color: '#1E1B4B' },
      { offset: 1, color: '#311042' },
    ],
  },
  effects: {
    vignette: 35,
    vignetteColor: '#000000',
    noise: 10,
    stripes: 0,
    brightness: 0,
    contrast: 10,
    hue: 0,
    saturation: 15,
  },
};

// Initial default layers with iconic PixelLab 3D Typography
const INITIAL_LAYERS: Layer[] = [
  {
    id: 'layer_initial_glow',
    name: 'Glow Orb',
    type: 'shape',
    x: 640,
    y: 360,
    width: 380,
    height: 380,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 0.35,
    locked: false,
    visible: true,
    shapeKind: 'circle',
    fillType: 'gradient',
    fillColor: '#8B5CF6',
    fillGradient: {
      type: 'radial',
      angle: 0,
      stops: [
        { offset: 0, color: '#A855F7' },
        { offset: 0.6, color: '#3B82F6' },
        { offset: 1, color: '#000000' },
      ],
    },
    strokeColor: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    blurRadius: 25,
  },
  {
    id: 'layer_initial_text',
    name: 'New 3D Text',
    type: 'text',
    x: 640,
    y: 340,
    width: 800,
    height: 180,
    rotation: -4,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    locked: false,
    visible: true,
    text: 'PIXELLAB',
    fontSize: 130,
    fontFamily: 'Russo One, sans-serif',
    fontWeight: '900',
    fontStyle: 'normal',
    textDecoration: 'none',
    align: 'center',
    colorType: 'gradient',
    color: '#38BDF8',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#FFFFFF' },
        { offset: 0.4, color: '#38BDF8' },
        { offset: 1, color: '#0284C7' },
      ],
    },
    letterSpacing: 4,
    lineHeight: 1,
    curve: 0,
    stroke: {
      enabled: true,
      color: '#082F49',
      width: 12,
    },
    shadow: {
      enabled: true,
      color: '#0284C7',
      blur: 32,
      offsetX: 0,
      offsetY: 12,
      opacity: 0.8,
    },
    text3D: {
      enabled: true,
      depth: 25,
      color: '#0C4A6E',
      darken: 55,
      direction: 260,
      oblique: false,
      simulateLighting: true,
    },
  },
  {
    id: 'layer_initial_sub',
    name: 'Tagline',
    type: 'text',
    x: 640,
    y: 470,
    width: 600,
    height: 60,
    rotation: -4,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    locked: false,
    visible: true,
    text: '3D GRAPHIC & TYPOGRAPHY STUDIO',
    fontSize: 26,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '700',
    fontStyle: 'normal',
    textDecoration: 'none',
    align: 'center',
    colorType: 'solid',
    color: '#FBBF24',
    letterSpacing: 6,
    lineHeight: 1.2,
    curve: 0,
    shadow: {
      enabled: true,
      color: '#F59E0B',
      blur: 15,
      offsetX: 0,
      offsetY: 0,
      opacity: 0.7,
    },
  },
];

export default function App() {
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(DEFAULT_CANVAS_CONFIG);
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('layer_initial_text');
  const [activeTab, setActiveTab] = useState<ActiveTab>('text');

  // History for Undo / Redo
  const [history, setHistory] = useState<{ layers: Layer[]; canvasConfig: CanvasConfig }[]>([
    { layers: INITIAL_LAYERS, canvasConfig: DEFAULT_CANVAS_CONFIG },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI state
  const [showGrid, setShowGrid] = useState(false);
  const [showLayersDrawer, setShowLayersDrawer] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImageSizeModalOpen, setIsImageSizeModalOpen] = useState(false);
  const [isQuotesModalOpen, setIsQuotesModalOpen] = useState(false);

  // Google Workspace state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  // Freehand drawing brush state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingBrush, setDrawingBrush] = useState({
    color: '#22D3EE',
    size: 14,
    neon: true,
    blur: 20,
  });

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign In error', err);
      alert('Google Sign-In: ' + (err.message || 'Could not complete sign in'));
    }
  };

  // Handle Google Sign Out
  const handleGoogleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
  };

  // Push to history
  const pushHistory = useCallback(
    (newLayers: Layer[], newConfig: CanvasConfig) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, { layers: newLayers, canvasConfig: newConfig }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      setLayers(prevStep.layers);
      setCanvasConfig(prevStep.canvasConfig);
      setHistoryIndex((idx) => idx - 1);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      setLayers(nextStep.layers);
      setCanvasConfig(nextStep.canvasConfig);
      setHistoryIndex((idx) => idx + 1);
    }
  };

  // Selected layer reference
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Auto switch tab when layer selected
  useEffect(() => {
    if (!selectedLayer) return;
    if (selectedLayer.type === 'text') {
      setActiveTab('text');
    } else if (selectedLayer.type === 'shape' || selectedLayer.type === 'sticker') {
      setActiveTab('shape');
    }
  }, [selectedLayerId]);

  // Update Layer
  const handleUpdateLayer = (updatedLayer: Layer) => {
    const nextLayers = layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l));
    setLayers(nextLayers);
    pushHistory(nextLayers, canvasConfig);
  };

  // Delete Layer
  const handleDeleteLayer = (id: string) => {
    const nextLayers = layers.filter((l) => l.id !== id);
    setLayers(nextLayers);
    if (selectedLayerId === id) {
      setSelectedLayerId(nextLayers.length > 0 ? nextLayers[nextLayers.length - 1].id : null);
    }
    pushHistory(nextLayers, canvasConfig);
  };

  // Duplicate Layer
  const handleDuplicateLayer = (id: string) => {
    const original = layers.find((l) => l.id === id);
    if (!original) return;
    const duplicated: Layer = {
      ...original,
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Copy)`,
      x: original.x + 25,
      y: original.y + 25,
    };
    const nextLayers = [...layers, duplicated];
    setLayers(nextLayers);
    setSelectedLayerId(duplicated.id);
    pushHistory(nextLayers, canvasConfig);
  };

  // Add Layer by Type
  const handleAddLayer = (type: LayerType) => {
    const id = `layer_${Date.now()}`;
    const centerX = Math.round(canvasConfig.width / 2);
    const centerY = Math.round(canvasConfig.height / 2);
    let newLayer: Layer;

    if (type === 'text') {
      newLayer = {
        id,
        name: 'New Text',
        type: 'text',
        x: centerX,
        y: centerY,
        width: 500,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        text: 'NEW TEXT',
        fontSize: 70,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '900',
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        colorType: 'solid',
        color: '#FFFFFF',
        letterSpacing: 2,
        lineHeight: 1.1,
        curve: 0,
        stroke: {
          enabled: true,
          color: '#000000',
          width: 4,
        },
      } as TextLayer;
      setActiveTab('text');
    } else if (type === 'shape') {
      newLayer = {
        id,
        name: 'Rectangle Shape',
        type: 'shape',
        x: centerX,
        y: centerY,
        width: 300,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        shapeKind: 'rectangle',
        fillType: 'solid',
        fillColor: '#3B82F6',
        strokeColor: '#FFFFFF',
        strokeWidth: 4,
        cornerRadius: 16,
        blurRadius: 0,
      } as ShapeLayer;
      setActiveTab('shape');
    } else if (type === 'sticker') {
      const firstStk = STICKER_LIBRARY[0];
      newLayer = {
        id,
        name: firstStk.name,
        type: 'sticker',
        x: centerX,
        y: centerY,
        width: 140,
        height: 140,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        category: firstStk.category,
        stickerKey: firstStk.id,
        svgContent: firstStk.svg,
      } as StickerLayer;
      setActiveTab('shape');
    } else {
      return;
    }

    const nextLayers = [...layers, newLayer];
    setLayers(nextLayers);
    setSelectedLayerId(newLayer.id);
    pushHistory(nextLayers, canvasConfig);
  };

  // Add Specific Shape
  const handleAddShape = (kind: ShapeKind) => {
    const id = `shape_${Date.now()}`;
    const centerX = Math.round(canvasConfig.width / 2);
    const centerY = Math.round(canvasConfig.height / 2);
    const newShape: ShapeLayer = {
      id,
      name: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Shape`,
      type: 'shape',
      x: centerX,
      y: centerY,
      width: 240,
      height: 240,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      shapeKind: kind,
      fillType: 'solid',
      fillColor: '#06B6D4',
      strokeColor: '#FFFFFF',
      strokeWidth: 3,
      cornerRadius: kind === 'rectangle' ? 12 : 0,
      blurRadius: 0,
    };
    const nextLayers = [...layers, newShape];
    setLayers(nextLayers);
    setSelectedLayerId(newShape.id);
    pushHistory(nextLayers, canvasConfig);
  };

  // Add Specific Sticker
  const handleAddSticker = (stk: (typeof STICKER_LIBRARY)[0]) => {
    const id = `sticker_${Date.now()}`;
    const centerX = Math.round(canvasConfig.width / 2);
    const centerY = Math.round(canvasConfig.height / 2);
    const newSticker: StickerLayer = {
      id,
      name: stk.name,
      type: 'sticker',
      x: centerX,
      y: centerY,
      width: 180,
      height: 180,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      category: stk.category,
      stickerKey: stk.id,
      svgContent: stk.svg,
    };
    const nextLayers = [...layers, newSticker];
    setLayers(nextLayers);
    setSelectedLayerId(newSticker.id);
    pushHistory(nextLayers, canvasConfig);
  };

  // Freehand stroke added
  const handleAddStroke = (stroke: DrawStroke) => {
    let drawLayer = layers.find((l) => l.type === 'drawing') as DrawingLayer | undefined;
    let nextLayers: Layer[];
    if (drawLayer) {
      const updatedLayer: DrawingLayer = {
        ...drawLayer,
        strokes: [...drawLayer.strokes, stroke],
      };
      nextLayers = layers.map((l) => (l.id === drawLayer!.id ? updatedLayer : l));
    } else {
      const newDrawLayer: DrawingLayer = {
        id: `draw_${Date.now()}`,
        name: 'Freehand Drawing',
        type: 'drawing',
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        strokes: [stroke],
      };
      nextLayers = [...layers, newDrawLayer];
    }
    setLayers(nextLayers);
    pushHistory(nextLayers, canvasConfig);
  };

  // Clear Freehand strokes
  const handleClearDrawing = () => {
    const nextLayers = layers.filter((l) => l.type !== 'drawing');
    setLayers(nextLayers);
    pushHistory(nextLayers, canvasConfig);
  };

  // Import Image from user disk
  const handleImportImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      handleImportImageLayer(src, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Import Image from Google Drive or Data URL
  const handleImportImageLayer = (src: string, name: string) => {
    const img = new Image();
    img.onload = () => {
      const id = `img_${Date.now()}`;
      const maxDim = 400;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const newImgLayer: ImageLayer = {
        id,
        name: name || 'Imported Image',
        type: 'image',
        src,
        x: Math.round(canvasConfig.width / 2),
        y: Math.round(canvasConfig.height / 2),
        width: w,
        height: h,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        originalWidth: img.width,
        originalHeight: img.height,
        aspectRatio: img.width / img.height,
      };
      const nextLayers = [...layers, newImgLayer];
      setLayers(nextLayers);
      setSelectedLayerId(newImgLayer.id);
      pushHistory(nextLayers, canvasConfig);
    };
    img.src = src;
  };

  // Insert quote into design
  const handleSelectQuote = (quoteText: string) => {
    const id = `quote_${Date.now()}`;
    const newTextLayer: TextLayer = {
      id,
      name: 'Quote Text',
      type: 'text',
      x: Math.round(canvasConfig.width / 2),
      y: Math.round(canvasConfig.height / 2),
      width: 800,
      height: 160,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      text: quoteText,
      fontSize: 48,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'center',
      colorType: 'solid',
      color: '#FFFFFF',
      letterSpacing: 2,
      lineHeight: 1.2,
      curve: 0,
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 20,
        offsetX: 0,
        offsetY: 6,
        opacity: 0.8,
      },
    };
    const nextLayers = [...layers, newTextLayer];
    setLayers(nextLayers);
    setSelectedLayerId(newTextLayer.id);
    setActiveTab('text');
    pushHistory(nextLayers, canvasConfig);
  };

  // Insert contact name & info as 3D Text
  const handleInsertContactText = (name: string, details?: string) => {
    const id = `contact_${Date.now()}`;
    const newTextLayer: TextLayer = {
      id,
      name: `Contact: ${name}`,
      type: 'text',
      x: Math.round(canvasConfig.width / 2),
      y: Math.round(canvasConfig.height / 2),
      width: 600,
      height: 120,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      text: name.toUpperCase(),
      fontSize: 70,
      fontFamily: 'Russo One, sans-serif',
      fontWeight: '900',
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'center',
      colorType: 'gradient',
      color: '#38BDF8',
      gradient: {
        type: 'linear',
        angle: 90,
        stops: [
          { offset: 0, color: '#38BDF8' },
          { offset: 0.5, color: '#0284C7' },
          { offset: 1, color: '#0369A1' },
        ],
      },
      letterSpacing: 3,
      lineHeight: 1.1,
      curve: 0,
      stroke: {
        enabled: true,
        color: '#082F49',
        width: 8,
      },
      text3D: {
        enabled: true,
        depth: 18,
        color: '#082F49',
        darken: 50,
        direction: 260,
        oblique: false,
        simulateLighting: true,
      },
      shadow: {
        enabled: true,
        color: '#0284C7',
        blur: 25,
        offsetX: 0,
        offsetY: 8,
        opacity: 0.7,
      },
    };

    let nextLayers = [...layers, newTextLayer];

    // If details like email or phone exist, add subtitle text layer
    if (details) {
      const subId = `sub_${Date.now()}`;
      const subLayer: TextLayer = {
        id: subId,
        name: `Info: ${details}`,
        type: 'text',
        x: Math.round(canvasConfig.width / 2),
        y: Math.round(canvasConfig.height / 2) + 80,
        width: 500,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        text: details,
        fontSize: 22,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '700',
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        colorType: 'solid',
        color: '#FBBF24',
        letterSpacing: 2,
        lineHeight: 1.2,
        curve: 0,
        stroke: {
          enabled: true,
          color: '#1E293B',
          width: 3,
        },
      };
      nextLayers = [...nextLayers, subLayer];
    }

    setLayers(nextLayers);
    setSelectedLayerId(newTextLayer.id);
    setActiveTab('text');
    pushHistory(nextLayers, canvasConfig);
  };

  // Insert stylish Contact Badge / Card
  const handleInsertContactBadge = (contact: GoogleContact) => {
    const centerX = Math.round(canvasConfig.width / 2);
    const centerY = Math.round(canvasConfig.height / 2);

    // Card background shape
    const badgeBg: ShapeLayer = {
      id: `badge_bg_${Date.now()}`,
      name: `${contact.name} Badge Frame`,
      type: 'shape',
      x: centerX,
      y: centerY,
      width: 480,
      height: 220,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 0.95,
      locked: false,
      visible: true,
      shapeKind: 'rectangle',
      fillType: 'gradient',
      fillColor: '#0F172A',
      fillGradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { offset: 0, color: '#1E293B' },
          { offset: 1, color: '#0F172A' },
        ],
      },
      strokeColor: '#38BDF8',
      strokeWidth: 3,
      cornerRadius: 16,
      blurRadius: 0,
      shadow: {
        enabled: true,
        color: '#38BDF8',
        blur: 24,
        offsetX: 0,
        offsetY: 6,
        opacity: 0.6,
      },
    };

    // Name Text Layer
    const nameLayer: TextLayer = {
      id: `badge_name_${Date.now()}`,
      name: `${contact.name} Name`,
      type: 'text',
      x: centerX,
      y: centerY - 30,
      width: 440,
      height: 60,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      text: contact.name,
      fontSize: 38,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'center',
      colorType: 'solid',
      color: '#FFFFFF',
      letterSpacing: 2,
      lineHeight: 1.1,
      curve: 0,
      stroke: {
        enabled: true,
        color: '#0284C7',
        width: 3,
      },
    };

    // Subtitle / Company / Email Layer
    const subtitle = contact.jobTitle
      ? `${contact.jobTitle}${contact.company ? ` · ${contact.company}` : ''}`
      : contact.email || contact.phoneNumber || 'Contact Card';

    const subLayer: TextLayer = {
      id: `badge_sub_${Date.now()}`,
      name: `${contact.name} Subtitle`,
      type: 'text',
      x: centerX,
      y: centerY + 30,
      width: 440,
      height: 40,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      visible: true,
      text: subtitle,
      fontSize: 18,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '600',
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'center',
      colorType: 'solid',
      color: '#38BDF8',
      letterSpacing: 1,
      lineHeight: 1.2,
      curve: 0,
    };

    const nextLayers = [...layers, badgeBg, nameLayer, subLayer];
    setLayers(nextLayers);
    setSelectedLayerId(nameLayer.id);
    setActiveTab('text');
    pushHistory(nextLayers, canvasConfig);
  };

  // Load Template
  const handleLoadTemplate = (template: TemplateItem) => {
    setCanvasConfig(template.canvasConfig);
    setLayers(template.layers);
    setSelectedLayerId(template.layers.length > 0 ? template.layers[0].id : null);
    pushHistory(template.layers, template.canvasConfig);
  };

  // Load Saved Project
  const handleLoadProject = (project: ProjectData) => {
    setCanvasConfig(project.canvasConfig);
    setLayers(project.layers);
    setSelectedLayerId(project.layers.length > 0 ? project.layers[0].id : null);
    pushHistory(project.layers, project.canvasConfig);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (isInput) return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedLayerId) {
          handleDuplicateLayer(selectedLayerId);
        }
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          handleDeleteLayer(selectedLayerId);
        }
      }

      // Deselect
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
        setIsDrawingMode(false);
      }

      // Arrow Key Nudges
      if (selectedLayer && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        handleUpdateLayer({
          ...selectedLayer,
          x: selectedLayer.x + dx,
          y: selectedLayer.y + dy,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, selectedLayer, historyIndex, history]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans select-none">
      {/* Top Bar with brand, add menu, Google integration, undo/redo, layers, and export */}
      <TopBar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        layersCount={layers.length}
        showLayersDrawer={showLayersDrawer}
        onToggleLayersDrawer={() => setShowLayersDrawer(!showLayersDrawer)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenQuotesModal={() => setIsQuotesModalOpen(true)}
        onAddLayer={handleAddLayer}
        onImportImage={handleImportImage}
        onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
        isDrawingMode={isDrawingMode}
        onOpenTemplates={() => setActiveTab('presets')}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenContactsModal={() => setIsContactsModalOpen(true)}
      />

      {/* Main Center Area with Canvas Stage */}
      <main className="flex-1 relative flex overflow-hidden">
        <CanvasStage
          canvasConfig={canvasConfig}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={handleUpdateLayer}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          showGrid={showGrid}
          isDrawingMode={isDrawingMode}
          drawingBrush={drawingBrush}
          onAddStroke={handleAddStroke}
        />

        {/* Slide-out Layers Stack Manager */}
        <LayersDrawer
          isOpen={showLayersDrawer}
          onClose={() => setShowLayersDrawer(false)}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={handleUpdateLayer}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onReorderLayers={(newLayers) => {
            setLayers(newLayers);
            pushHistory(newLayers, canvasConfig);
          }}
          onAddLayer={handleAddLayer}
        />
      </main>

      {/* Contextual Property Tool Panels (Tab 1 to Tab 5) */}
      <div className="shrink-0 z-20">
        {activeTab === 'presets' && (
          <TemplatesPanel
            currentCanvasConfig={canvasConfig}
            currentLayers={layers}
            onLoadTemplate={handleLoadTemplate}
            onLoadProject={handleLoadProject}
          />
        )}

        {activeTab === 'text' && (
          <TextToolsPanel
            layer={selectedLayer?.type === 'text' ? (selectedLayer as TextLayer) : null}
            onUpdateLayer={(l) => handleUpdateLayer(l)}
            onAddTextLayer={() => handleAddLayer('text')}
            onDeleteLayer={handleDeleteLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onBringForward={(id) => {
              const idx = layers.findIndex((l) => l.id === id);
              if (idx !== -1 && idx < layers.length - 1) {
                const updated = [...layers];
                const [moved] = updated.splice(idx, 1);
                updated.splice(idx + 1, 0, moved);
                setLayers(updated);
                pushHistory(updated, canvasConfig);
              }
            }}
            onSendBackward={(id) => {
              const idx = layers.findIndex((l) => l.id === id);
              if (idx > 0) {
                const updated = [...layers];
                const [moved] = updated.splice(idx, 1);
                updated.splice(idx - 1, 0, moved);
                setLayers(updated);
                pushHistory(updated, canvasConfig);
              }
            }}
            canvasWidth={canvasConfig.width}
            canvasHeight={canvasConfig.height}
          />
        )}

        {activeTab === 'shape' && (
          <ShapeToolsPanel
            selectedLayer={selectedLayer}
            onUpdateLayer={handleUpdateLayer}
            onAddShape={handleAddShape}
            onAddSticker={handleAddSticker}
            isDrawingMode={isDrawingMode}
            onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
            drawingBrush={drawingBrush}
            onUpdateDrawingBrush={setDrawingBrush}
            onClearDrawing={handleClearDrawing}
          />
        )}

        {activeTab === 'canvas' && (
          <CanvasToolsPanel
            canvasConfig={canvasConfig}
            onUpdateCanvasConfig={(cfg) => {
              setCanvasConfig(cfg);
              pushHistory(layers, cfg);
            }}
            onOpenImageSizeModal={() => setIsImageSizeModalOpen(true)}
          />
        )}

        {activeTab === 'effects' && (
          <EffectsToolsPanel
            canvasConfig={canvasConfig}
            onUpdateCanvasConfig={(cfg) => {
              setCanvasConfig(cfg);
              pushHistory(layers, cfg);
            }}
          />
        )}
      </div>

      {/* Iconic PixelLab 5-Tab Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        hasSelectedText={selectedLayer?.type === 'text'}
        hasSelectedShape={selectedLayer?.type === 'shape' || selectedLayer?.type === 'sticker'}
      />

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvasConfig={canvasConfig}
        layers={layers}
        onSaveToDrive={() => setIsDriveModalOpen(true)}
      />

      <ImageSizeModal
        isOpen={isImageSizeModalOpen}
        onClose={() => setIsImageSizeModalOpen(false)}
        canvasConfig={canvasConfig}
        onApplySize={(w, h, name) => {
          const updated = {
            ...canvasConfig,
            width: w,
            height: h,
            presetName: name,
          };
          setCanvasConfig(updated);
          pushHistory(layers, updated);
        }}
      />

      <QuotesModal
        isOpen={isQuotesModalOpen}
        onClose={() => setIsQuotesModalOpen(false)}
        onSelectQuote={handleSelectQuote}
      />

      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        accessToken={accessToken}
        onRequireAuth={handleGoogleSignIn}
        canvasConfig={canvasConfig}
        layers={layers}
        onImportImageLayer={handleImportImageLayer}
        onLoadProject={handleLoadProject}
      />

      <GoogleContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        accessToken={accessToken}
        onRequireAuth={handleGoogleSignIn}
        onInsertContactText={handleInsertContactText}
        onInsertContactBadge={handleInsertContactBadge}
      />
    </div>
  );
}
