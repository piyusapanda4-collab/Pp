import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Flame, 
  Timer, 
  Navigation, 
  Heart, 
  Activity, 
  CheckCircle2, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  WorkoutSession, 
  WorkoutSport, 
  AthleteProfile, 
  WearableDevice,
  LiveStreamPacket,
  GpsCoordinate
} from '../types/fitness';
import { WearableSyncService } from '../services/wearableSync';
import { GpsRouteMap } from './GpsRouteMap';
import { SAMPLE_GPS_ROUTE } from '../data/mockWearables';

interface WorkoutTrackerProps {
  workouts: WorkoutSession[];
  athlete: AthleteProfile;
  primaryDevice?: WearableDevice;
  onSaveWorkout: (newWorkout: WorkoutSession) => void;
  onOpenManualModal: () => void;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  workouts,
  athlete,
  primaryDevice,
  onSaveWorkout,
  onOpenManualModal,
}) => {
  // Live workout state
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<WorkoutSport>('Trail Run');
  const [sessionTitle, setSessionTitle] = useState<string>('Trail Run Threshold');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentBpm, setCurrentBpm] = useState<number>(142);
  const [currentCadence, setCurrentCadence] = useState<number>(168);
  const [burnedKcal, setBurnedKcal] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(workouts[0]?.id || null);

  const timerRef = useRef<number | null>(null);

  // Live timer tick
  useEffect(() => {
    if (isLiveActive && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Approximate speed for running ~ 11.5 km/h -> ~3.2 m/s
          setDistanceKm((next * 0.00318));
          // Route progress index
          const routeStep = Math.min(SAMPLE_GPS_ROUTE.length - 1, Math.floor((next / 30) % SAMPLE_GPS_ROUTE.length));
          setActiveRouteIndex(routeStep);
          return next;
        });

        // Accumulate active kcal based on current heart rate intensity
        setBurnedKcal((prev) => +(prev + 0.19).toFixed(1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveActive, isPaused]);

  // Subscribe to live telemetry stream during active session
  useEffect(() => {
    if (!isLiveActive) return;

    const unsubscribe = WearableSyncService.subscribeToTelemetry((packet: LiveStreamPacket) => {
      if (!isPaused) {
        setCurrentBpm(packet.heartRate);
        setCurrentCadence(packet.cadence);
      }
    }, true);

    return () => {
      unsubscribe();
    };
  }, [isLiveActive, isPaused]);

  // Formatter for elapsed time
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartWorkout = () => {
    setIsLiveActive(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setBurnedKcal(0);
    setDistanceKm(0);
    setCurrentBpm(138);
    setActiveRouteIndex(0);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStopAndSave = () => {
    if (elapsedSeconds < 5) {
      setIsLiveActive(false);
      return;
    }

    // Compute training effect and strain
    const strain = +(Math.min(20.5, 4.0 + (elapsedSeconds / 600) * 1.8)).toFixed(1);
    const avgHr = Math.round(145 + Math.random() * 10);
    const maxHr = Math.max(avgHr + 15, currentBpm);

    const zones = [
      { zone: 1 as const, name: 'Warmup', minBpm: 95, maxBpm: 114, durationSeconds: Math.round(elapsedSeconds * 0.10), color: '#94A3B8' },
      { zone: 2 as const, name: 'Aerobic Base', minBpm: 115, maxBpm: 133, durationSeconds: Math.round(elapsedSeconds * 0.25), color: '#38BDF8' },
      { zone: 3 as const, name: 'Tempo', minBpm: 134, maxBpm: 152, durationSeconds: Math.round(elapsedSeconds * 0.40), color: '#10B981' },
      { zone: 4 as const, name: 'Threshold', minBpm: 153, maxBpm: 171, durationSeconds: Math.round(elapsedSeconds * 0.20), color: '#F59E0B' },
      { zone: 5 as const, name: 'Anaerobic Peak', minBpm: 172, maxBpm: 188, durationSeconds: Math.round(elapsedSeconds * 0.05), color: '#EF4444' },
    ];

    const completedSession: WorkoutSession = {
      id: `wo_${Date.now()}`,
      sport: selectedSport,
      title: sessionTitle || `${selectedSport} Session`,
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      durationSeconds: elapsedSeconds,
      distanceKm: distanceKm > 0.1 ? +distanceKm.toFixed(2) : undefined,
      activeKcal: Math.round(burnedKcal),
      avgHeartRate: avgHr,
      maxHeartRate: maxHr,
      avgPaceMinPerKm: distanceKm > 0.1 ? '5:14' : undefined,
      avgCadenceRpm: currentCadence > 0 ? currentCadence : undefined,
      elevationGainMeters: selectedSport.includes('Run') || selectedSport.includes('Cycle') ? 185 : undefined,
      trainingLoadStrain: strain,
      aerobicTrainingEffect: 3.9,
      anaerobicTrainingEffect: 1.8,
      syncedFromDeviceId: primaryDevice?.id || 'dev_whoop_40',
      syncedFromDeviceName: primaryDevice?.name || 'Smart Wearable Stream',
      zones,
      route: selectedSport.includes('Run') || selectedSport.includes('Cycle') ? SAMPLE_GPS_ROUTE : undefined,
      notes: `Recorded in real-time from ${primaryDevice?.name || 'wearable'}. Felt rhythmic with consistent cadence.`,
    };

    onSaveWorkout(completedSession);
    setIsLiveActive(false);
    setIsPaused(false);
    setExpandedWorkoutId(completedSession.id);
  };

  const currentZone = WearableSyncService.getZoneForBpm(
    currentBpm,
    athlete.restingHrBaseline,
    athlete.maxHrRecorded
  );

  // Filter workouts
  const filteredWorkouts = workouts.filter((w) => {
    const matchesSport = filterSport === 'all' || w.sport.toLowerCase().includes(filterSport.toLowerCase());
    const matchesSearch = !searchQuery || w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Live Workout Banner / Controller */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Wearable Workout Telemetry
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">
                {primaryDevice ? `Streaming from ${primaryDevice.name}` : 'Wearable Sensor Ready'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {isLiveActive ? sessionTitle : 'Start Real-Time Workout Session'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!isLiveActive && (
              <button
                onClick={onOpenManualModal}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Past Workout</span>
              </button>
            )}

            {!isLiveActive ? (
              <button
                onClick={handleStartWorkout}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Session</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePause}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleStopAndSave}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-900/30 active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Finish & Sync</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Active HUD or Pre-Workout Config */}
        {!isLiveActive ? (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Activity Sport
              </label>
              <select
                value={selectedSport}
                onChange={(e) => {
                  setSelectedSport(e.target.value as WorkoutSport);
                  setSessionTitle(`${e.target.value} Session`);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Trail Run">Trail Run (Alpine / Forest)</option>
                <option value="Outdoor Run">Outdoor Tempo Run</option>
                <option value="Road Cycling">Road Cycling (Endurance)</option>
                <option value="HIIT & Functional">HIIT & Metabolic Conditioning</option>
                <option value="Strength Training">Strength & Hypertrophy</option>
                <option value="Swimming">Swimming (Lap & Open Water)</option>
                <option value="Rowing">Indoor / Water Rowing</option>
                <option value="Recovery Yoga">Mobility & Recovery Yoga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Session Title / Intent
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. Zone 4 Threshold Intervals"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          /* Live Streaming Telemetry Dashboard */
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Timer */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isPaused ? 'Session Paused' : 'Active Clock'}
                </div>
              </div>

              {/* Live Heart Rate */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  <span>Heart Rate</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1 flex items-baseline gap-1.5">
                  <span>{currentBpm}</span>
                  <span className="text-xs font-medium text-slate-400">BPM</span>
                </div>
                <div
                  className="text-[10px] font-semibold truncate mt-0.5"
                  style={{ color: currentZone.color }}
                >
                  {currentZone.name}
                </div>
              </div>

              {/* Active Calories */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Active Calories</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                  {Math.round(burnedKcal)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ~11.8 kcal/min burn rate
                </div>
              </div>

              {/* Distance or Cadence */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Distance</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1 flex items-baseline gap-1">
                  <span>{distanceKm.toFixed(2)}</span>
                  <span className="text-xs font-medium text-slate-400">km</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                  Cadence: {currentCadence} spm
                </div>
              </div>
            </div>

            {/* Live GPS Route Visualizer */}
            {(selectedSport.includes('Run') || selectedSport.includes('Cycle')) && (
              <GpsRouteMap route={SAMPLE_GPS_ROUTE} activePointIndex={activeRouteIndex} />
            )}
          </div>
        )}
      </div>

      {/* Workout History Section */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Workout History & Strain Analytics</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Detailed breakdown of cardio zones, strain index, and training effects
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Sport Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterSport('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterSport === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSport('run')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterSport === 'run' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Runs
              </button>
              <button
                onClick={() => setFilterSport('cycling')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterSport === 'cycling' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rides
              </button>
              <button
                onClick={() => setFilterSport('strength')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterSport === 'strength' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Strength
              </button>
            </div>
          </div>
        </div>

        {/* Workout list */}
        <div className="divide-y divide-slate-800/80 mt-2">
          {filteredWorkouts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching workout sessions found.
            </div>
          ) : (
            filteredWorkouts.map((w) => {
              const isExpanded = expandedWorkoutId === w.id;
              return (
                <div key={w.id} className="py-4">
                  <div
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200 font-mono text-xs font-bold shrink-0">
                        {w.sport.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {w.title}
                          </h4>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs text-slate-400 font-mono tabular-nums">
                            {Math.floor(w.durationSeconds / 60)}m {w.durationSeconds % 60 > 0 ? `${w.durationSeconds % 60}s` : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          {w.distanceKm && <span>{w.distanceKm.toFixed(1)} km · </span>}
                          <span>Avg HR: <strong className="text-slate-200 font-mono tabular-nums">{w.avgHeartRate}</strong> bpm</span>
                          <span>·</span>
                          <span>Max HR: <strong className="text-slate-200 font-mono tabular-nums">{w.maxHeartRate}</strong> bpm</span>
                          <span>·</span>
                          <span>Burned: <strong className="text-white font-mono tabular-nums">{w.activeKcal}</strong> kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Strain Load</div>
                        <div className="text-base font-bold text-sky-400 font-mono tabular-nums">
                          {w.trainingLoadStrain.toFixed(1)}
                        </div>
                      </div>

                      <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Workout Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/60 pl-2 sm:pl-14 space-y-4">
                      {/* HR Zone Distribution Bars */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-medium text-slate-300">Heart Rate Zones Allocation</span>
                          <span className="text-slate-500 font-mono text-[11px]">Source: {w.syncedFromDeviceName}</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-900 border border-slate-800">
                          {w.zones.map((z) => {
                            const pct = Math.round((z.durationSeconds / w.durationSeconds) * 100);
                            return (
                              <div
                                key={z.zone}
                                title={`${z.name}: ${Math.floor(z.durationSeconds / 60)}m (${pct}%)`}
                                style={{ width: `${pct}%`, backgroundColor: z.color }}
                                className="h-full"
                              />
                            );
                          })}
                        </div>
                        {/* Zone Legend */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 text-[11px]">
                          {w.zones.map((z) => (
                            <div key={z.zone} className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: z.color }} />
                              <span className="truncate">{z.name}</span>
                              <span className="font-mono text-slate-300 tabular-nums ml-auto">
                                {Math.floor(z.durationSeconds / 60)}m
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Training Effect Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/60 text-xs">
                        <div>
                          <div className="text-slate-400 text-[11px]">Aerobic TE</div>
                          <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                            {w.aerobicTrainingEffect.toFixed(1)} / 5.0
                          </div>
                          <div className="text-[10px] text-slate-500">Cardio Impact</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[11px]">Anaerobic TE</div>
                          <div className="text-sm font-bold text-amber-400 font-mono tabular-nums">
                            {w.anaerobicTrainingEffect.toFixed(1)} / 5.0
                          </div>
                          <div className="text-[10px] text-slate-500">Speed / Power</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[11px]">Elevation Gain</div>
                          <div className="text-sm font-bold text-white font-mono tabular-nums">
                            {w.elevationGainMeters ? `+${w.elevationGainMeters}m` : 'Flat / Studio'}
                          </div>
                          <div className="text-[10px] text-slate-500">Vertical Climb</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[11px]">Avg Pace</div>
                          <div className="text-sm font-bold text-white font-mono tabular-nums">
                            {w.avgPaceMinPerKm ? `${w.avgPaceMinPerKm} /km` : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500">Tempo Consistency</div>
                        </div>
                      </div>

                      {/* Route map if available */}
                      {w.route && (
                        <div className="mt-3">
                          <GpsRouteMap route={w.route} />
                        </div>
                      )}

                      {w.notes && (
                        <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 italic">
                          "{w.notes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
