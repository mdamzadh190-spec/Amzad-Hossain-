import React from 'react';
import {
  FolderKanban,
  Layers,
  Palette,
  Shapes,
  Sparkles,
  Type,
} from 'lucide-react';
import { ActiveTab } from '../types/pixellab';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  hasSelectedText: boolean;
  hasSelectedShape: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasSelectedText,
  hasSelectedShape,
}) => {
  const tabs = [
    {
      id: 'presets' as ActiveTab,
      label: 'Templates',
      icon: <FolderKanban className="w-5 h-5" />,
      highlight: false,
    },
    {
      id: 'text' as ActiveTab,
      label: 'Text (A)',
      icon: (
        <span className="font-serif font-black text-lg leading-none tracking-tighter">
          A
        </span>
      ),
      highlight: hasSelectedText,
    },
    {
      id: 'shape' as ActiveTab,
      label: 'Shapes & Draw',
      icon: <Shapes className="w-5 h-5" />,
      highlight: hasSelectedShape,
    },
    {
      id: 'canvas' as ActiveTab,
      label: 'Canvas Size',
      icon: <Palette className="w-5 h-5" />,
      highlight: false,
    },
    {
      id: 'effects' as ActiveTab,
      label: 'Vignette & FX',
      icon: <Sparkles className="w-5 h-5" />,
      highlight: false,
    },
  ];

  return (
    <div className="h-16 border-t border-neutral-800 bg-neutral-900/95 flex items-center justify-around px-2 z-30 select-none shadow-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            {/* Active Top Bar Indicator */}
            {isActive && (
              <span className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            )}

            {/* Context Badge if layer of this type is currently selected */}
            {tab.highlight && !isActive && (
              <span className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            )}

            <div className={`p-1 rounded-md ${isActive ? 'bg-cyan-500/10' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5 truncate max-w-[80px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
