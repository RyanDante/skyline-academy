import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { SkylineLogo } from './brand/SkylineLogo';
import {
  Bell,
  Settings,
  Clock,
  CheckCheck,
  UserCheck,
  DownloadCloud,
  Award,
  Flame,
  BookOpen,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { AuthModal } from './auth/AuthModal';

export const BrandHeader: React.FC = () => {
  const {
    profile,
    settings,
    setShowSettingsModal,
    triggerStudyReminder,
    notificationsList,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setActiveTab,
  } = useAppStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const hasPass = profile.plan === 'pass';
  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'signin':
        return <UserCheck className="w-3.5 h-3.5 text-[#00B8B0]" />;
      case 'download':
        return <DownloadCloud className="w-3.5 h-3.5 text-blue-500" />;
      case 'pass_unlocked':
        return <Award className="w-3.5 h-3.5 text-[#FF8A00]" />;
      case 'streak':
        return <Flame className="w-3.5 h-3.5 text-[#FF8A00] fill-current" />;
      case 'daily_goal':
        return <Clock className="w-3.5 h-3.5 text-[#00B8B0]" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#F5FAFA]/95 dark:bg-[#091113]/95 backdrop-blur-md border-b border-[#D5EAE9] dark:border-[#263A3E] px-4 py-3 transition-colors">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <SkylineLogo size="sm" />

          {/* User Profile, Notifications & Settings */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Student Avatar & Greeting */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 text-left group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B8B0] to-[#087F7A] text-white flex items-center justify-center font-display font-bold text-xs ring-2 ring-[#00B8B0]/30 shadow-xs">
                  {profile.name.charAt(0)}
                </div>
                {hasPass && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#FF8A00] rounded-full border-2 border-white dark:border-[#121D20] flex items-center justify-center text-[7px] text-white font-bold">
                    ★
                  </span>
                )}
              </div>

              <div className="hidden sm:block">
                <div className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] font-medium leading-none">
                  Welcome back,
                </div>
                <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] group-hover:text-[#00B8B0] transition-colors leading-tight">
                  {profile.name}
                </div>
              </div>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-[#121D20] text-[#173A43] dark:text-[#EDF3F4] hover:text-[#00B8B0] border border-[#D5EAE9] dark:border-[#263A3E] transition-colors relative"
                title="Notifications & Study Reminders"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FF8A00] text-white font-display font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#F5FAFA] dark:ring-[#091113]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] rounded-3xl shadow-2xl p-4 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-3 max-h-[82vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5EAE9] dark:border-[#263A3E]">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#00B8B0]" />
                      <span className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                        Notifications & Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#00B8B0]/15 text-[#00B8B0] px-1.5 py-0.2 rounded-md font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-[#00B8B0] hover:underline font-semibold flex items-center gap-0.5"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification List Scrollable Area */}
                  <div className="space-y-2 overflow-y-auto flex-1 pr-0.5 max-h-72">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#55737B] dark:text-[#A8B6BA]">
                        No notifications right now.
                      </div>
                    ) : (
                      notificationsList.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.actionTab) {
                              setActiveTab(notif.actionTab);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1 ${
                            !notif.read
                              ? 'bg-[#EAFBF9] dark:bg-[#152B2E] border-[#00B8B0]/40'
                              : 'bg-[#F5FAFA] dark:bg-[#0B1618] border-[#D5EAE9] dark:border-[#263A3E] hover:border-[#00B8B0]/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white dark:bg-[#121D20] flex items-center justify-center shadow-2xs shrink-0">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <span
                                className={`text-xs leading-tight ${
                                  !notif.read
                                    ? 'font-bold text-[#173A43] dark:text-[#EDF3F4]'
                                    : 'font-semibold text-[#55737B] dark:text-[#A8B6BA]'
                                }`}
                              >
                                {notif.title}
                              </span>
                            </div>

                            <span className="text-[9px] font-mono text-[#55737B] dark:text-[#A8B6BA] shrink-0">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] leading-snug pl-8">
                            {notif.message}
                          </p>

                          {notif.actionTab && (
                            <div className="pl-8 pt-0.5 flex items-center gap-1 text-[10px] font-bold text-[#00B8B0]">
                              <span>View in {notif.actionTab.toUpperCase()}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 border-t border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setShowSettingsModal(true);
                      }}
                      className="text-[11px] text-[#00B8B0] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Reminder Settings</span>
                    </button>

                    {notificationsList.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Clear all</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Gear Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-full hover:bg-white dark:hover:bg-[#121D20] text-[#173A43] dark:text-[#EDF3F4] hover:text-[#00B8B0] border border-[#D5EAE9] dark:border-[#263A3E] transition-colors"
              title="Settings (Theme, Reminders, Data Mode)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
