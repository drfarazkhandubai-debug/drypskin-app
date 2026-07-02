// ─────────────────────────────────────────────────────────────────────────────
// Wearable / External Integration Layer
//
// Architecture: Each function is isolated. Real SDK calls can be swapped in
// later without touching any consuming code. All functions are fail-safe —
// they return null on failure so callers can fall back to manual inputs.
// ─────────────────────────────────────────────────────────────────────────────

export interface AppleHealthSnapshot {
  steps: number;
  sleep: number;         // hours
  heartRate: number;     // bpm resting
  hrv?: number;          // ms
  bloodOxygen?: number;  // %
  activeEnergy?: number; // kcal
}

export interface WearableSnapshot {
  source: "apple_health" | "google_fit" | "samsung" | "oura" | "whoop" | "garmin" | "mock";
  steps: number;
  sleep: number;
  heartRate: number;
  hrv?: number;
  bloodOxygen?: number;
  readinessScore?: number;
  strainScore?: number;
  recoveryScore?: number;
}

export interface ExternalHealthMetrics {
  wearable: WearableSnapshot | null;
  appleHealth: AppleHealthSnapshot | null;
  isLive: boolean;       // false = mock data
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLE HEALTH  (mock — replace body with HealthKit bridge when ready)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAppleHealthData(): Promise<AppleHealthSnapshot | null> {
  try {
    // TODO: replace with real HealthKit integration
    // import { HealthKit } from 'react-native-health';
    return {
      steps: 8000,
      sleep: 6.5,
      heartRate: 68,
      hrv: 42,
      bloodOxygen: 98,
      activeEnergy: 420,
    };
  } catch {
    return null; // fail-safe — caller uses manual inputs
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC WEARABLE  (mock — swap source & payload for real SDK)
// ─────────────────────────────────────────────────────────────────────────────
export async function getWearableData(): Promise<WearableSnapshot | null> {
  try {
    // TODO: replace with real wearable SDK (Oura API, WHOOP API, Garmin Connect, etc.)
    return {
      source: "mock",
      steps: 8000,
      sleep: 6.5,
      heartRate: 68,
      hrv: 42,
      bloodOxygen: 98,
      readinessScore: 72,
      strainScore: 14,
      recoveryScore: 68,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGED EXTERNAL METRICS  (combines all sources, deduplicated)
// ─────────────────────────────────────────────────────────────────────────────
export async function getExternalHealthMetrics(): Promise<ExternalHealthMetrics> {
  const [appleHealth, wearable] = await Promise.all([
    getAppleHealthData(),
    getWearableData(),
  ]);
  return { appleHealth, wearable, isLive: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING MODIFIERS
// Adjusts raw scan scores based on wearable data. Returns delta values
// (+/- points) so callers add them to their own scoring logic.
// ─────────────────────────────────────────────────────────────────────────────
export interface ScoringModifiers {
  energyDelta: number;     // +/- points on 0-100 scale
  burnoutDelta: number;    // +/- points on 0-100 scale
  sleepDelta: number;
  source: string;
}

export function computeScoringModifiers(
  metrics: ExternalHealthMetrics,
  manualAnswers?: Record<string, number>
): ScoringModifiers {
  const wearable = metrics.wearable ?? metrics.appleHealth;
  if (!wearable) {
    return { energyDelta: 0, burnoutDelta: 0, sleepDelta: 0, source: "manual" };
  }

  let energyDelta = 0;
  let burnoutDelta = 0;
  let sleepDelta = 0;

  // Steps: < 5000 → reduce energy score by up to 15 points
  if (wearable.steps < 5000) {
    const shortfall = (5000 - wearable.steps) / 5000; // 0–1
    energyDelta -= Math.round(shortfall * 15);
  } else if (wearable.steps > 10000) {
    energyDelta += 8; // bonus for high activity
  }

  // Sleep: < 6h → increase burnout risk (raise burnout score, lower energy)
  if (wearable.sleep < 6) {
    const deficit = (6 - wearable.sleep) / 6; // 0–1
    burnoutDelta += Math.round(deficit * 20);
    energyDelta -= Math.round(deficit * 10);
  }

  // HRV: low HRV is a stress/recovery signal
  if (wearable.hrv !== undefined && wearable.hrv < 30) {
    burnoutDelta += 10;
    energyDelta -= 5;
  }

  // Readiness / recovery bonus
  if ("readinessScore" in wearable && wearable.readinessScore !== undefined) {
    if (wearable.readinessScore > 80) energyDelta += 5;
    if (wearable.readinessScore < 40) { energyDelta -= 10; burnoutDelta += 10; }
  }

  // Blend with manual sleep answer if available (average both)
  if (manualAnswers?.sleep !== undefined) {
    const wearableSleepScore = Math.min(100, (wearable.sleep / 9) * 100);
    sleepDelta = Math.round((wearableSleepScore - manualAnswers.sleep) / 2);
  }

  return {
    energyDelta: Math.max(-30, Math.min(20, energyDelta)),
    burnoutDelta: Math.max(0, Math.min(30, burnoutDelta)),
    sleepDelta: Math.max(-20, Math.min(20, sleepDelta)),
    source: wearable.source,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGED SCORE  (combines manual scan answers with wearable modifiers)
// ─────────────────────────────────────────────────────────────────────────────
export function mergeScoreWithWearable(
  manualScore: number,
  modifiers: ScoringModifiers,
  scoreType: "energy" | "burnout" | "sleep"
): number {
  const delta =
    scoreType === "energy" ? modifiers.energyDelta
    : scoreType === "burnout" ? modifiers.burnoutDelta
    : modifiers.sleepDelta;
  return Math.max(0, Math.min(100, manualScore + delta));
}
