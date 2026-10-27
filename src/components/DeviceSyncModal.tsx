import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  Bluetooth, 
  Check, 
  Smartphone, 
  Watch, 
  Battery, 
  Radio, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { WearableDevice } from '../types/fitness';
import { WearableSyncService } from '../services/wearableSync';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: WearableDevice[];
  onSyncAll: () => Promise<void>;
  onSyncSingle: (device: WearableDevice) => void;
  onAddNewDevice: (device: WearableDevice) => void;
  isSyncingAll: boolean;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  devices,
  onSyncAll,
  onSyncSingle,
  onAddNewDevice,
  isSyncingAll,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'sync' | 'pair'>('sync');
  const [isScanningBle, setIsScanningBle] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePairBle = async () => {
    setIsScanningBle(true);
    setScanStatus('Broadcasting BLE discovery beacon (0x180D Heart Rate Profile)...');

    const result = await WearableSyncService.pairWebBluetoothDevice();

    if (result.success && result.deviceName) {
      setScanStatus(`Successfully paired with ${result.deviceName}! Registering telemetry streams...`);
      setTimeout(() => {
        const newDev: WearableDevice = {
          id: `dev_ble_${Date.now()}`,
          name: result.deviceName || 'Bluetooth Smart Device',
          brand: 'Generic BLE',
          modelName: 'GATT-HR-01',
          type: 'bluetooth_generic',
          batteryPercentage: 98,
          connectionStatus: 'connected',
          lastSyncedAt: 'Just now',
          firmwareVersion: 'BLE 5.3',
          sensors: ['Optical Heart Rate (0x2A37)', 'Battery Service (0x180F)'],
          signalStrengthDbm: -44,
          isPrimary: false,
          autoSync: true,
          syncIntervalMinutes: 5,
          totalDataPointsCollected: 120,
        };
        onAddNewDevice(newDev);
        setIsScanningBle(false);
        setActiveModalTab('sync');
        setScanStatus(null);
      }, 1000);
    } else {
      setScanStatus(result.error || 'Device pairing timed out. You can also connect via virtual BLE bridge below.');
      setIsScanningBle(false);
    }
  };

  const handleAddVirtualDevice = (brand: string, name: string, model: string, type: any, sensors: string[]) => {
    const newDev: WearableDevice = {
      id: `dev_${Date.now()}`,
      name,
      brand: brand as any,
      modelName: model,
      type,
      batteryPercentage: 95,
      connectionStatus: 'connected',
      lastSyncedAt: 'Just now',
      firmwareVersion: 'v3.2.1-prod',
      sensors,
      signalStrengthDbm: -48,
      isPrimary: false,
      autoSync: true,
      syncIntervalMinutes: 10,
      image: '/src/assets/images/wearable_smartwatch_close_1793020124653.jpg',
      totalDataPointsCollected: 1440,
    };
    onAddNewDevice(newDev);
    setActiveModalTab('sync');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B101C] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Wearable Device Synchronization</h3>
              <div className="text-xs text-slate-400">Manage paired BLE sensors and telemetry packets</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3">
          <button
            onClick={() => setActiveModalTab('sync')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeModalTab === 'sync'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paired Devices ({devices.length})
          </button>
          <button
            onClick={() => setActiveModalTab('pair')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeModalTab === 'pair'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Pair New BLE Sensor</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[460px] overflow-y-auto">
          {activeModalTab === 'sync' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {devices.filter((d) => d.connectionStatus === 'connected').length} devices connected & transmitting
                </span>
                <button
                  onClick={onSyncAll}
                  disabled={isSyncingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAll ? 'Syncing Fleet...' : 'Sync All Wearables'}</span>
                </button>
              </div>

              {/* Devices list */}
              <div className="space-y-2.5">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Watch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{device.name}</span>
                          {device.isPrimary && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Battery: <strong className="text-slate-200 font-mono tabular-nums">{device.batteryPercentage}%</strong></span>
                          <span>·</span>
                          <span>Last sync: {device.lastSyncedAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSyncSingle(device)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Pair BLE Sensor View */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Scan Web Bluetooth (GATT HR Profile)</span>
                  </div>
                  <button
                    onClick={handlePairBle}
                    disabled={isScanningBle}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Bluetooth className="w-3.5 h-3.5" />
                    <span>{isScanningBle ? 'Scanning...' : 'Scan Hardware'}</span>
                  </button>
                </div>

                {scanStatus && (
                  <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono leading-relaxed">
                    {scanStatus}
                  </div>
                )}
              </div>

              {/* Quick Connect Popular Smart Wearables */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  Or Connect Pre-Calibrated Wearable Models
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      handleAddVirtualDevice(
                        'Polar',
                        'Polar H10 ECG Chest Strap',
                        'H10-DUAL',
                        'chest_strap',
                        ['Medical Grade ECG', 'Dual Bluetooth Smart', 'RR Interval Recording']
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        Polar H10 ECG Chest Strap
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gold standard heart rate precision for high-intensity intervals
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() =>
                      handleAddVirtualDevice(
                        'Garmin',
                        'Garmin Forerunner 965',
                        'FR-965-TITANIUM',
                        'smartwatch',
                        ['Elevate V4 Optical HR', 'Multi-band GPS', 'Pulse Ox', 'Heart Rate Variability']
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        Garmin Forerunner 965
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Multi-band GNSS with training load telemetry
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() =>
                      handleAddVirtualDevice(
                        'Pixel Watch',
                        'Google Pixel Watch 3',
                        'PW3-45MM',
                        'smartwatch',
                        ['Skin Temp Sensor', 'cEDA Continuous Stress', 'Recalibrated Optical HR']
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        Google Pixel Watch 3 (45mm)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cardio Load and target readiness algorithms
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
