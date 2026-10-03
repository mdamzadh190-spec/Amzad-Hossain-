import React, { useState } from 'react';
import {
  Bookmark,
  FolderOpen,
  Layout,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { TemplateItem, TEMPLATES_LIBRARY } from '../../data/templates';
import { CanvasConfig, Layer, ProjectData } from '../../types/pixellab';

interface TemplatesPanelProps {
  currentCanvasConfig: CanvasConfig;
  currentLayers: Layer[];
  onLoadTemplate: (template: TemplateItem) => void;
  onLoadProject: (project: ProjectData) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  currentCanvasConfig,
  currentLayers,
  onLoadTemplate,
  onLoadProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>(() => {
    try {
      const data = localStorage.getItem('pixellab_saved_projects');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const categories = ['All', 'YouTube', '3D Text', 'Social & Promo', 'Quotes & Posters', 'My Projects'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? TEMPLATES_LIBRARY
      : TEMPLATES_LIBRARY.filter((t) => t.category === selectedCategory);

  const handleSaveCurrentProject = () => {
    const projectName = prompt('Enter a name for this project:', 'My PixelLab Design') || 'Untitled Project';
    const newProject: ProjectData = {
      id: `proj_${Date.now()}`,
      name: projectName,
      updatedAt: Date.now(),
      canvasConfig: currentCanvasConfig,
      layers: currentLayers,
    };
    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    try {
      localStorage.setItem('pixellab_saved_projects', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setSelectedCategory('My Projects');
  };

  const handleDeleteSavedProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('pixellab_saved_projects', JSON.stringify(updated));
  };

  return (
    <div className="h-56 bg-neutral-900 border-t border-neutral-800 flex flex-col">
      {/* Category Pills & Save Project Button */}
      <div className="h-10 border-b border-neutral-800/80 px-3 flex items-center justify-between bg-neutral-950/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleSaveCurrentProject}
          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-xs font-semibold rounded-md border border-neutral-700 shrink-0 ml-2"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Save Project</span>
        </button>
      </div>

      {/* Grid of Templates / Projects */}
      <div className="flex-1 p-3 overflow-y-auto">
        {selectedCategory === 'My Projects' ? (
          savedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 text-xs">
              <FolderOpen className="w-8 h-8 mb-1 stroke-1 text-neutral-600" />
              <p>No saved projects yet.</p>
              <button
                onClick={handleSaveCurrentProject}
                className="mt-2 text-cyan-400 hover:underline font-medium"
              >
                Save current design
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onLoadProject(p)}
                  className="group relative p-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 hover:border-cyan-500/60 cursor-pointer transition-all shadow"
                >
                  <div className="text-xs font-bold text-white truncate mb-1">{p.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {p.canvasConfig.width} × {p.canvasConfig.height} · {p.layers.length} layers
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-2">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => handleDeleteSavedProject(p.id, e)}
                    className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Saved Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => onLoadTemplate(t)}
                className="group relative rounded-lg border border-neutral-700/80 hover:border-cyan-400 p-2.5 text-left transition-all hover:scale-[1.02] shadow overflow-hidden flex flex-col justify-between min-h-[90px]"
                style={{ background: t.previewBg }}
              >
                <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-cyan-300 self-start">
                  {t.category}
                </div>
                <div>
                  <div className="text-xs font-bold text-white drop-shadow truncate">{t.title}</div>
                  <div className="text-[10px] text-neutral-300 font-mono">
                    {t.canvasConfig.width} × {t.canvasConfig.height}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
