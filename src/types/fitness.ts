/**
 * PulseFlow - Wearable Fitness & Biometric Types
 */

export type WearableDeviceType = 'smartwatch' | 'smart_ring' | 'chest_strap' | 'armband' | 'bluetooth_generic';

export type WearableBrand = 'Apple Watch' | 'WHOOP' | 'Garmin' | 'Oura' | 'Pixel Watch' | 'Polar' | 'Generic BLE';

export interface WearableDevice {
  id: string;
  name: string;
  brand: WearableBrand;
  modelName: string;
  type: WearableDeviceType;
  batteryPercentage: number;
  connectionStatus: 'connected' | 'syncing' | 'disconnected';
  lastSyncedAt: string; // ISO or relative
  firmwareVersion: string;
  sensors: string[];
  signalStrengthDbm: number; // e.g. -54 dBm
  isPrimary: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
  image?: string;
  totalDataPointsCollected: number;
}

export interface BiometricTelemetry {
  currentBpm: number;
  restingHeartRate: number;
  hrvRmssd: number; // in ms
  spo2Percent: number; // 95-100%
  respiratoryRateBrpm: number; // 12-20
  skinTempDeviationCelsius: number; // e.g. +0.15 °C
  activeCalories: number;
  totalCalories: number;
  stepsCount: number;
  activeMinutes: number;
  standHours: number;
  vo2MaxEstimate: number; // ml/kg/min
}

export interface DailyScores {
  readinessScore: number; // 0 - 100
  strainScore: number; // 0.0 - 21.0
  strainTargetMin: number;
  strainTargetMax: number;
  sleepScore: number; // 0 - 100
  recoveryStatus: 'Optimal' | 'Adequate' | 'Rest & Recovery Needed';
}

export interface SleepStageSegment {
  stage: 'deep' | 'rem' | 'core' | 'awake';
  startMinutesFromBed: number;
  durationMinutes: number;
}

export interface SleepData {
  totalSleepMinutes: number;
  timeInBedMinutes: number;
  sleepEfficiencyPercent: number;
  sleepDebtMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  coreSleepMinutes: number;
  awakeSleepMinutes: number;
  respiratoryRateAvg: number;
  hrvDuringSleepAvg: number;
  bedTime: string;
  wakeTime: string;
  segments: SleepStageSegment[];
}

export type WorkoutSport = 
  | 'Outdoor Run' 
  | 'Trail Run' 
  | 'Road Cycling' 
  | 'HIIT & Functional' 
  | 'Strength Training' 
  | 'Swimming' 
  | 'Rowing' 
  | 'Recovery Yoga';

export interface HeartRateZoneDuration {
  zone: 1 | 2 | 3 | 4 | 5;
  name: string;
  minBpm: number;
  maxBpm: number;
  durationSeconds: number;
  color: string;
}

export interface GpsCoordinate {
  lat: number;
  lng: number;
  elevationM: number;
  hrBpm: number;
  distanceKm: number;
}

export interface WorkoutSession {
  id: string;
  sport: WorkoutSport;
  title: string;
  startTime: string; // ISO
  durationSeconds: number;
  distanceKm?: number;
  activeKcal: number;
  avgHeartRate: number;
  maxHeartRate: number;
  avgPaceMinPerKm?: string;
  avgCadenceRpm?: number;
  elevationGainMeters?: number;
  trainingLoadStrain: number; // 0 - 21
  aerobicTrainingEffect: number; // 1.0 - 5.0
  anaerobicTrainingEffect: number; // 1.0 - 5.0
  syncedFromDeviceId: string;
  syncedFromDeviceName: string;
  zones: HeartRateZoneDuration[];
  route?: GpsCoordinate[];
  notes?: string;
}

export interface AthleteProfile {
  name: string;
  email: string;
  athleteType: 'Endurance Runner' | 'Hybrid Athlete' | 'Strength & Hypertrophy' | 'Longevity & Health';
  age: number;
  weightKg: number;
  heightCm: number;
  restingHrBaseline: number;
  maxHrRecorded: number;
  avatarUrl: string;
  targets: {
    dailyActiveKcal: number;
    dailySteps: number;
    dailyActiveMinutes: number;
    nightlySleepHours: number;
    weeklyZone2Hours: number;
    optimalWeeklyWorkouts: number;
  };
}

export interface LiveStreamPacket {
  timestamp: number;
  heartRate: number;
  cadence: number;
  instantPace?: string;
  caloriesBurned: number;
  battery: number;
}
