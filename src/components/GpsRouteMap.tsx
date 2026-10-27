import React, { useState } from 'react';
import { GpsCoordinate } from '../types/fitness';
import { MapPin, Navigation, TrendingUp } from 'lucide-react';

interface GpsRouteMapProps {
  route: GpsCoordinate[];
  activePointIndex?: number;
  interactive?: boolean;
}

export const GpsRouteMap: React.FC<GpsRouteMapProps> = ({
  route,
  activePointIndex = route.length - 1,
  interactive = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!route || route.length === 0) {
    return (
      <div className="w-full h-64 bg-slate-900/50 rounded-xl flex items-center justify-center text-slate-500 text-sm">
        No GPS telemetry recorded for this session
      </div>
    );
  }

  // Calculate lat/lng bounds for SVG mapping
  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const padding = 24;
  const svgWidth = 500;
  const svgHeight = 220;

  const latSpan = maxLat - minLat || 0.001;
  const lngSpan = maxLng - minLng || 0.001;

  // Map lat/lng to SVG pixel space
  const getCoords = (p: GpsCoordinate) => {
    const x = padding + ((p.lng - minLng) / lngSpan) * (svgWidth - padding * 2);
    // Invert Y so North is Up
    const y = svgHeight - padding - ((p.lat - minLat) / latSpan) * (svgHeight - padding * 2);
    return { x, y };
  };

  const pathD = route.reduce((acc, point, i) => {
    const { x, y } = getCoords(point);
    return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  // Elevation stats
  const elevs = route.map((p) => p.elevationM);
  const minElev = Math.min(...elevs);
  const maxElev = Math.max(...elevs);
  const elevSpan = maxElev - minElev || 10;

  const currentDisplayIdx = hoveredIdx !== null ? hoveredIdx : activePointIndex;
  const activePt = route[currentDisplayIdx] || route[0];
  const activeSvgPos = getCoords(activePt);

  return (
    <div className="bg-[#0A0F1A] border border-slate-800/80 rounded-xl overflow-hidden p-4">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>High-Precision GPS Route & Topography</span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
          <span>Elevation: <strong className="text-white">{activePt.elevationM}m</strong></span>
          <span>HR: <strong className="text-amber-400">{activePt.hrBpm} bpm</strong></span>
          <span>Dist: <strong className="text-sky-400">{activePt.distanceKm.toFixed(1)} km</strong></span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-[220px] bg-[#070B13] rounded-lg overflow-hidden border border-slate-900">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="55" x2={svgWidth} y2="55" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="0.5" />
          <line x1="0" y1="110" x2={svgWidth} y2="110" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="0.5" />
          <line x1="0" y1="165" x2={svgWidth} y2="165" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="0.5" />

          {/* Path shadow / glow */}
          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="6" opacity="0.15" strokeLinecap="round" strokeLinejoin="round" />

          {/* Route Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Route Waypoints */}
          {route.map((pt, i) => {
            const { x, y } = getCoords(pt);
            const isStart = i === 0;
            const isFinish = i === route.length - 1;
            const isHovered = i === currentDisplayIdx;

            if (isStart || isFinish || isHovered) {
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={isStart ? '#10B981' : isFinish ? '#EF4444' : '#FFFFFF'}
                    stroke="#090D14"
                    strokeWidth="2"
                  />
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* Start / Finish labels */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Start (1,420m)
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Summit (1,630m)
          </span>
        </div>
      </div>

      {/* Interactive Elevation Profile Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Elevation Gradient Profile</span>
          </div>
          <span className="font-mono text-slate-400 tabular-nums">
            Gain: +310m · Max: 1,630m
          </span>
        </div>

        {/* Elevation spark bars */}
        <div className="flex items-end gap-1 h-12 w-full pt-2">
          {route.map((pt, i) => {
            const heightPercent = Math.max(15, Math.round(((pt.elevationM - minElev) / elevSpan) * 100));
            const isCurrent = i === currentDisplayIdx;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex-1 rounded-t transition-all cursor-pointer relative group ${
                  isCurrent ? 'bg-emerald-400' : 'bg-slate-700/60 hover:bg-slate-500'
                }`}
                style={{ height: `${heightPercent}%` }}
              >
                {/* Micro tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-700 pointer-events-none font-mono">
                  {pt.elevationM}m · {pt.distanceKm.toFixed(1)}km
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
