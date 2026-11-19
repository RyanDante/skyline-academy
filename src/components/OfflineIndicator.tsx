import React, { useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, HardDrive, Check, X } from 'lucide-react';
import { offlineStorage } from '@/services/offlineStorage';

export const OfflineIndicator: React.FC<{
  onOpenOfflineMaterials?: () => void;
}> = ({ onOpenOfflineMaterials }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  const { cachedPapersCount, cachedMaterialsCount } = offlineStorage.getStorageUsage();

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-3 bg-[#121D20] text-white border border-[#00B8B0]/40 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/20 text-[#00B8B0] flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-white">
              <span>Offline Mode Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-[#A8B6BA] mt-0.5">
              Accessing {cachedPapersCount} papers & {cachedMaterialsCount} revision guides locally.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenOfflineMaterials && (
            <button
              onClick={onOpenOfflineMaterials}
              className="px-2.5 py-1 bg-[#00B8B0] hover:bg-[#087F7A] text-white text-[10px] font-bold rounded-lg transition-colors shrink-0"
            >
              Browse
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#A8B6BA] hover:text-white rounded-lg transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
