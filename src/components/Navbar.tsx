import React, { memo } from 'react';
import { Home, LayoutGrid, Compass, GraduationCap, User } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export const Navbar: React.FC = memo(() => {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gce', label: 'GCE', icon: LayoutGrid },
    { id: 'concours', label: 'Concours', icon: Compass },
    { id: 'tutor', label: 'Tutor', icon: GraduationCap },
    { id: 'me', label: 'Me', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#F5FAFA]/95 dark:bg-[#091113]/95 backdrop-blur-md border-t border-[#D5EAE9] dark:border-[#263A3E] z-30 shadow-lg md:static md:border-t-0 md:bg-transparent md:shadow-none transition-colors">
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-colors relative group"
            >
              {/* Turquoise active indicator */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 rounded-full bg-[#00B8B0]" />
              )}

              <div
                className={`p-1 rounded-full transition-all ${
                  isActive
                    ? 'scale-110 text-[#00B8B0]'
                    : 'text-[#55737B] dark:text-[#A8B6BA] group-hover:text-[#173A43] dark:group-hover:text-[#EDF3F4]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span
                className={`text-[11px] transition-colors ${
                  isActive
                    ? 'text-[#00B8B0] font-bold'
                    : 'text-[#55737B] dark:text-[#A8B6BA] font-medium group-hover:text-[#173A43] dark:group-hover:text-[#EDF3F4]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
