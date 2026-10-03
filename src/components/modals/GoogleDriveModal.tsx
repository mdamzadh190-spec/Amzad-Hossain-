import React, { useEffect, useState } from 'react';
import {
  Check,
  Cloud,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { DriveFile, deleteDriveFile, downloadDriveFile, listDriveFiles, uploadToDrive } from '../../services/googleDrive';
import { CanvasConfig, Layer, ProjectData } from '../../types/pixellab';
import { exportCanvasToImage } from '../../utils/canvasRenderer';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onRequireAuth: () => void;
  canvasConfig: CanvasConfig;
  layers: Layer[];
  onImportImageLayer: (src: string, name: string) => void;
  onLoadProject: (project: ProjectData) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  onRequireAuth,
  canvasConfig,
  layers,
  onImportImageLayer,
  onLoadProject,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'images' | 'projects'>('all');

  // Load files when modal opens and token is present
  const loadFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const driveFiles = await listDriveFiles(accessToken);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!accessToken) {
        onRequireAuth();
      } else {
        loadFiles();
      }
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  // Save current design as PNG to Google Drive
  const handleSaveImageToDrive = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setStatusMsg('Rendering and uploading image to Google Drive...');
    try {
      const dataUrl = await exportCanvasToImage(canvasConfig, layers, 2, 'image/png', 0.95);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `PixelLab_${canvasConfig.presetName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      await uploadToDrive(accessToken, fileName, 'image/png', blob);
      setStatusMsg('Successfully saved to Google Drive!');
      await loadFiles();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Save current project state as JSON to Google Drive
  const handleSaveProjectToDrive = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    setStatusMsg('Saving project JSON to Google Drive...');
    try {
      const projectData: ProjectData = {
        id: `proj_${Date.now()}`,
        name: canvasConfig.presetName || 'PixelLab Project',
        updatedAt: Date.now(),
        canvasConfig,
        layers,
      };
      const jsonBlob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: 'application/json',
      });
      const fileName = `PixelLab_Project_${Date.now()}.json`;
      await uploadToDrive(accessToken, fileName, 'application/json', jsonBlob);
      setStatusMsg('Project file saved to Google Drive!');
      await loadFiles();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload project to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Import image file from Drive into Canvas
  const handleImportDriveImage = async (file: DriveFile) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const blob = await downloadDriveFile(accessToken, file.id);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        onImportImageLayer(src, file.name);
        onClose();
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to download image from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Project file from Drive
  const handleOpenDriveProject = async (file: DriveFile) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const blob = await downloadDriveFile(accessToken, file.id);
      const text = await blob.text();
      const project: ProjectData = JSON.parse(text);
      if (project.canvasConfig && project.layers) {
        onLoadProject(project);
        onClose();
      } else {
        throw new Error('Invalid PixelLab project format');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not parse project file from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit confirmation dialog for deletion per Workspace skill guidelines
  const handleDeleteFile = async (file: DriveFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accessToken) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}" from your Google Drive? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteDriveFile(accessToken, file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setStatusMsg(`Deleted "${file.name}" from Google Drive.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete file from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (filterType === 'images') {
      return f.mimeType.startsWith('image/') || f.name.endsWith('.png') || f.name.endsWith('.jpg');
    }
    if (filterType === 'projects') {
      return f.name.endsWith('.json') || f.mimeType === 'application/json';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Drive Integration</h3>
              <p className="text-[11px] text-neutral-400">
                Save designs, load project files, and import images from your Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 border-b border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between flex-wrap gap-2">
          {/* Quick upload buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveImageToDrive}
              disabled={isUploading || !accessToken}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Save Image to Drive</span>
            </button>
            <button
              onClick={handleSaveProjectToDrive}
              disabled={isUploading || !accessToken}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-cyan-400 text-xs font-semibold rounded-md border border-neutral-700 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Save Project (.json)</span>
            </button>
          </div>

          {/* Filter Pills & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-800/80 rounded-md p-0.5 border border-neutral-700/60 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'all' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('images')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'images' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-300'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setFilterType('projects')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'projects' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-300'
                }`}
              >
                Projects
              </button>
            </div>

            <button
              onClick={loadFiles}
              disabled={isLoading}
              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
              title="Refresh Drive Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {statusMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-lg text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Files Grid / List */}
        <div className="p-5 flex-1 overflow-y-auto">
          {isLoading && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 text-xs">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              <span>Fetching files from Google Drive...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 text-xs text-center">
              <Cloud className="w-10 h-10 mb-2 text-neutral-600 stroke-[1.5]" />
              <p className="font-semibold text-neutral-300 mb-1">No matching files found in Drive</p>
              <p className="max-w-xs text-neutral-500 mb-4">
                Upload your current PixelLab artwork or project to Google Drive using the buttons above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFiles.map((file) => {
                const isProject = file.name.endsWith('.json');
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (isProject) {
                        handleOpenDriveProject(file);
                      } else {
                        handleImportDriveImage(file);
                      }
                    }}
                    className="group relative p-3 rounded-lg bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {file.thumbnailLink ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : isProject ? (
                        <FolderOpen className="w-6 h-6 text-amber-400" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {isProject ? 'PixelLab Project' : 'Image File'} ·{' '}
                        {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : ''}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-medium mt-1">
                        {isProject ? 'Load Project →' : 'Import as Layer →'}
                      </div>
                    </div>

                    {/* Delete file button (triggers explicit confirmation dialog) */}
                    <button
                      onClick={(e) => handleDeleteFile(file, e)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete from Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
