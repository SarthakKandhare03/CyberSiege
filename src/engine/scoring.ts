// ============================================================
// CYBERPUNK SMART CITY — Scoring Engine
// Score calculation, grading, and feedback
// ============================================================
import type { MissionScore } from '../types/city';

// ============================================================
// Calculate final composite score
// ============================================================
export function calculateScore(
  currentScore: MissionScore,
  assetsRecovered: number,
  assetsLost: number,
): MissionScore {
  const recoveryBonus = assetsRecovered * 15;
  const lostPenalty = assetsLost * 20;

  const total = Math.max(
    0,
    Math.round(
      currentScore.total +
      recoveryBonus -
      lostPenalty +
      currentScore.defensesApplied * 5,
    ),
  );

  const servicesProtected = Math.max(0, Math.min(100,
    currentScore.servicesProtected + recoveryBonus * 0.5 - lostPenalty,
  ));

  return {
    ...currentScore,
    total,
    servicesProtected: Math.round(servicesProtected),
    downtimeAvoided: Math.round(Math.max(0, currentScore.downtimeAvoided)),
    citizenTrust: Math.round(Math.max(0, currentScore.citizenTrust)),
  };
}

// ============================================================
// Calculate letter grade
// ============================================================
export function calculateGrade(total: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (total >= 120) return 'A';
  if (total >= 90) return 'B';
  if (total >= 60) return 'C';
  if (total >= 30) return 'D';
  return 'F';
}

// ============================================================
// Generate feedback message
// ============================================================
export function generateFeedback(
  grade: 'A' | 'B' | 'C' | 'D' | 'F',
  assetsRecovered: number,
  assetsLost: number,
): string {
  const feedbackMap: Record<string, string> = {
    A: `Outstanding work, Commander! You recovered ${assetsRecovered} critical systems and maintained excellent citizen trust. Your rapid application of multi-layered defences is exactly what a world-class cyber defender does. The city's infrastructure is more resilient because of your actions.`,
    B: `Good job, Commander. You recovered ${assetsRecovered} systems and showed solid incident response skills. There is room to improve response speed and apply defences more proactively before incidents escalate. Keep practising — the city is counting on you.`,
    C: `Adequate response, Commander. You managed to recover ${assetsRecovered} systems, but ${assetsLost} systems were lost. Consider applying defences earlier in the incident timeline and using network segmentation to contain threats before they spread.`,
    D: `The city suffered significant disruption. ${assetsLost} systems remained offline or compromised at mission end. Focus on applying patches and MFA proactively, and use isolation to contain threats before they cascade to dependent systems.`,
    F: `Critical failure, Commander. The city\'s infrastructure was severely impacted. Review the learning materials, especially the sections on backups, MFA, and network segmentation. Remember: defenders must act fast and systematically. Try again — every attempt builds your skills.`,
  };
  return feedbackMap[grade] ?? feedbackMap.C;
}

// ============================================================
// Calculate city-wide health average
// ============================================================
export function calculateCityHealth(assetHealthValues: number[]): number {
  if (assetHealthValues.length === 0) return 100;
  const sum = assetHealthValues.reduce((a, b) => a + b, 0);
  return Math.round(sum / assetHealthValues.length);
}

// ============================================================
// Get city status label from average health
// ============================================================
export function getCityStatusLabel(health: number): string {
  if (health >= 90) return 'ALL SYSTEMS NOMINAL';
  if (health >= 70) return 'MINOR DISRUPTIONS';
  if (health >= 50) return 'SIGNIFICANT INCIDENTS';
  if (health >= 30) return 'CRITICAL SITUATION';
  return 'CITY UNDER ATTACK';
}
