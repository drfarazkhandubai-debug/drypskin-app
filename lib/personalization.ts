// ─────────────────────────────────────────────────────────────────────────────
// Hyper-Personalization Engine
//
// Stores learned preferences in AsyncStorage and returns dynamic copy that
// adjusts greetings, insights and recommendations based on real usage.
// Accepts optional live context (prediction result + wearable snapshot) so
// the generated message reflects the current moment, not only history.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HealthPrediction } from "./predictHealthTrends";
import type { WearableSnapshot } from "./wearableIntegrations";

const PREFS_KEY = "drypskin_user_prefs";

// ─── Data shapes ─────────────────────────────────────────────────────────────

export interface UserPreferences {
  moodFrequency: Record<string, number>;     // { tired: 5, glow: 2 }
  serviceFrequency: Record<string, number>;  // { "Gold Hydrafacial": 3 }
  scanScoreHistory: number[];                // overall scan scores (newest first)
  energyHistory: number[];                   // raw energy answer values (newest first)
  sleepHistory: number[];                    // raw sleep answer values
  stressHistory: number[];                   // raw stress answer values
  skinScoreHistory: number[];                // skin scan scores
  lastUpdated: string;
}

export interface PersonalizedMessage {
  greeting: string;
  insight: string;
  recommendation: string;
  serviceToHighlight: string;
}

/** Live signals passed from the pipeline to personalise the message */
export interface PersonalizationContext {
  prediction?: HealthPrediction;
  wearable?: WearableSnapshot | null;
}

const DEFAULT_PREFS: UserPreferences = {
  moodFrequency: {},
  serviceFrequency: {},
  scanScoreHistory: [],
  energyHistory: [],
  sleepHistory: [],
  stressHistory: [],
  skinScoreHistory: [],
  lastUpdated: new Date().toISOString(),
};

// ─── Persistence ─────────────────────────────────────────────────────────────

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PREFS };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, lastUpdated: new Date().toISOString() }));
  } catch {}
}

// ─── Event recorders  (call these from scan completion, booking, etc.) ───────

export async function recordMoodSelection(mood: string): Promise<void> {
  const prefs = await loadPreferences();
  prefs.moodFrequency[mood] = (prefs.moodFrequency[mood] ?? 0) + 1;
  await savePreferences(prefs);
}

export async function recordServiceBooking(serviceName: string): Promise<void> {
  const prefs = await loadPreferences();
  prefs.serviceFrequency[serviceName] = (prefs.serviceFrequency[serviceName] ?? 0) + 1;
  await savePreferences(prefs);
}

export async function recordScanResult(params: {
  overallScore: number;
  energyScore?: number;
  sleepScore?: number;
  stressScore?: number;
  skinScore?: number;
}): Promise<void> {
  const prefs = await loadPreferences();
  // Keep newest first, cap at 20 entries
  const push = <T>(arr: T[], val: T, limit = 20): T[] => [val, ...arr].slice(0, limit);
  prefs.scanScoreHistory = push(prefs.scanScoreHistory, params.overallScore);
  if (params.energyScore !== undefined) prefs.energyHistory = push(prefs.energyHistory, params.energyScore);
  if (params.sleepScore !== undefined)  prefs.sleepHistory  = push(prefs.sleepHistory,  params.sleepScore);
  if (params.stressScore !== undefined) prefs.stressHistory = push(prefs.stressHistory, params.stressScore);
  if (params.skinScore !== undefined)   prefs.skinScoreHistory = push(prefs.skinScoreHistory, params.skinScore);
  await savePreferences(prefs);
}

// ─── Analysis helpers ────────────────────────────────────────────────────────

function topKey(freq: Record<string, number>): string | null {
  const entries = Object.entries(freq);
  if (!entries.length) return null;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function detectPattern(arr: number[]): string | null {
  // Look for recurring dips in a rolling window
  if (arr.length < 5) return null;
  const dips = arr.reduce((count, v, i) => {
    if (i > 0 && v < 40 && arr[i - 1] >= 40) return count + 1;
    return count;
  }, 0);
  if (dips >= 2) return "recurring";
  return null;
}

// ─── MAIN FUNCTION ───────────────────────────────────────────────────────────
//
// Context parameter enriches the output with live signals:
//   - prediction.riskLevel  → urgency of greeting/recommendation
//   - prediction.recommendation → seeded into recommendation copy
//   - wearable.steps / .hrv / .sleep → wearable-specific insight lines
//
// All context fields are optional; the function degrades gracefully to
// history-only personalisation when context is absent.

export async function getPersonalizedMessage(
  userName?: string,
  prefs?: UserPreferences,
  context?: PersonalizationContext
): Promise<PersonalizedMessage> {
  const p = prefs ?? (await loadPreferences());
  const { prediction, wearable } = context ?? {};

  const firstName = userName?.split(" ")[0] ?? "there";
  const topMood = topKey(p.moodFrequency);
  const topService = topKey(p.serviceFrequency);
  const avgEnergy = avg(p.energyHistory);
  const avgSkin = avg(p.skinScoreHistory);
  const avgScan = avg(p.scanScoreHistory);
  const avgStress = avg(p.stressHistory);
  const energyPattern = detectPattern(p.energyHistory);

  // Live risk from prediction (beats historical average if present)
  const isHighRisk = prediction?.riskLevel === "high";
  const isMediumRisk = prediction?.riskLevel === "medium";
  const isLowRisk = prediction?.riskLevel === "low";

  // Wearable signals (normalised for copy selection)
  const wearableStepsLow = wearable?.steps !== undefined && wearable.steps < 5000;
  const wearableSleepShort = wearable?.sleep !== undefined && wearable.sleep < 6;
  const wearableHrvLow = wearable?.hrv !== undefined && wearable.hrv < 30;
  const wearableReadinessHigh = "readinessScore" in (wearable ?? {}) &&
    (wearable as any)?.readinessScore > 80;

  // ── Greeting ──────────────────────────────────────────────────────────────
  // Priority: live prediction risk > wearable signals > mood history > scan average
  let greeting = `Welcome back, ${firstName}.`;

  if (isHighRisk) {
    greeting = `Welcome back, ${firstName}. Your body's calling for attention today.`;
  } else if (wearableSleepShort && wearableHrvLow) {
    greeting = `Welcome back, ${firstName}. Sleep and recovery are down — let's fix that.`;
  } else if (topMood === "tired" || topMood === "exhausted" || avgEnergy < 40) {
    greeting = `Welcome back, ${firstName}. Ready for your usual energy boost?`;
  } else if (topMood === "glow" || avgSkin < 40) {
    greeting = `Welcome back, ${firstName}. Your skin journey continues.`;
  } else if (wearableReadinessHigh && isLowRisk) {
    greeting = `Welcome back, ${firstName} — your body is primed. Let's optimise.`;
  } else if (topService) {
    greeting = `Welcome back, ${firstName}. Ready for another session?`;
  } else if (avgScan >= 70) {
    greeting = `Welcome back, ${firstName} — looking well! Let's keep the momentum.`;
  }

  // ── Insight ───────────────────────────────────────────────────────────────
  // Priority: wearable-specific signal > prediction data source > pattern history
  let insight = "Keep up your wellness routine and check back after your next scan.";

  if (wearableStepsLow && wearableSleepShort) {
    insight = "Low activity and short sleep detected via your wearable — energy reserves are running low.";
  } else if (wearableHrvLow) {
    insight = "Your HRV is below optimal — your nervous system is under strain. Recovery support is recommended.";
  } else if (wearableStepsLow) {
    insight = "You've had a low-movement day. Light activity or an energising IV drip can reset your energy.";
  } else if (prediction?.dataSource === "scan+wearable" && isMediumRisk) {
    insight = "Wearable data combined with your scan history shows an emerging pattern worth addressing.";
  } else if (energyPattern === "recurring" && p.energyHistory.length >= 5) {
    insight = "You tend to feel low energy every 5–7 days — your body may benefit from regular IV support.";
  } else if (avgEnergy < 40 && p.energyHistory.length >= 2) {
    insight = "Your energy has been consistently low — consider an energising IV drip.";
  } else if (avgSkin < 40 && p.skinScoreHistory.length >= 2) {
    insight = "Your skin scores have been low recently — a Glow IV or HydraFacial could help.";
  } else if (avgScan >= 75) {
    insight = "Your health scores are trending positively — great work staying consistent.";
  } else if (p.stressHistory.length >= 2 && avgStress > 60) {
    insight = "Stress has been elevated across your last few scans — recovery treatments may help.";
  }

  // ── Recommendation ────────────────────────────────────────────────────────
  // Priority: live prediction recommendation (seeded) > wearable signals > user history
  let recommendation = "Explore our full treatment menu to find what suits you today.";
  let serviceToHighlight = "Health Scan";

  if (isHighRisk && prediction?.recommendation) {
    // Use the prediction's recommendation directly — it's already the most specific
    recommendation = prediction.recommendation;
    serviceToHighlight = "IV Therapy";
  } else if (wearableSleepShort && wearableHrvLow) {
    recommendation = "NAD+ IV Drip or Hakuna Recovery IV — restores cellular energy and reduces cortisol.";
    serviceToHighlight = "IV Therapy";
  } else if (wearableStepsLow && isMediumRisk) {
    recommendation = "A Bagira Energising IV with a movement protocol can break the low-activity cycle.";
    serviceToHighlight = "IV Therapy";
  } else if (topMood === "tired" || avgEnergy < 40) {
    recommendation = "Energy IV — Simba or Bagira drip to restore cellular energy.";
    serviceToHighlight = "IV Therapy";
  } else if (avgSkin < 40 || topMood === "glow") {
    recommendation = "Glow IV or a Gold HydraFacial for deep skin restoration.";
    serviceToHighlight = "Aesthetic Services";
  } else if (avgStress > 60) {
    recommendation = "Hakuna Recovery IV or a Burnout Protocol consultation.";
    serviceToHighlight = "IV Therapy";
  } else if (topService) {
    recommendation = `Re-book your favourite: ${topService}`;
    serviceToHighlight = topService;
  } else if (isMediumRisk && prediction?.recommendation) {
    recommendation = prediction.recommendation;
    serviceToHighlight = "IV Therapy";
  } else if (p.scanScoreHistory.length === 0) {
    recommendation = "Complete a Health Scan to unlock your personalised plan.";
    serviceToHighlight = "Health Scan";
  }

  return { greeting, insight, recommendation, serviceToHighlight };
}
