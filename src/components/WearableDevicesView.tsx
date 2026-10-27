import React, { useState } from 'react';
import { 
  Smartphone, 
  Watch, 
  Wifi, 
  Battery, 
  RefreshCw, 
  Plus, 
  Check, 
  Settings, 
  Radio, 
  ShieldCheck, 
  Cpu,
  Bluetooth,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { WearableDevice } from '../types/fitness';
import { WearableSyncService } from '../services/wearableSync';

interface WearableDevicesViewProps {
  devices: WearableDevice[];
  onSetPrimary: (deviceId: string) => void;
  onSyncDevice: (device: WearableDevice) => void;
  onToggleConnection: (deviceId: string) => void;
  onOpenPairModal: () => void;
  isSyncingId: string | null;
}

export const WearableDevicesView: React.FC<WearableDevicesViewProps> = ({
  devices,
  onSetPrimary,
  onSyncDevice,
  onToggleConnection,
  onOpenPairModal,
  isSyncingId,
}) => {
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<WearableDevice | null>(null);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hardware Hub & Sensor Array
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-medium">Multi-Wearable BLE Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Paired Smart Wearable Fleet
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            PulseFlow continuously synthesizes data streams across smartwatches, smart rings, and chest straps to form a unified biometric profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPairModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
          >
            <Bluetooth className="w-4 h-4" />
            <span>Pair New Device</span>
          </button>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((device) => {
          const isSyncing = isSyncingId === device.id;
          const isConnected = device.connectionStatus === 'connected';

          return (
            <div
              key={device.id}
              className={`bg-[#0D131F] border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                device.isPrimary
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Device Top Bar */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start gap-3.5">
                    {/* Device Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {device.image ? (
                        <img
                          src={device.image}
                          alt={device.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Watch className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {device.name}
                        </h3>
                        {device.isPrimary && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{device.modelName}</span>
                        <span>·</span>
                        <span>{device.firmwareVersion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Battery & RSSI */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-mono tabular-nums text-slate-200">
                      <Battery className={`w-3.5 h-3.5 ${device.batteryPercentage > 20 ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span>{device.batteryPercentage}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                      {device.signalStrengthDbm} dBm
                    </div>
                  </div>
                </div>

                {/* Sensor Array Chips */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Active Sensor Array
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {device.sensors.map((sensor, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-medium bg-slate-900/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800"
                      >
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sync Status</span>
                    <span className="font-medium text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{isConnected ? `Synced ${device.lastSyncedAt}` : 'Offline'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Data Points Logged</span>
                    <span className="font-mono tabular-nums text-slate-200 font-medium block mt-0.5">
                      {device.totalDataPointsCollected.toLocaleString()} packets
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleConnection(device.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      isConnected
                        ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/40'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>

                  {!device.isPrimary && isConnected && (
                    <button
                      onClick={() => onSetPrimary(device.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                    >
                      Make Primary
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSyncDevice(device)}
                  disabled={isSyncing || !isConnected}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isSyncing
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : isConnected
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Architecture & Compatibility Guide */}
      <div className="bg-[#0B101B] border border-slate-800/90 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Bluetooth LE & Health Platform Synchronization
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-4xl">
              PulseFlow integrates with the standard Bluetooth GATT Heart Rate Profile (Service UUID <code className="text-slate-300 font-mono">0x180D</code>, Characteristic <code className="text-slate-300 font-mono">0x2A37</code>) and Apple HealthKit / Google Health Connect data protocols. Data is encrypted end-to-end on device.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Web Bluetooth LE Bridge Active
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> AES-128 Hardware Encryption
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> High-frequency 1Hz Telemetry
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
