// ─────────────────────────────────────────────────────────────────────────────
// Health Intelligence Pipeline
//
// Single orchestrator that wires scan data, wearable integrations, and
// personalization into one coherent flow.
//
//   User Data → Scan + Wearable → Personalization → Prediction → Recommendation
//
// All consumers should call runHealthPipeline() instead of the individual
// engines directly. The individual modules remain independently usable for
// unit testing and direct access.
// ─────────────────────────────────────────────────────────────────────────────

import {
  predictHealthTrends,
  type ScanDataPoint,
  type HealthPrediction,
} from "./predictHealthTrends";

import {
  loadPreferences,
  getPersonalizedMessage,
  type UserPreferences,
  type PersonalizedMessage,
} from "./personalization";

import {
  getExternalHealthMetrics,
  computeScoringModifiers,
  type ExternalHealthMetrics,
  type ScoringModifiers,
  type WearableSnapshot,
} from "./wearableIntegrations";

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface PipelineResult {
  /** Wearable-adjusted, personalization-aware health prediction */
  prediction: HealthPrediction;
  /** Greeting, insight, and recommendation personalised to this user */
  personalizedMessage: PersonalizedMessage;
  /** Raw merged wearable metrics (null fields = source unavailable) */
  wearableMetrics: ExternalHealthMetrics;
  /** Delta values applied to scan scores from wearable data */
  modifiers: ScoringModifiers;
  /** Resolved wearable snapshot (primary source used for copy generation) */
  wearable: WearableSnapshot | null;
  /** Loaded user preference history used for personalisation */
  prefs: UserPreferences;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
//
// Parameters:
//   rawScans         – scan history from the API, newest first
//   userName         – display name for personalised greeting
//   preloadedMetrics – optional pre-fetched wearable data (avoids double fetch)
// ─────────────────────────────────────────────────────────────────────────────

export async function runHealthPipeline(
  rawScans: ScanDataPoint[],
  userName?: string,
  preloadedMetrics?: ExternalHealthMetrics
): Promise<PipelineResult> {

  // ── Step 1: Fetch wearable data in parallel with preference load ──────────
  const [wearableMetrics, prefs] = await Promise.all([
    preloadedMetrics
      ? Promise.resolve(preloadedMetrics)
      : getExternalHealthMetrics(),
    loadPreferences(),
  ]);

  // ── Step 2: Compute wearable scoring modifiers ────────────────────────────
  // Pass the most recent scan answers so the sleep blending logic can
  // compare wearable hours vs the user's manual sleep score.
  const latestAnswers = rawScans[0]?.answers;
  const modifiers = computeScoringModifiers(wearableMetrics, latestAnswers);

  // Resolve the single wearable snapshot for copy generation
  // (wearable takes priority over apple_health if both are present)
  const wearable: WearableSnapshot | null =
    wearableMetrics.wearable ?? wearableMetrics.appleHealth ?? null;

  // ── Step 3: Run prediction with wearable-adjusted scan data ──────────────
  const prediction = predictHealthTrends(rawScans, modifiers);

  // ── Step 4: Generate personalized message ────────────────────────────────
  // Pass prediction result and wearable snapshot as context so the message
  // reflects the current risk level and live device signals.
  const personalizedMessage = await getPersonalizedMessage(userName, prefs, {
    prediction,
    wearable,
  });

  return {
    prediction,
    personalizedMessage,
    wearableMetrics,
    modifiers,
    wearable,
    prefs,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS
// Consumers that previously imported from individual modules can import from
// the pipeline without breaking existing call sites.
// ─────────────────────────────────────────────────────────────────────────────
export type { ScanDataPoint, HealthPrediction } from "./predictHealthTrends";
export { riskColor } from "./predictHealthTrends";
export type { PersonalizedMessage } from "./personalization";
export type { WearableSnapshot, ExternalHealthMetrics } from "./wearableIntegrations";
