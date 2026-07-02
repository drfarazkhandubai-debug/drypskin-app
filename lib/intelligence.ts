// ─────────────────────────────────────────────────────────────────────────────
// Wellness Intelligence Layer
//
// Sits above runHealthPipeline() and maps its output into the canonical
// WellnessInsight shape consumed by the UI.  Also generates premium
// doctor-style prose and calculates contextual social proof / comparison deltas.
//
// NEVER duplicates prediction or personalization logic — it only interprets
// and enriches the PipelineResult that the pipeline already computed.
// ─────────────────────────────────────────────────────────────────────────────

import type { PipelineResult } from "./healthPipeline";

// ─── Output shape ─────────────────────────────────────────────────────────────

export interface WellnessInsight {
  greeting: string;
  insight: string;
  prediction: string;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  urgency: boolean;
  doctorMessage: string;
  ctaRoute: string;
  ctaLabel: string;
  socialProof: string | null;
  comparisonDelta: string | null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function ctaRouteFor(serviceToHighlight: string): { route: string; label: string } {
  const svc = serviceToHighlight.toLowerCase();
  if (svc.includes("iv") || svc.includes("drip")) {
    return { route: "/iv-therapy", label: "Fix This Now" };
  }
  if (svc.includes("aesthetic") || svc.includes("facial") || svc.includes("laser") || svc.includes("glow")) {
    return { route: "/services", label: "Explore Treatments" };
  }
  if (svc.includes("scan") || svc.includes("health scan")) {
    return { route: "/extras/scan", label: "Start Health Scan" };
  }
  // Fallback — urgency drives the label
  return { route: "/extras/scan", label: "Fix This Now" };
}

function comparisonDelta(history: number[]): string | null {
  if (history.length < 2) return null;
  const latest = history[0];
  const baseline = avg(history.slice(1, Math.min(5, history.length)));
  if (baseline === 0) return null;
  const pct = Math.round(Math.abs((latest - baseline) / baseline) * 100);
  if (pct < 5) return null;
  const direction = latest < baseline ? "dropped" : "improved";
  return `Your energy ${direction} ${pct}% since your last check`;
}

function socialProofFor(serviceToHighlight: string, sessionCount: number): string | null {
  if (sessionCount >= 3) {
    return `Recommended based on your last ${sessionCount} sessions`;
  }
  const svc = serviceToHighlight.toLowerCase();
  if (svc.includes("iv") || svc.includes("drip")) {
    return "Most chosen for energy and recovery";
  }
  if (svc.includes("scan")) {
    return "Takes 2 minutes · No equipment needed";
  }
  return "Available today";
}

// ─── Doctor message ───────────────────────────────────────────────────────────
//
// Generates human, clinical-sounding prose. No generic phrasing, no robotic
// tone. Uses the most specific signal available (wearable > scan > history).

export function generateDoctorMessage(result: PipelineResult): string {
  const { prediction, prefs, wearable } = result;
  const { riskLevel, recommendation } = prediction;

  const energyAvg = avg(prefs.energyHistory);
  const scanCount = prefs.scanScoreHistory.length;
  const energyCount = prefs.energyHistory.length;

  if (riskLevel === "high") {
    if (wearable?.sleep !== undefined && wearable.sleep < 5) {
      return (
        "Your sleep duration is critically low and your scan data confirms the cellular impact. " +
        "A NAD+ or Recovery IV within the next 24 hours will restore mitochondrial function " +
        "and prevent this from deepening into prolonged fatigue."
      );
    }
    if (wearable?.hrv !== undefined && wearable.hrv < 25) {
      return (
        "Your heart rate variability indicates your autonomic nervous system is under significant load. " +
        "Combined with your recent scan patterns, recovery support is now advisable. " +
        "A Hakuna Recovery IV will help reset your baseline before symptoms progress."
      );
    }
    const subject = prediction.prediction.toLowerCase().includes("fatigue")
      ? "fatigue and dehydration"
      : "stress overload and cellular depletion";
    return (
      `Your body is showing early signs of ${subject}. ` +
      `${recommendation.split(".")[0]}. ` +
      "Acting within the next 24 hours gives you the best chance of a full reset."
    );
  }

  if (riskLevel === "medium") {
    if (energyAvg < 45 && energyCount >= 2) {
      return (
        `Your energy has been consistently below optimal across your last ${energyCount} readings. ` +
        "This pattern suggests your body's recovery reserves are running low. " +
        "An energising IV drip now can break this cycle before it deepens."
      );
    }
    if (wearable?.steps !== undefined && wearable.steps < 4000) {
      return (
        "Low movement combined with your scan history suggests your energy reserves are not fully restored. " +
        "A targeted IV protocol will accelerate your cellular recharge and restore peak performance."
      );
    }
    if (wearable?.sleep !== undefined && wearable.sleep < 6.5) {
      return (
        "Your sleep is slightly below your optimal threshold. " +
        "Over time this chips away at recovery capacity. " +
        "A sleep-support IV with magnesium and B-complex can help recalibrate your rhythm."
      );
    }
    return (
      "Your wellness indicators are slightly off-balance — nothing urgent, but worth addressing now. " +
      `${recommendation.split(".")[0]}. ` +
      "Staying ahead of these signals is what separates good health from optimal health."
    );
  }

  // Low risk
  if (scanCount === 0) {
    return (
      "Every precision wellness plan starts with a baseline. " +
      "A 2-minute Health Scan gives us the data to tailor your protocol — " +
      "from IV drips to peptide selection — specifically to your body's needs."
    );
  }
  if (scanCount >= 3) {
    return (
      "Your health profile is tracking well across your last " +
      `${scanCount} check-ins. ` +
      "Consistent monitoring is what keeps high performers ahead of the curve. " +
      "Consider a maintenance IV to sustain this momentum."
    );
  }
  return (
    "Your current indicators are within a healthy range. " +
    "Keep up your routine and consider scheduling a maintenance session — " +
    "small, consistent interventions deliver the most lasting results."
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function generateWellnessInsight(result: PipelineResult): WellnessInsight {
  const { prediction, personalizedMessage: msg, prefs } = result;

  const { route: ctaRoute, label: ctaLabel } = ctaRouteFor(msg.serviceToHighlight);
  const sessionCount = prefs.serviceFrequency[msg.serviceToHighlight] ?? 0;
  const totalSessions = Object.values(prefs.serviceFrequency).reduce((s, v) => s + v, 0);

  const urgency =
    prediction.riskLevel === "high" ||
    (prediction.riskLevel === "medium" &&
      prefs.energyHistory.length >= 2 &&
      avg(prefs.energyHistory) < 40);

  return {
    greeting: msg.greeting,
    insight: msg.insight,
    prediction: prediction.prediction,
    riskLevel: prediction.riskLevel as "low" | "medium" | "high",
    recommendation: msg.recommendation,
    urgency,
    doctorMessage: generateDoctorMessage(result),
    ctaRoute,
    ctaLabel,
    socialProof: socialProofFor(msg.serviceToHighlight, totalSessions > 0 ? sessionCount : 0),
    comparisonDelta: comparisonDelta(prefs.energyHistory),
  };
}
