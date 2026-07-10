export type QualityPresetName = "performance" | "standard" | "high";

export interface QualityPreset {
  targetFps: number;
  renderScale: number;
  shadowSize: number;
  particles: number;
  bloom: boolean;
  maxDrones: number;
}

export const QUALITY_PRESETS: Record<QualityPresetName, QualityPreset> = {
  performance: { targetFps: 30, renderScale: 0.75, shadowSize: 512, particles: 0.5, bloom: false, maxDrones: 4 },
  standard: { targetFps: 30, renderScale: 0.95, shadowSize: 1024, particles: 1, bloom: true, maxDrones: 6 },
  high: { targetFps: 60, renderScale: 1, shadowSize: 1536, particles: 1, bloom: true, maxDrones: 6 }
};

export function loadQualityPreset(): QualityPresetName {
  const saved = localStorage.getItem("ashenRail.quality");
  return saved === "performance" || saved === "high" || saved === "standard" ? saved : "standard";
}
