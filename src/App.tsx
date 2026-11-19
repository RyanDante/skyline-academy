import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { useDailyReminder } from '@/hooks/useDailyReminder';
import { BrandHeader } from '@/components/BrandHeader';
import { Navbar } from '@/components/Navbar';
import { HomeScreen } from '@/screens/HomeScreen';
import { GceScreen } from '@/screens/GceScreen';
import { ConcoursScreen } from '@/screens/ConcoursScreen';
import { TutorScreen } from '@/screens/TutorScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { QuizModal } from '@/components/QuizModal';
import { PaperDetailModal } from '@/components/PaperDetailModal';
import { InstitutionDetailModal } from '@/components/InstitutionDetailModal';
import { SkylerQuizModal } from '@/components/SkylerQuizModal';
import { PaywallModal } from '@/components/PaywallModal';
import { WhatsAppLeadModal } from '@/components/WhatsAppLeadModal';
import { SplashScreen } from '@/components/SplashScreen';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { InAppNotificationBanner } from '@/components/notifications/InAppNotificationBanner';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { OfflineMaterialsModal } from '@/components/study/OfflineMaterialsModal';
import { offlineStorage } from '@/services/offlineStorage';
import type { Paper, Institution } from '@/types/models';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    showSkylerModal,
    setShowSkylerModal,
    showSettingsModal,
    setShowSettingsModal,
    setSelectedSubjectId,
  } = useAppStore();

  // Initialize theme synchronization (Light, Dark, System Default)
  useTheme();

  // Initialize daily study goal reminder scheduler
  useDailyReminder();

  // 1. Service Worker Registration for Offline Support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('[Skyline SW] Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.warn('[Skyline SW] Service Worker registration failed:', error);
        }
      };

      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  // 2. Local Storage Caching Mechanism for Past Papers and Study Materials
  useEffect(() => {
    // Seed and synchronize local storage cache with offline formula sheets and starter past papers
    offlineStorage.initDefaultOfflineMaterials();
  }, []);

  const [showSplash, setShowSplash] = useState(false);
  const [showOfflineMaterials, setShowOfflineMaterials] = useState(false);

  // Active modal states
  const [activeQuizParams, setActiveQuizParams] = useState<{
    subjectId?: string;
    topicId?: string;
    paperId?: string;
    difficulty?: number;
  } | null>(null);

  const [inspectingPaper, setInspectingPaper] = useState<Paper | null>(null);
  const [inspectingInstitution, setInspectingInstitution] = useState<Institution | null>(null);

  const handleStartQuiz = (subjectId?: string, topicId?: string, paperId?: string, difficulty?: number) => {
    setActiveQuizParams({ subjectId, topicId, paperId, difficulty });
  };

  return (
    <div className="min-h-screen bg-[#F5FAFA] dark:bg-[#091113] text-[#173A43] dark:text-[#EDF3F4] flex flex-col justify-between selection:bg-[#00B8B0]/20 font-body transition-colors">
      {/* Floating In-App Notification & Study Goal Reminder Banner */}
      <InAppNotificationBanner onStartQuiz={() => handleStartQuiz()} />

      {/* Connectivity & Offline State Indicator */}
      <OfflineIndicator onOpenOfflineMaterials={() => setShowOfflineMaterials(true)} />

      {/* Top Brand Header */}
      <BrandHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-3">
        {activeTab === 'home' && (
          <HomeScreen
            onStartQuiz={(subjectId) => handleStartQuiz(subjectId)}
          />
        )}

        {activeTab === 'gce' && (
          <GceScreen
            onOpenPaper={(paper) => setInspectingPaper(paper)}
            onStartQuiz={(subId, topId) => handleStartQuiz(subId, topId)}
          />
        )}

        {activeTab === 'concours' && (
          <ConcoursScreen
            onSelectInstitution={(inst) => setInspectingInstitution(inst)}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorScreen
            onStartTopicQuiz={(subId, topId, diff) => handleStartQuiz(subId, topId, undefined, diff)}
          />
        )}

        {activeTab === 'me' && (
          <ProfileScreen
            onStartQuiz={(subId) => handleStartQuiz(subId)}
            onOpenOfflineMaterials={() => setShowOfflineMaterials(true)}
          />
        )}
      </main>

      {/* Bottom Tab Navigation */}
      <Navbar />

      {/* Modals & Dialogs */}
      {showSplash && (
        <SplashScreen onDismiss={() => setShowSplash(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showOfflineMaterials && (
        <OfflineMaterialsModal
          isOpen={showOfflineMaterials}
          onClose={() => setShowOfflineMaterials(false)}
          onStartQuiz={(paperId) => {
            setShowOfflineMaterials(false);
            handleStartQuiz(undefined, undefined, paperId);
          }}
        />
      )}

      {activeQuizParams && (
        <QuizModal
          subjectId={activeQuizParams.subjectId}
          topicId={activeQuizParams.topicId}
          paperId={activeQuizParams.paperId}
          difficulty={activeQuizParams.difficulty}
          onClose={() => setActiveQuizParams(null)}
          onStartNextQuiz={(nextSubId, nextTopId, nextDiff) => {
            setActiveQuizParams({
              subjectId: nextSubId,
              topicId: nextTopId,
              difficulty: nextDiff,
            });
          }}
        />
      )}

      {inspectingPaper && (
        <PaperDetailModal
          paper={inspectingPaper}
          onClose={() => setInspectingPaper(null)}
          onStartQuiz={(paperId) => handleStartQuiz(undefined, undefined, paperId)}
        />
      )}

      {inspectingInstitution && (
        <InstitutionDetailModal
          institution={inspectingInstitution}
          onClose={() => setInspectingInstitution(null)}
          onFocusTopic={(subId, topId) => handleStartQuiz(subId, topId)}
        />
      )}

      {showSkylerModal && (
        <SkylerQuizModal onClose={() => setShowSkylerModal(false)} />
      )}

      <PaywallModal />
      <WhatsAppLeadModal />
    </div>
  );
};

export default App;
