// ─────────────────────────────────────────────────────────────────────────────
// Predictive Health Trend Engine
//
// Takes historical health scan data and optional wearable modifiers, then
// returns a 48-hour prediction with risk level and recommendation.
// All inputs are on a 0-100 scale.
// ─────────────────────────────────────────────────────────────────────────────

import type { ScoringModifiers } from "./wearableIntegrations";

export type TrendDirection = "increasing" | "decreasing" | "stable";
export type RiskLevel = "low" | "medium" | "high";

export interface ScanDataPoint {
  date?: string;
  answers: {
    energy?: number;
    sleep?: number;
    stress?: number;
    hydration?: number;
    exercise?: number;
    diet?: number;
    [key: string]: number | undefined;
  };
  score?: number;
}

export interface TrendResult {
  energy: TrendDirection;
  sleep: TrendDirection;
  stress: TrendDirection;
  hydration: TrendDirection;
}

export interface HealthPrediction {
  prediction: string;
  riskLevel: RiskLevel;
  recommendation: string;
  confidence: "low" | "medium" | "high";
  trends: TrendResult;
  predictedIn: string;
  /** Which data sources were used: "scan+wearable" | "scan_only" | "insufficient" */
  dataSource: "scan+wearable" | "scan_only" | "insufficient";
  /** The wearable source id, if modifiers were applied */
  wearableSource?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TREND CALCULATOR
// Compares the most recent scan against the average of prior scans
// ─────────────────────────────────────────────────────────────────────────────
function calcTrend(values: number[]): TrendDirection {
  if (values.length < 2) return "stable";
  const recent = values[0];                                       // newest first
  const prior = values.slice(1).reduce((s, v) => s + v, 0) / (values.length - 1);
  const delta = recent - prior;
  if (delta < -8) return "decreasing";
  if (delta > 8) return "increasing";
  return "stable";
}

function extractField(scans: ScanDataPoint[], field: string): number[] {
  return scans
    .map((s) => s.answers?.[field])
    .filter((v): v is number => v !== undefined && v !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PREDICTION FUNCTION
//
// wearableModifiers: optional delta values from wearable/external sources.
// When provided, they are blended with the latest scan answers before rules
// fire — so wearable signals amplify or dampen the prediction outcome.
// ─────────────────────────────────────────────────────────────────────────────
export function predictHealthTrends(
  scans: ScanDataPoint[],
  wearableModifiers?: ScoringModifiers
): HealthPrediction {
  const hasWearable = !!wearableModifiers && wearableModifiers.source !== "manual";
  const dataSource: HealthPrediction["dataSource"] =
    scans.length === 0 ? "insufficient"
    : hasWearable ? "scan+wearable"
    : "scan_only";

  // Require at least one scan; with only one we still produce a useful result
  if (!scans || scans.length === 0) {
    return {
      prediction: "Complete your first Health Scan to unlock predictions.",
      riskLevel: "low",
      recommendation: "Start a Health Scan in the Wellness Hub.",
      confidence: "low",
      trends: { energy: "stable", sleep: "stable", stress: "stable", hydration: "stable" },
      predictedIn: "—",
      dataSource,
    };
  }

  const energyVals    = extractField(scans, "energy");
  const sleepVals     = extractField(scans, "sleep");
  const stressVals    = extractField(scans, "stress");
  const hydrationVals = extractField(scans, "hydration");

  const trends: TrendResult = {
    energy:    calcTrend(energyVals),
    sleep:     calcTrend(sleepVals),
    stress:    calcTrend(stressVals),
    hydration: calcTrend(hydrationVals),
  };

  // Latest raw values (0-100 scale)
  const latestEnergy    = energyVals[0]    ?? 50;
  const latestSleep     = sleepVals[0]     ?? 50;
  const latestStress    = stressVals[0]    ?? 50;
  const latestHydration = hydrationVals[0] ?? 50;

  // ── Apply wearable modifiers to latest values ─────────────────────────────
  // energyDelta:  negative = wearable signals low energy (low steps, short sleep)
  // burnoutDelta: positive = wearable signals elevated burnout risk (low HRV, bad sleep)
  // sleepDelta:   bridges wearable sleep hours vs manual sleep score
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const adjEnergy    = clamp(latestEnergy    + (wearableModifiers?.energyDelta  ?? 0));
  const adjSleep     = clamp(latestSleep     + (wearableModifiers?.sleepDelta   ?? 0));
  const adjStress    = clamp(latestStress    + (wearableModifiers?.burnoutDelta ?? 0));
  const adjHydration = latestHydration; // no wearable hydration signal yet

  // Map 0-100 score to 1-5 bucket for rule evaluation
  const toScale = (v: number) => Math.max(1, Math.ceil(v / 20));
  const energyScale    = toScale(adjEnergy);
  const sleepScale     = toScale(adjSleep);
  const stressScale    = toScale(adjStress);
  const hydrationScale = toScale(adjHydration);

  const confidence = scans.length >= 3 ? "high" : scans.length === 2 ? "medium" : "low";
  const meta = { confidence, trends, dataSource, wearableSource: wearableModifiers?.source };

  // ── Rule evaluation (priority order: most severe first) ───────────────────

  // Rule 1: Energy decreasing + poor sleep → fatigue prediction
  if (trends.energy === "decreasing" && sleepScale < 3) {
    return {
      prediction: "Energy likely to drop significantly in 24–48 hours.",
      riskLevel: "high",
      recommendation: "Consider a Simba IV Drip or Bagira Energising IV today to restore cellular energy.",
      predictedIn: "24–36 hours",
      ...meta,
    };
  }

  // Rule 2: High stress + low hydration → burnout risk
  if (stressScale > 3 && hydrationScale < 3) {
    return {
      prediction: "Burnout risk elevated over the next 48 hours.",
      riskLevel: "high",
      recommendation: "Book a Hakuna IV Drip for stress recovery and rehydration today.",
      predictedIn: "24–48 hours",
      ...meta,
    };
  }

  // Rule 3: Wearable amplifies stress even with moderate scan stress
  if (hasWearable && (wearableModifiers!.burnoutDelta > 15) && stressScale >= 3) {
    return {
      prediction: "Wearable data shows elevated strain — burnout window opening.",
      riskLevel: "high",
      recommendation: "Your recovery metrics are low. A Hakuna Recovery IV or NAD+ drip is recommended today.",
      predictedIn: "24–48 hours",
      ...meta,
    };
  }

  // Rule 4: Low hydration alone → energy drop
  if (hydrationScale < 3) {
    return {
      prediction: "Energy drop likely in 24–48 hours due to low hydration.",
      riskLevel: "medium",
      recommendation: "Consider an Ocean IV or increase water to 2+ litres before your next scan.",
      predictedIn: "24–48 hours",
      ...meta,
    };
  }

  // Rule 5: Stress trending up
  if (trends.stress === "increasing" && stressScale > 3) {
    return {
      prediction: "Stress levels are climbing — recovery window in the next 48 hours.",
      riskLevel: "medium",
      recommendation: "A Burnout Recovery session or Glutathione IV would support cortisol balance.",
      predictedIn: "24–48 hours",
      ...meta,
    };
  }

  // Rule 6: Low steps + declining energy (wearable confirms sedentary day)
  if (hasWearable && (wearableModifiers!.energyDelta < -10) && trends.energy === "decreasing") {
    return {
      prediction: "Low activity combined with declining scan scores — energy crash likely.",
      riskLevel: "medium",
      recommendation: "A Bagira Energising IV or light movement protocol is recommended within 24 hours.",
      predictedIn: "24–36 hours",
      ...meta,
    };
  }

  // Rule 7: Energy trending down (without critical sleep deficit)
  if (trends.energy === "decreasing" && energyScale < 4) {
    return {
      prediction: "Gradual energy decline detected — act before it worsens.",
      riskLevel: "medium",
      recommendation: "Prioritise sleep hygiene and consider an energising IV drip this week.",
      predictedIn: "36–48 hours",
      ...meta,
    };
  }

  // Rule 8: Sleep trending down
  if (trends.sleep === "decreasing" && sleepScale < 4) {
    return {
      prediction: "Sleep quality deteriorating — cognitive and energy impact likely.",
      riskLevel: "medium",
      recommendation: "Try the Sleep Optimiser in your Wellness Hub and consider melatonin support.",
      predictedIn: "48 hours",
      ...meta,
    };
  }

  // Rule 9: All stable or improving
  if (energyScale >= 4 && sleepScale >= 4 && stressScale <= 3) {
    return {
      prediction: "All health markers are stable — keep up your current routine.",
      riskLevel: "low",
      recommendation: "Maintain hydration, consistent sleep, and your supplement protocol.",
      predictedIn: "—",
      ...meta,
    };
  }

  // Default: mild concern
  return {
    prediction: "Some metrics need attention in the next 48 hours.",
    riskLevel: "medium",
    recommendation: "Complete a full Health Scan for a more precise recommendation.",
    predictedIn: "48 hours",
    ...meta,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK COLOUR HELPER  (for UI consumers)
// ─────────────────────────────────────────────────────────────────────────────
export function riskColor(level: RiskLevel): string {
  return level === "high" ? "#EF4444" : level === "medium" ? "#F59E0B" : "#22C55E";
}
