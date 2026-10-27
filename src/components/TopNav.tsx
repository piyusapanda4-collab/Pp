import React from 'react';
import { Activity, RefreshCw, Smartphone, Heart, Moon, User, Dumbbell } from 'lucide-react';
import { WearableDevice } from '../types/fitness';

export type ActiveTab = 'dashboard' | 'workout' | 'biometrics' | 'wearables' | 'profile';

interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  primaryDevice?: WearableDevice;
  isSyncingAll: boolean;
  onOpenSyncModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  primaryDevice,
  isSyncingAll,
  onOpenSyncModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                PulseFlow
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-2 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Today's Vitals
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-2 ${
                activeTab === 'workout'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Live Workout
            </button>
            <button
              onClick={() => setActiveTab('biometrics')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-2 ${
                activeTab === 'biometrics'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Biometrics & Sleep
            </button>
            <button
              onClick={() => setActiveTab('wearables')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-2 ${
                activeTab === 'wearables'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Wearable Devices
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-2 ${
                activeTab === 'profile'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Athlete Profile
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-lg transition-all whitespace-nowrap shrink-0"
              title="Sync Wearable Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncingAll ? 'Syncing...' : 'Sync Devices'}
              </span>
              <span className="sm:hidden">Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar for ergonomic touch navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D14]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 h-16 px-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Vitals</span>
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'workout' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Workout</span>
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'biometrics' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Recovery</span>
        </button>
        <button
          onClick={() => setActiveTab('wearables')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'wearables' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Devices</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Profile</span>
        </button>
      </div>
    </header>
  );
};
