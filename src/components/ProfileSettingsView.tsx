import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Download, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Save, 
  Check, 
  Heart,
  Target,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { AthleteProfile, WorkoutSession, SleepData, BiometricTelemetry } from '../types/fitness';

interface ProfileSettingsViewProps {
  athlete: AthleteProfile;
  workouts: WorkoutSession[];
  sleep: SleepData;
  telemetry: BiometricTelemetry;
  onUpdateAthlete: (updated: AthleteProfile) => void;
  onResetData: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  athlete,
  workouts,
  sleep,
  telemetry,
  onUpdateAthlete,
  onResetData,
}) => {
  const [formData, setFormData] = useState<AthleteProfile>(athlete);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAthlete(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Export full health report as JSON
  const exportAsJson = () => {
    const reportData = {
      athlete: formData,
      telemetry,
      sleep,
      workouts,
      exportedAt: new Date().toISOString(),
      platform: 'PulseFlow Biometric Health Engine',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PulseFlow_Biometric_Report_${formData.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export workouts as CSV
  const exportWorkoutsCsv = () => {
    const headers = ['Workout ID', 'Sport', 'Title', 'Date', 'Duration (s)', 'Distance (km)', 'Active Kcal', 'Avg HR', 'Max HR', 'Strain Score', 'Source Device'];
    const rows = workouts.map((w) => [
      w.id,
      `"${w.sport}"`,
      `"${w.title}"`,
      w.startTime,
      w.durationSeconds,
      w.distanceKm || '',
      w.activeKcal,
      w.avgHeartRate,
      w.maxHeartRate,
      w.trainingLoadStrain,
      `"${w.syncedFromDeviceName}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PulseFlow_Workouts_${formData.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={formData.avatarUrl}
            alt={formData.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{formData.name}</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">{formData.athleteType}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Physiological Profile & Wearable Targets Customizer
            </div>
          </div>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Profile targets saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Physiological Baselines */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Physiological Baselines</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These baselines are used to calculate real-time Karvonen heart rate zones and training load strain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Athlete Archetype
              </label>
              <select
                value={formData.athleteType}
                onChange={(e) => setFormData({ ...formData, athleteType: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Hybrid Athlete">Hybrid Athlete (Endurance + Strength)</option>
                <option value="Endurance Runner">Endurance Runner (Marathon / Ultra)</option>
                <option value="Strength & Hypertrophy">Strength & Hypertrophy</option>
                <option value="Longevity & Health">Longevity & Metabolic Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Resting Heart Rate (bpm)
              </label>
              <input
                type="number"
                min="35"
                max="90"
                value={formData.restingHrBaseline}
                onChange={(e) => setFormData({ ...formData, restingHrBaseline: +e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Max Recorded Heart Rate (bpm)
              </label>
              <input
                type="number"
                min="140"
                max="220"
                value={formData.maxHrRecorded}
                onChange={(e) => setFormData({ ...formData, maxHrRecorded: +e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Daily Target Goals */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Daily & Weekly Activity Targets</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized thresholds monitored across connected wearable sensors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Active Calories Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Daily Active Calorie Target</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {formData.targets.dailyActiveKcal} kcal
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="1500"
                step="50"
                value={formData.targets.dailyActiveKcal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targets: { ...formData.targets, dailyActiveKcal: +e.target.value },
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Daily Steps Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Daily Step Target</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {formData.targets.dailySteps.toLocaleString()} steps
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={formData.targets.dailySteps}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targets: { ...formData.targets, dailySteps: +e.target.value },
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Nightly Sleep Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Target Sleep Duration</span>
                <span className="font-mono text-indigo-400 font-bold tabular-nums">
                  {formData.targets.nightlySleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="6.0"
                max="10.0"
                step="0.5"
                value={formData.targets.nightlySleepHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targets: { ...formData.targets, nightlySleepHours: +e.target.value },
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Weekly Zone 2 Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">Weekly Zone 2 Aerobic Base Target</span>
                <span className="font-mono text-sky-400 font-bold tabular-nums">
                  {formData.targets.weeklyZone2Hours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={formData.targets.weeklyZone2Hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targets: { ...formData.targets, weeklyZone2Hours: +e.target.value },
                  })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* Export & Data Management */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
        <div className="pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Biometric Telemetry & Data Export</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Export raw and analyzed physiological data for physicians, endurance coaches, or third-party analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <button
            onClick={exportAsJson}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                Export Complete JSON Report
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Full telemetry, hypnogram, and workout routes
              </div>
            </div>
          </button>

          <button
            onClick={exportWorkoutsCsv}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-sky-400 transition-colors">
                Export Workouts CSV
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Spreadsheet ready format with strain and HR
              </div>
            </div>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-900/60 text-left transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors">
                Reset Demo Data
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Restore pristine sample telemetry and devices
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
