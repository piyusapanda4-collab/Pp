import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ATHLETE, 
  INITIAL_DEVICES, 
  INITIAL_TELEMETRY, 
  INITIAL_DAILY_SCORES, 
  INITIAL_SLEEP_DATA, 
  INITIAL_WORKOUTS 
} from './data/mockWearables';
import { 
  AthleteProfile, 
  WearableDevice, 
  BiometricTelemetry, 
  DailyScores, 
  SleepData, 
  WorkoutSession,
  LiveStreamPacket
} from './types/fitness';
import { WearableSyncService } from './services/wearableSync';
import { TopNav, ActiveTab } from './components/TopNav';
import { VitalsDashboard } from './components/VitalsDashboard';
import { WorkoutTracker } from './components/WorkoutTracker';
import { BiometricsSleepView } from './components/BiometricsSleepView';
import { WearableDevicesView } from './components/WearableDevicesView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { AddWorkoutModal } from './components/AddWorkoutModal';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistent or stateful data
  const [athlete, setAthlete] = useState<AthleteProfile>(() => {
    const saved = localStorage.getItem('pulseflow_athlete');
    return saved ? JSON.parse(saved) : INITIAL_ATHLETE;
  });

  const [devices, setDevices] = useState<WearableDevice[]>(() => {
    const saved = localStorage.getItem('pulseflow_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [telemetry, setTelemetry] = useState<BiometricTelemetry>(INITIAL_TELEMETRY);
  const [scores, setScores] = useState<DailyScores>(INITIAL_DAILY_SCORES);
  const [sleep, setSleep] = useState<SleepData>(INITIAL_SLEEP_DATA);

  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('pulseflow_workouts');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pulseflow_athlete', JSON.stringify(athlete));
  }, [athlete]);

  useEffect(() => {
    localStorage.setItem('pulseflow_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('pulseflow_workouts', JSON.stringify(workouts));
  }, [workouts]);

  // Subscribe to live telemetry stream from primary device
  useEffect(() => {
    const unsubscribe = WearableSyncService.subscribeToTelemetry((packet: LiveStreamPacket) => {
      setTelemetry((prev) => ({
        ...prev,
        currentBpm: packet.heartRate,
        stepsCount: prev.stepsCount + Math.floor(Math.random() * 2),
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const primaryDevice = devices.find((d) => d.isPrimary) || devices[0];

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  // Sync individual wearable device
  const handleSyncSingle = async (device: WearableDevice) => {
    setIsSyncingId(device.id);
    const { syncedDevice, addedCalories, addedSteps } = await WearableSyncService.executeDeviceSync(
      device,
      (_percent, _status) => {}
    );

    setDevices((prev) => prev.map((d) => (d.id === device.id ? syncedDevice : d)));
    setTelemetry((prev) => ({
      ...prev,
      activeCalories: prev.activeCalories + addedCalories,
      totalCalories: prev.totalCalories + addedCalories,
      stepsCount: prev.stepsCount + addedSteps,
    }));
    setIsSyncingId(null);
    showToast(`${device.name} synchronized successfully (${addedSteps} steps, ${addedCalories} kcal imported).`);
  };

  // Sync all connected wearables
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    showToast('Initiating encrypted synchronization with active wearable fleet...');

    await new Promise((r) => setTimeout(r, 1400));

    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        lastSyncedAt: 'Just now',
        totalDataPointsCollected: d.totalDataPointsCollected + 1440,
        batteryPercentage: Math.max(15, d.batteryPercentage - 1),
      }))
    );

    setTelemetry((prev) => ({
      ...prev,
      activeCalories: prev.activeCalories + 28,
      totalCalories: prev.totalCalories + 28,
      stepsCount: prev.stepsCount + 140,
      hrvRmssd: 68,
    }));

    setIsSyncingAll(false);
    setIsSyncModalOpen(false);
    showToast('All wearable data packets received and normalized into unified vitals.');
  };

  // Toggle device connection status
  const handleToggleConnection = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const newStatus = d.connectionStatus === 'connected' ? 'disconnected' : 'connected';
          return { ...d, connectionStatus: newStatus };
        }
        return d;
      })
    );
  };

  // Set primary wearable device
  const handleSetPrimary = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        isPrimary: d.id === deviceId,
      }))
    );
    const dev = devices.find((d) => d.id === deviceId);
    if (dev) {
      showToast(`${dev.name} set as primary biometric stream source.`);
    }
  };

  // Add new paired BLE device
  const handleAddNewDevice = (newDevice: WearableDevice) => {
    setDevices((prev) => [newDevice, ...prev]);
    showToast(`New wearable device paired: ${newDevice.name}`);
  };

  // Save completed workout session
  const handleSaveWorkout = (newWorkout: WorkoutSession) => {
    setWorkouts((prev) => [newWorkout, ...prev]);
    setTelemetry((prev) => ({
      ...prev,
      activeCalories: prev.activeCalories + newWorkout.activeKcal,
      totalCalories: prev.totalCalories + newWorkout.activeKcal,
      activeMinutes: prev.activeMinutes + Math.round(newWorkout.durationSeconds / 60),
    }));
    setScores((prev) => ({
      ...prev,
      strainScore: Math.min(21.0, +(prev.strainScore + newWorkout.trainingLoadStrain * 0.4).toFixed(1)),
    }));
    showToast(`Workout "${newWorkout.title}" saved. Day strain updated.`);
  };

  // Reset to pristine sample data
  const handleResetData = () => {
    if (window.confirm('Reset all fitness telemetry and device records to default demo state?')) {
      localStorage.removeItem('pulseflow_athlete');
      localStorage.removeItem('pulseflow_devices');
      localStorage.removeItem('pulseflow_workouts');
      setAthlete(INITIAL_ATHLETE);
      setDevices(INITIAL_DEVICES);
      setWorkouts(INITIAL_WORKOUTS);
      setTelemetry(INITIAL_TELEMETRY);
      setScores(INITIAL_DAILY_SCORES);
      setSleep(INITIAL_SLEEP_DATA);
      showToast('Telemetry and wearable records reset to factory defaults.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {/* Top Bar following contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        primaryDevice={primaryDevice}
        isSyncingAll={isSyncingAll}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Viewport Container (1440px max-width) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <VitalsDashboard
            telemetry={telemetry}
            scores={scores}
            sleep={sleep}
            workouts={workouts}
            athlete={athlete}
            primaryDevice={primaryDevice}
            onNavigateToWorkout={() => setActiveTab('workout')}
            onNavigateToDevices={() => setActiveTab('wearables')}
            onNavigateToBiometrics={() => setActiveTab('biometrics')}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutTracker
            workouts={workouts}
            athlete={athlete}
            primaryDevice={primaryDevice}
            onSaveWorkout={handleSaveWorkout}
            onOpenManualModal={() => setIsAddWorkoutModalOpen(true)}
          />
        )}

        {activeTab === 'biometrics' && (
          <BiometricsSleepView
            sleep={sleep}
            telemetry={telemetry}
            scores={scores}
            athlete={athlete}
          />
        )}

        {activeTab === 'wearables' && (
          <WearableDevicesView
            devices={devices}
            onSetPrimary={handleSetPrimary}
            onSyncDevice={handleSyncSingle}
            onToggleConnection={handleToggleConnection}
            onOpenPairModal={() => setIsSyncModalOpen(true)}
            isSyncingId={isSyncingId}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettingsView
            athlete={athlete}
            workouts={workouts}
            sleep={sleep}
            telemetry={telemetry}
            onUpdateAthlete={setAthlete}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Floating System Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0B1220] border border-emerald-500/40 text-slate-100 rounded-xl shadow-2xl text-xs font-medium animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Modals */}
      <DeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        devices={devices}
        onSyncAll={handleSyncAll}
        onSyncSingle={handleSyncSingle}
        onAddNewDevice={handleAddNewDevice}
        isSyncingAll={isSyncingAll}
      />

      <AddWorkoutModal
        isOpen={isAddWorkoutModalOpen}
        onClose={() => setIsAddWorkoutModalOpen(false)}
        onAddWorkout={handleSaveWorkout}
      />
    </div>
  );
}
