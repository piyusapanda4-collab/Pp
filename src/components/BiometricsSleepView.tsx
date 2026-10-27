import React, { useState } from 'react';
import { 
  Moon, 
  Heart, 
  Activity, 
  ShieldCheck, 
  Wind, 
  Thermometer, 
  Info, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SleepData, BiometricTelemetry, DailyScores, AthleteProfile } from '../types/fitness';
import { SEVEN_DAY_HISTORY } from '../data/mockWearables';

interface BiometricsSleepViewProps {
  sleep: SleepData;
  telemetry: BiometricTelemetry;
  scores: DailyScores;
  athlete: AthleteProfile;
}

export const BiometricsSleepView: React.FC<BiometricsSleepViewProps> = ({
  sleep,
  telemetry,
  scores,
  athlete,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'hrv' | 'rhr' | 'sleep'>('hrv');
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const stageColors = {
    deep: '#6366F1', // Indigo
    rem: '#A855F7',  // Purple / Violet
    core: '#38BDF8', // Sky Blue
    awake: '#F43F5E', // Rose
  };

  const stageLabels = {
    deep: 'Deep Slow-Wave',
    rem: 'Rapid Eye Movement (REM)',
    core: 'Core / Light Sleep',
    awake: 'Awake / Disturbance',
  };

  const totalSleepHours = (sleep.totalSleepMinutes / 60).toFixed(1);
  const deepHours = (sleep.deepSleepMinutes / 60).toFixed(1);
  const remHours = (sleep.remSleepMinutes / 60).toFixed(1);
  const coreHours = (sleep.coreSleepMinutes / 60).toFixed(1);

  const deepPct = Math.round((sleep.deepSleepMinutes / sleep.totalSleepMinutes) * 100);
  const remPct = Math.round((sleep.remSleepMinutes / sleep.totalSleepMinutes) * 100);
  const corePct = Math.round((sleep.coreSleepMinutes / sleep.totalSleepMinutes) * 100);

  return (
    <div className="space-y-6 pb-20">
      {/* Recovery & Autonomic Overview Banner */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Biometric Recovery & Autonomic Tone
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">Wearable Sleep Lab</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Nocturnal Restoration & HRV Analysis
            </h2>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedMetric('hrv')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'hrv' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HRV Trend
            </button>
            <button
              onClick={() => setSelectedMetric('rhr')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'rhr' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resting HR
            </button>
            <button
              onClick={() => setSelectedMetric('sleep')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'sleep' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sleep Scores
            </button>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {selectedMetric === 'hrv' ? 'Heart Rate Variability (rMSSD in ms)' : selectedMetric === 'rhr' ? 'Resting Heart Rate (BPM)' : 'Nightly Sleep Quality Score'}
              </span>
              <span className="text-slate-500">· 7-Day Historical Wearable Log</span>
            </div>
            <div className="font-mono text-slate-300 tabular-nums">
              {selectedMetric === 'hrv' && '7-Day Avg: 64.9 ms · Baseline: 58.0 ms (+12%)'}
              {selectedMetric === 'rhr' && '7-Day Avg: 49.6 bpm · Baseline: 49.0 bpm'}
              {selectedMetric === 'sleep' && '7-Day Avg Score: 84 / 100'}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
            {SEVEN_DAY_HISTORY.map((item, idx) => {
              const val = selectedMetric === 'hrv' ? item.hrv : selectedMetric === 'rhr' ? item.rhr : item.sleepScore;
              const maxVal = selectedMetric === 'hrv' ? 80 : selectedMetric === 'rhr' ? 65 : 100;
              const heightPct = Math.round((val / maxVal) * 100);
              const isToday = idx === SEVEN_DAY_HISTORY.length - 1;

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 group-hover:text-white transition-colors">
                    {val}
                  </span>
                  <div
                    className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-700/60 group-hover:bg-slate-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className={`text-[11px] font-medium ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sleep Architecture Hypnogram */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Sleep Stage Architecture (Hypnogram)</h3>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-indigo-400 font-mono tabular-nums">
                {sleep.bedTime} to {sleep.wakeTime} ({totalSleepHours} hrs)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Time-series hypnogram derived from 3-axis accelerometer and PPG pulse rate variability
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="text-slate-400">Efficiency: <strong className="text-emerald-400 font-bold">{sleep.sleepEfficiencyPercent}%</strong></span>
            <span className="text-slate-400">Latency: <strong className="text-slate-200">12 mins</strong></span>
            <span className="text-slate-400">Sleep Debt: <strong className="text-amber-400">{sleep.sleepDebtMinutes}m</strong></span>
          </div>
        </div>

        {/* Hypnogram Stage Blocks */}
        <div className="mt-6">
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
            <span>Sleep Timeline Progression</span>
            <span>Hover segments for stage details</span>
          </div>

          {/* Interactive Multi-segment Timeline Bar */}
          <div className="w-full h-10 rounded-xl overflow-hidden flex bg-slate-900 border border-slate-800 p-0.5">
            {sleep.segments.map((seg, i) => {
              const widthPct = (seg.durationMinutes / sleep.timeInBedMinutes) * 100;
              const isHovered = hoveredSegment === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredSegment(i)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: stageColors[seg.stage],
                    opacity: hoveredSegment === null || isHovered ? 1 : 0.6,
                  }}
                  className="h-full relative group cursor-pointer transition-opacity border-r border-slate-900/40"
                />
              );
            })}
          </div>

          {/* Timeline Time Labels */}
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 px-1">
            <span>22:45 (Bedtime)</span>
            <span>01:00</span>
            <span>03:15</span>
            <span>05:30</span>
            <span>07:00 (Wake)</span>
          </div>

          {/* Hovered Segment Detail Callout */}
          {hoveredSegment !== null && (
            <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stageColors[sleep.segments[hoveredSegment].stage] }}
                />
                <span className="font-semibold text-white">
                  {stageLabels[sleep.segments[hoveredSegment].stage]}
                </span>
              </div>
              <div className="font-mono text-slate-300 tabular-nums">
                Duration: {sleep.segments[hoveredSegment].durationMinutes} mins · Starts at +{sleep.segments[hoveredSegment].startMinutesFromBed}m into sleep
              </div>
            </div>
          )}
        </div>

        {/* Sleep Stage Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Deep Sleep */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-indigo-400">Deep (Slow Wave)</span>
              <span className="font-mono text-indigo-300 tabular-nums">{deepPct}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1.5">
              {deepHours} <span className="text-xs font-normal text-slate-400">hrs ({sleep.deepSleepMinutes}m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Muscle repair, cellular rebuilding, and human growth hormone release. Optimal range: 15–25%.
            </p>
          </div>

          {/* REM Sleep */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-violet-400">REM Sleep</span>
              <span className="font-mono text-violet-300 tabular-nums">{remPct}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1.5">
              {remHours} <span className="text-xs font-normal text-slate-400">hrs ({sleep.remSleepMinutes}m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Memory consolidation, emotional equilibrium, and neuroplasticity. Optimal range: 20–25%.
            </p>
          </div>

          {/* Core Sleep */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-sky-400">Core / Light</span>
              <span className="font-mono text-sky-300 tabular-nums">{corePct}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1.5">
              {coreHours} <span className="text-xs font-normal text-slate-400">hrs ({sleep.coreSleepMinutes}m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cardiovascular decompression, body temperature regulation.
            </p>
          </div>

          {/* Awake Time */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-rose-400">Awake / Latency</span>
              <span className="font-mono text-rose-300 tabular-nums">{Math.round((sleep.awakeSleepMinutes / sleep.timeInBedMinutes) * 100)}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1.5">
              {sleep.awakeSleepMinutes} <span className="text-xs font-normal text-slate-400">mins total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Brief micro-arousals (3 total events). Well within healthy limits.
            </p>
          </div>
        </div>
      </div>

      {/* Auxiliary Nocturnal Telemetry: Respiratory & Skin Temperature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Respiratory Rate & SpO2 */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Wind className="w-4 h-4 text-sky-400" />
            <span>Nocturnal Respiration & Blood Oxygen</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400">Avg Respiratory Rate</div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                {sleep.respiratoryRateAvg} <span className="text-xs font-normal text-slate-400">brpm</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">Normal & steady (13–16 brpm)</div>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400">Nighttime Blood O₂ (SpO₂)</div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                {telemetry.spo2Percent}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">Zero desaturation dips</div>
            </div>
          </div>
        </div>

        {/* Skin Temperature Deviation */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Wrist Skin Temperature Baseline</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Baseline Deviation</div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                  +{telemetry.skinTempDeviationCelsius.toFixed(2)}°C
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Inflammatory Marker</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">Optimal Homeostasis</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Measured by multi-channel NTC thermistors throughout slow-wave sleep. No immune response or illness elevation detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
