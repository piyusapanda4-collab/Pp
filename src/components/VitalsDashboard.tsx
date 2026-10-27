import React from 'react';
import { 
  Flame, 
  Footprints, 
  Timer, 
  Compass, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Moon, 
  Heart,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  BiometricTelemetry, 
  DailyScores, 
  SleepData, 
  WorkoutSession, 
  AthleteProfile, 
  WearableDevice 
} from '../types/fitness';
import { LiveHeartRateMonitor } from './LiveHeartRateMonitor';

interface VitalsDashboardProps {
  telemetry: BiometricTelemetry;
  scores: DailyScores;
  sleep: SleepData;
  workouts: WorkoutSession[];
  athlete: AthleteProfile;
  primaryDevice?: WearableDevice;
  onNavigateToWorkout: () => void;
  onNavigateToDevices: () => void;
  onNavigateToBiometrics: () => void;
}

export const VitalsDashboard: React.FC<VitalsDashboardProps> = ({
  telemetry,
  scores,
  sleep,
  workouts,
  athlete,
  primaryDevice,
  onNavigateToWorkout,
  onNavigateToDevices,
  onNavigateToBiometrics,
}) => {
  // Activity ring percentage calculations
  const kcalPercent = Math.min(100, Math.round((telemetry.activeCalories / athlete.targets.dailyActiveKcal) * 100));
  const stepsPercent = Math.min(100, Math.round((telemetry.stepsCount / athlete.targets.dailySteps) * 100));
  const activeMinsPercent = Math.min(100, Math.round((telemetry.activeMinutes / athlete.targets.dailyActiveMinutes) * 100));
  const standPercent = Math.min(100, Math.round((telemetry.standHours / 12) * 100));

  return (
    <div className="space-y-6 pb-20">
      {/* Top Athlete & Connected Device Header Strip */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={athlete.avatarUrl}
            alt={athlete.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-700/80 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{athlete.name}</h1>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-medium">{athlete.athleteType}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>VO₂ Max: <strong className="text-slate-200 font-mono tabular-nums">{telemetry.vo2MaxEstimate}</strong> ml/kg/min</span>
              <span>·</span>
              <span>RHR Baseline: <strong className="text-slate-200 font-mono tabular-nums">{athlete.restingHrBaseline}</strong> bpm</span>
            </div>
          </div>
        </div>

        {/* Primary Wearable Device Chip */}
        {primaryDevice && (
          <button
            onClick={onNavigateToDevices}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/60 shrink-0">
              {primaryDevice.image ? (
                <img src={primaryDevice.image} alt={primaryDevice.name} className="w-full h-full object-cover" />
              ) : (
                <Cpu className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="pr-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Primary Source</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-slate-300">{primaryDevice.batteryPercentage}% Batt</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {primaryDevice.name}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          </button>
        )}
      </div>

      {/* Daily Triad: Readiness, Strain, Sleep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Readiness Card */}
        <div 
          onClick={onNavigateToBiometrics}
          className="bg-[#0D131F] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-slate-400">Recovery & Readiness</span>
            <span className="text-emerald-400 font-medium">Optimal</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white font-mono tabular-nums tracking-tight">
              {scores.readinessScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Parasympathetic tone is elevated. Resting HR is 49 bpm (-2 bpm vs baseline) and HRV is 68 ms (+18%). Full capacity for load.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>HRV: <strong className="text-emerald-400 font-mono tabular-nums">68 ms</strong></span>
            <span>·</span>
            <span>Sleep: <strong className="text-slate-200 font-mono tabular-nums">7h 42m</strong></span>
            <span>·</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Deep View <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Day Strain Card */}
        <div 
          onClick={onNavigateToWorkout}
          className="bg-[#0D131F] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-slate-400">Day Strain Index</span>
            <span className="text-sky-400 font-medium">In Target Zone</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white font-mono tabular-nums tracking-tight">
              {scores.strainScore.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 21.0</span>
          </div>
          {/* Strain Progress Track */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(scores.strainScore / 21) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Target Window: <strong className="text-slate-200 font-mono tabular-nums">{scores.strainTargetMin}–{scores.strainTargetMax}</strong></span>
            <span>{Math.round(((scores.strainScore - scores.strainTargetMin) / (scores.strainTargetMax - scores.strainTargetMin)) * 100)}% of target</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Burned: <strong className="text-white font-mono tabular-nums">{telemetry.activeCalories}</strong> kcal</span>
            <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Start Workout <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Sleep Score Card */}
        <div 
          onClick={onNavigateToBiometrics}
          className="bg-[#0D131F] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-slate-400">Sleep Performance</span>
            <span className="text-indigo-400 font-medium">93% Efficiency</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white font-mono tabular-nums tracking-tight">
              {scores.sleepScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            7h 42m restorative rest. Deep + REM stages accounted for 48% of total duration (222 mins). Low wake latency.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deep: <strong className="text-indigo-400 font-mono tabular-nums">1h 44m</strong></span>
            <span>·</span>
            <span>REM: <strong className="text-violet-400 font-mono tabular-nums">1h 58m</strong></span>
            <span>·</span>
            <span>Debt: <strong className="text-slate-300 font-mono tabular-nums">{sleep.sleepDebtMinutes}m</strong></span>
          </div>
        </div>
      </div>

      {/* Live Biometric Waveform & Real-Time Monitor */}
      <LiveHeartRateMonitor telemetry={telemetry} athlete={athlete} />

      {/* 4 Activity Metric Rings / Targets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Calories */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Burn</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {telemetry.activeCalories}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {athlete.targets.dailyActiveKcal} kcal</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${kcalPercent}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono tabular-nums">
            <span>{kcalPercent}% of daily goal</span>
            <span>+{athlete.targets.dailyActiveKcal - telemetry.activeCalories} left</span>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Daily Steps</span>
            <Footprints className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {telemetry.stepsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {athlete.targets.dailySteps.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stepsPercent}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono tabular-nums">
            <span>{stepsPercent}% target</span>
            <span>~{(telemetry.stepsCount * 0.00078).toFixed(1)} km</span>
          </div>
        </div>

        {/* Active Minutes */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Zone 2+ Minutes</span>
            <Timer className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {telemetry.activeMinutes}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {athlete.targets.dailyActiveMinutes} mins</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full" style={{ width: `${activeMinsPercent}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono tabular-nums">
            <span>{activeMinsPercent}% intensity goal</span>
            <span>Aerobic Engine</span>
          </div>
        </div>

        {/* Stand Hours */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Mobility & Stand</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {telemetry.standHours}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 12 hrs</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${standPercent}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono tabular-nums">
            <span>{standPercent}% mobility</span>
            <span>1 hr to goal</span>
          </div>
        </div>
      </div>

      {/* Algorithmic Coaching & Personalized Recovery Directive */}
      <div className="bg-[#0B101B] border border-slate-800/90 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Personalized Training Directive · Day Strain Target 12.0–15.5
              </h3>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">Algorithmic Biometric Model</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Your autonomic nervous system recovered fully overnight. Resting Heart Rate dialed in at <strong className="text-white">49 bpm</strong>, with an HRV of <strong className="text-emerald-400 font-mono">68 ms</strong> (18% above your 30-day baseline). Skin temperature variance is within healthy homeostasis (+0.18°C).
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="text-slate-300">
                <strong>Recommended Session:</strong> High-output threshold run (45-60 min) or Heavy Compound Strength.
              </span>
              <span>·</span>
              <span className="text-slate-400">
                <strong>Optimal Bedtime Tonight:</strong> 22:30 for 94% recovery.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workouts Stream */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Wearable Activity Sessions</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Automatically synced from paired smart wearables
            </div>
          </div>
          <button
            onClick={onNavigateToWorkout}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Workout Center</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {workouts.slice(0, 3).map((w) => (
            <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-mono text-xs font-bold">
                  {w.sport === 'Trail Run' || w.sport === 'Outdoor Run' ? 'RUN' : w.sport === 'Road Cycling' ? 'BIKE' : 'GYM'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{w.title}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {Math.floor(w.durationSeconds / 60)} mins
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    {w.distanceKm && <span>{w.distanceKm.toFixed(1)} km · </span>}
                    <span>Avg HR: <strong className="text-slate-200 font-mono tabular-nums">{w.avgHeartRate}</strong> bpm</span>
                    <span>·</span>
                    <span>Burned: <strong className="text-slate-200 font-mono tabular-nums">{w.activeKcal}</strong> kcal</span>
                    <span>·</span>
                    <span className="text-slate-500 text-[11px]">{w.syncedFromDeviceName}</span>
                  </div>
                </div>
              </div>

              {/* Strain Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Strain Score</div>
                  <div className="text-sm font-bold text-sky-400 font-mono tabular-nums">
                    {w.trainingLoadStrain.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
