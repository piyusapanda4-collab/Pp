import React, { useState } from 'react';
import { X, Plus, Dumbbell, Flame, Timer, Navigation, Heart } from 'lucide-react';
import { WorkoutSession, WorkoutSport } from '../types/fitness';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: WorkoutSession) => void;
}

export const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({
  isOpen,
  onClose,
  onAddWorkout,
}) => {
  const [sport, setSport] = useState<WorkoutSport>('Outdoor Run');
  const [title, setTitle] = useState<string>('Tempo Road Session');
  const [durationMins, setDurationMins] = useState<number>(45);
  const [distanceKm, setDistanceKm] = useState<string>('8.2');
  const [avgHr, setAvgHr] = useState<number>(148);
  const [calories, setCalories] = useState<number>(540);
  const [notes, setNotes] = useState<string>('Consistent tempo in Zone 3 and 4.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const durationSeconds = durationMins * 60;
    const strain = +(Math.min(20.5, 3.5 + (durationMins / 20) * 2.2)).toFixed(1);

    const zones = [
      { zone: 1 as const, name: 'Warmup', minBpm: 95, maxBpm: 114, durationSeconds: Math.round(durationSeconds * 0.12), color: '#94A3B8' },
      { zone: 2 as const, name: 'Aerobic Base', minBpm: 115, maxBpm: 133, durationSeconds: Math.round(durationSeconds * 0.28), color: '#38BDF8' },
      { zone: 3 as const, name: 'Tempo', minBpm: 134, maxBpm: 152, durationSeconds: Math.round(durationSeconds * 0.38), color: '#10B981' },
      { zone: 4 as const, name: 'Threshold', minBpm: 153, maxBpm: 171, durationSeconds: Math.round(durationSeconds * 0.18), color: '#F59E0B' },
      { zone: 5 as const, name: 'Anaerobic Peak', minBpm: 172, maxBpm: 188, durationSeconds: Math.round(durationSeconds * 0.04), color: '#EF4444' },
    ];

    const newSession: WorkoutSession = {
      id: `wo_${Date.now()}`,
      sport,
      title: title || `${sport} Workout`,
      startTime: new Date().toISOString(),
      durationSeconds,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      activeKcal: calories,
      avgHeartRate: avgHr,
      maxHeartRate: avgHr + 16,
      avgPaceMinPerKm: distanceKm && parseFloat(distanceKm) > 0 ? '5:29' : undefined,
      trainingLoadStrain: strain,
      aerobicTrainingEffect: 3.6,
      anaerobicTrainingEffect: 1.4,
      syncedFromDeviceId: 'manual_entry',
      syncedFromDeviceName: 'Manual Wearable Log',
      zones,
      notes,
    };

    onAddWorkout(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B101C] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Past Wearable Workout</h3>
              <p className="text-xs text-slate-400">Record a completed training session into history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sport Type</label>
              <select
                value={sport}
                onChange={(e) => {
                  setSport(e.target.value as WorkoutSport);
                  setTitle(`${e.target.value} Session`);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Outdoor Run">Outdoor Run</option>
                <option value="Trail Run">Trail Run</option>
                <option value="Road Cycling">Road Cycling</option>
                <option value="HIIT & Functional">HIIT & Functional</option>
                <option value="Strength Training">Strength Training</option>
                <option value="Swimming">Swimming</option>
                <option value="Rowing">Rowing</option>
                <option value="Recovery Yoga">Recovery Yoga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Session Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="600"
                value={durationMins}
                onChange={(e) => setDurationMins(+e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Distance in km (optional)</label>
              <input
                type="text"
                placeholder="e.g. 10.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Average Heart Rate (bpm)</label>
              <input
                type="number"
                min="60"
                max="210"
                value={avgHr}
                onChange={(e) => setAvgHr(+e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Active Calories (kcal)</label>
              <input
                type="number"
                min="10"
                max="4000"
                value={calories}
                onChange={(e) => setCalories(+e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Training Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session feel? Pace, fatigue, weather..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md active:scale-95"
            >
              Save Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
