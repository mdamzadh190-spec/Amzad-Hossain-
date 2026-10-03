import React, { useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Cloud,
  Download,
  FolderOpen,
  Grid,
  Image as ImageIcon,
  Layers as LayersIcon,
  LogOut,
  Maximize,
  Minimize,
  PenTool,
  Plus,
  Quote,
  Redo2,
  Shapes,
  Type,
  Undo2,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { LayerType } from '../types/pixellab';

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  layersCount: number;
  showLayersDrawer: boolean;
  onToggleLayersDrawer: () => void;
  onOpenExportModal: () => void;
  onOpenQuotesModal: () => void;
  onAddLayer: (type: LayerType) => void;
  onImportImage: (file: File) => void;
  onToggleDrawingMode: () => void;
  isDrawingMode: boolean;
  onOpenTemplates: () => void;
  // Google Workspace Props
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenDriveModal: () => void;
  onOpenContactsModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  layersCount,
  showLayersDrawer,
  onToggleLayersDrawer,
  onOpenExportModal,
  onOpenQuotesModal,
  onAddLayer,
  onImportImage,
  onToggleDrawingMode,
  isDrawingMode,
  onOpenTemplates,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenDriveModal,
  onOpenContactsModal,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportImage(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAddMenu(false);
  };

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/95 px-3 sm:px-4 flex items-center justify-between z-30 select-none">
      {/* Zone 1: Single text element wordmark & Add Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            PixelLab
            <span className="text-xs font-medium text-cyan-400 font-mono tracking-normal hidden xs:inline">
              WEB
            </span>
          </span>
        </a>

        {/* Quick Add Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-md border border-neutral-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add</span>
          </button>

          {showAddMenu && (
            <div
              className="absolute left-0 mt-2 w-52 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => onAddLayer('text')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <Type className="w-4 h-4 text-cyan-400" />
                <span>Text Layer</span>
              </button>
              <button
                onClick={() => onAddLayer('shape')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <Shapes className="w-4 h-4 text-emerald-400" />
                <span>Vector Shape</span>
              </button>
              <button
                onClick={() => onAddLayer('sticker')}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <span className="text-sm">⭐</span>
                <span>Sticker</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>From Device / Disk</span>
              </button>
              <button
                onClick={onOpenDriveModal}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <Cloud className="w-4 h-4 text-blue-400" />
                <span>From Google Drive</span>
              </button>
              <button
                onClick={onOpenContactsModal}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>From Google Contacts</span>
              </button>
              <button
                onClick={onToggleDrawingMode}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <PenTool className="w-4 h-4 text-pink-400" />
                <span>Freehand Draw</span>
              </button>
              <div className="h-px bg-neutral-800 my-1" />
              <button
                onClick={onOpenQuotesModal}
                className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
              >
                <Quote className="w-4 h-4 text-purple-400" />
                <span>Quotes Library</span>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Zone 2: Workspace View & History Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center bg-neutral-800/80 rounded-md border border-neutral-700/60 p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 rounded hover:bg-neutral-700/60 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="h-3.5 w-px bg-neutral-700 mx-0.5" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 rounded hover:bg-neutral-700/60 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Snapping Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 ${
            showGrid
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-700'
          }`}
          title="Toggle Alignment Grid"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden md:inline">Grid</span>
        </button>

        {/* Google Drive Button */}
        <button
          onClick={onOpenDriveModal}
          className="p-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 bg-neutral-800/80 text-blue-400 border-neutral-700/60 hover:bg-neutral-700"
          title="Google Drive (Save & Import)"
        >
          <Cloud className="w-4 h-4" />
          <span className="hidden lg:inline">Drive</span>
        </button>

        {/* Google Contacts Button */}
        <button
          onClick={onOpenContactsModal}
          className="p-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 bg-neutral-800/80 text-emerald-400 border-neutral-700/60 hover:bg-neutral-700"
          title="Google Contacts (Import Names & Badges)"
        >
          <Users className="w-4 h-4" />
          <span className="hidden lg:inline">Contacts</span>
        </button>

        {/* Templates quick launcher */}
        <button
          onClick={onOpenTemplates}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-md border border-neutral-700/60 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Templates</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800/80 rounded-md border border-neutral-700/60 hover:bg-neutral-700 transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Zone 3: User Auth / Profile, Layers Toggle, and Export */}
      <div className="flex items-center gap-2">
        {/* Google User Avatar / Sign-In */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-cyan-500/50 transition-all"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google Account'}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.displayName?.charAt(0) || 'G'}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-2 z-50 text-xs"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-2 py-1.5 border-b border-neutral-800 mb-1">
                  <div className="font-bold text-white truncate">{currentUser.displayName}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{currentUser.email}</div>
                </div>
                <button
                  onClick={onOpenDriveModal}
                  className="w-full px-2 py-1.5 text-left text-neutral-200 hover:bg-neutral-800 rounded flex items-center gap-2"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Drive Files</span>
                </button>
                <button
                  onClick={onOpenContactsModal}
                  className="w-full px-2 py-1.5 text-left text-neutral-200 hover:bg-neutral-800 rounded flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Contacts</span>
                </button>
                <div className="h-px bg-neutral-800 my-1" />
                <button
                  onClick={onGoogleSignOut}
                  className="w-full px-2 py-1.5 text-left text-rose-400 hover:bg-neutral-800 rounded flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded shadow transition-colors"
            title="Sign in with Google to use Drive & Contacts"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Layers Drawer Button */}
        <button
          onClick={onToggleLayersDrawer}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            showLayersDrawer
              ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-semibold shadow-md'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
          }`}
          title="Open Layers Manager"
        >
          <LayersIcon className="w-4 h-4" />
          <span className="hidden xs:inline">Layers</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
              showLayersDrawer ? 'bg-neutral-950 text-cyan-400' : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {layersCount}
          </span>
        </button>

        {/* Export / Save Image Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
