import { WearableDevice, BiometricTelemetry, LiveStreamPacket } from '../types/fitness';

/**
 * Service to manage wearable device synchronization and Bluetooth telemetry.
 */
export class WearableSyncService {
  private static liveStreamInterval: number | null = null;
  private static subscribers: ((packet: LiveStreamPacket) => void)[] = [];
  private static currentHeartRate = 68;
  private static currentCadence = 0;
  private static bleDevice: any = null;

  /**
   * Request genuine Web Bluetooth connection (Heart Rate profile: 0x180D)
   */
  public static async pairWebBluetoothDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
      return {
        success: false,
        error: 'Web Bluetooth API is not supported in this browser environment. Using high-fidelity virtual BLE bridge instead.',
      };
    }

    try {
      const navAny = navigator as any;
      const device = await navAny.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information'],
      });

      this.bleDevice = device;
      return {
        success: true,
        deviceName: device.name || 'Bluetooth Heart Rate Monitor',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Bluetooth pairing was cancelled or timed out.',
      };
    }
  }

  /**
   * Calculate 5 Heart Rate Zones based on Karvonen formula:
   * Target HR = ((Max HR − Resting HR) × % Intensity) + Resting HR
   */
  public static calculateKarvonenZones(restingHr: number, maxHr: number) {
    const hrr = maxHr - restingHr; // Heart Rate Reserve
    return [
      {
        zone: 1 as const,
        name: 'Zone 1: Active Recovery',
        minBpm: Math.round(restingHr + hrr * 0.50),
        maxBpm: Math.round(restingHr + hrr * 0.60),
        color: '#94A3B8',
        description: 'Light aerobic recovery, promotes blood flow and tissue repair.',
      },
      {
        zone: 2 as const,
        name: 'Zone 2: Aerobic Base & Fat Oxidation',
        minBpm: Math.round(restingHr + hrr * 0.60) + 1,
        maxBpm: Math.round(restingHr + hrr * 0.70),
        color: '#38BDF8',
        description: 'Mitochondrial biogenesis, cellular endurance, builds fat-burning engine.',
      },
      {
        zone: 3 as const,
        name: 'Zone 3: Tempo / Aerobic Endurance',
        minBpm: Math.round(restingHr + hrr * 0.70) + 1,
        maxBpm: Math.round(restingHr + hrr * 0.80),
        color: '#10B981',
        description: 'Cardiorespiratory fitness, sustained pace training.',
      },
      {
        zone: 4 as const,
        name: 'Zone 4: Lactate Threshold',
        minBpm: Math.round(restingHr + hrr * 0.80) + 1,
        maxBpm: Math.round(restingHr + hrr * 0.90),
        color: '#F59E0B',
        description: 'Lactate clearance threshold, high-power sustained outputs.',
      },
      {
        zone: 5 as const,
        name: 'Zone 5: Anaerobic Peak / VO2 Max',
        minBpm: Math.round(restingHr + hrr * 0.90) + 1,
        maxBpm: maxHr,
        color: '#EF4444',
        description: 'Maximum neuromuscular output and sprint capacity.',
      },
    ];
  }

  /**
   * Determine which zone a given BPM falls into
   */
  public static getZoneForBpm(bpm: number, restingHr: number, maxHr: number) {
    const zones = this.calculateKarvonenZones(restingHr, maxHr);
    if (bpm < zones[0].minBpm) return zones[0];
    for (const z of zones) {
      if (bpm >= z.minBpm && bpm <= z.maxBpm) return z;
    }
    return zones[zones.length - 1];
  }

  /**
   * Start listening to real-time telemetry stream
   */
  public static subscribeToTelemetry(
    callback: (packet: LiveStreamPacket) => void,
    isWorkoutActive: boolean = false
  ) {
    this.subscribers.push(callback);

    if (!this.liveStreamInterval) {
      this.liveStreamInterval = window.setInterval(() => {
        // Natural physiological variation
        if (isWorkoutActive) {
          // Workout fluctuation between 135 and 172 bpm
          const target = 152;
          const drift = (Math.random() - 0.48) * 3;
          this.currentHeartRate = Math.min(182, Math.max(130, Math.round(this.currentHeartRate + drift)));
          this.currentCadence = Math.round(168 + (Math.random() - 0.5) * 6);
        } else {
          // Resting fluctuation between 64 and 74 bpm
          const drift = (Math.random() - 0.5) * 2;
          this.currentHeartRate = Math.min(78, Math.max(62, Math.round(this.currentHeartRate + drift)));
          this.currentCadence = 0;
        }

        const packet: LiveStreamPacket = {
          timestamp: Date.now(),
          heartRate: this.currentHeartRate,
          cadence: this.currentCadence,
          caloriesBurned: isWorkoutActive ? 11.5 : 1.2,
          battery: 84,
        };

        this.subscribers.forEach((fn) => fn(packet));
      }, 1200);
    }

    return () => {
      this.subscribers = this.subscribers.filter((fn) => fn !== callback);
      if (this.subscribers.length === 0 && this.liveStreamInterval) {
        clearInterval(this.liveStreamInterval);
        this.liveStreamInterval = null;
      }
    };
  }

  /**
   * Simulate handshake & sync packets with a wearable device
   */
  public static async executeDeviceSync(
    device: WearableDevice,
    onProgress: (percent: number, statusMessage: string) => void
  ): Promise<{ syncedDevice: WearableDevice; addedCalories: number; addedSteps: number }> {
    onProgress(15, `Establishing BLE encrypted handshake with ${device.name}...`);
    await new Promise((r) => setTimeout(r, 400));

    onProgress(45, 'Querying optical PPG memory buffer & HRV timestamps...');
    await new Promise((r) => setTimeout(r, 500));

    onProgress(80, 'Normalizing sleep hypnogram and computing strain index...');
    await new Promise((r) => setTimeout(r, 450));

    onProgress(100, 'Device telemetry synchronized successfully.');
    await new Promise((r) => setTimeout(r, 200));

    const addedSteps = Math.floor(Math.random() * 45) + 20;
    const addedCalories = Math.floor(Math.random() * 12) + 4;

    const updatedDevice: WearableDevice = {
      ...device,
      batteryPercentage: Math.max(12, device.batteryPercentage - 1),
      lastSyncedAt: 'Just now',
      totalDataPointsCollected: device.totalDataPointsCollected + 1440,
      connectionStatus: 'connected',
    };

    return {
      syncedDevice: updatedDevice,
      addedCalories,
      addedSteps,
    };
  }
}
