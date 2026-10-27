import React, { useEffect, useRef } from 'react';
import { Heart, Activity, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BiometricTelemetry, AthleteProfile } from '../types/fitness';
import { WearableSyncService } from '../services/wearableSync';

interface LiveHeartRateMonitorProps {
  telemetry: BiometricTelemetry;
  athlete: AthleteProfile;
  isWorkoutActive?: boolean;
}

export const LiveHeartRateMonitor: React.FC<LiveHeartRateMonitorProps> = ({
  telemetry,
  athlete,
  isWorkoutActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const currentZone = WearableSyncService.getZoneForBpm(
    telemetry.currentBpm,
    athlete.restingHrBaseline,
    athlete.maxHrRecorded
  );

  // Render real-time PPG / ECG physiological waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = 80);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 80;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Speed depends on BPM
      const speed = (telemetry.currentBpm / 60) * 1.5;
      phaseRef.current += speed;

      // Draw ECG / PPG Wave
      ctx.beginPath();
      ctx.strokeStyle = currentZone.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = currentZone.color;
      ctx.shadowBlur = 6;

      const midY = height / 2;
      const cycleLength = 120; // Length in pixels for 1 heartbeat cycle

      for (let x = 0; x < width; x++) {
        // Position within cycle
        const cyclePos = (x + phaseRef.current * 2) % cycleLength;
        let yOffset = 0;

        // Realistic P-Q-R-S-T cardiac waveform profile
        if (cyclePos >= 15 && cyclePos < 25) {
          // P Wave (atrial depolarization)
          yOffset = -Math.sin(((cyclePos - 15) / 10) * Math.PI) * 5;
        } else if (cyclePos >= 30 && cyclePos < 34) {
          // Q dip
          yOffset = 4;
        } else if (cyclePos >= 34 && cyclePos < 42) {
          // R Spike (ventricular depolarization)
          const norm = (cyclePos - 34) / 8;
          yOffset = -Math.sin(norm * Math.PI) * 28;
        } else if (cyclePos >= 42 && cyclePos < 46) {
          // S dip
          yOffset = 8;
        } else if (cyclePos >= 55 && cyclePos < 75) {
          // T Wave (ventricular repolarization)
          yOffset = -Math.sin(((cyclePos - 55) / 20) * Math.PI) * 11;
        }

        const y = midY + yOffset;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [telemetry.currentBpm, currentZone.color]);

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Live Biometric Telemetry
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-medium">1Hz Optical PPG Stream</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              {telemetry.currentBpm}
            </span>
            <span className="text-sm font-medium text-slate-400">BPM</span>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border"
              style={{
                borderColor: `${currentZone.color}40`,
                backgroundColor: `${currentZone.color}15`,
                color: currentZone.color,
              }}
            >
              {currentZone.name}
            </div>
          </div>
        </div>

        {/* Vital stats row */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 text-right">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Resting HR</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums">
              {telemetry.restingHeartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">HRV (rMSSD)</div>
            <div className="text-base font-semibold text-emerald-400 font-mono tabular-nums">
              {telemetry.hrvRmssd} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Blood O₂ (SpO₂)</div>
            <div className="text-base font-semibold text-sky-400 font-mono tabular-nums">
              {telemetry.spo2Percent}%
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="mt-4 relative w-full h-20 bg-slate-950/60 rounded-xl overflow-hidden border border-slate-800/60">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME PPG</span>
        </div>
      </div>

      {/* Zone explanation strip */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{currentZone.description}</span>
        <span className="font-mono text-slate-500 tabular-nums">
          Range: {currentZone.minBpm}–{currentZone.maxBpm} BPM
        </span>
      </div>
    </div>
  );
};
