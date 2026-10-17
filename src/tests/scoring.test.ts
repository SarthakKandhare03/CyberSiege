// ============================================================
// UNIT TESTS — Scoring Engine
// ============================================================
import { describe, it, expect } from 'vitest';
import { calculateScore, calculateGrade, generateFeedback, calculateCityHealth, getCityStatusLabel, summarizeCity } from '../engine/scoring';
import { INITIAL_ASSETS } from '../data/assets';
import type { MissionScore } from '../types/city';

const baseScore: MissionScore = {
  total: 50,
  servicesProtected: 80,
  downtimeAvoided: 70,
  citizenTrust: 90,
  defensesApplied: 3,
};

describe('calculateScore', () => {
  it('adds recovery bonuses for recovered assets', () => {
    const result = calculateScore(baseScore, 3, 0);
    // 3 recovered * 15 = +45 bonus + 3 defenses * 5 = +15
    expect(result.total).toBeGreaterThan(baseScore.total);
  });

  it('penalises for lost assets', () => {
    const result = calculateScore(baseScore, 0, 3);
    // 3 lost * 20 = -60 penalty
    expect(result.total).toBeLessThan(baseScore.total);
  });

  it('total score is never negative', () => {
    const result = calculateScore(baseScore, 0, 10);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('servicesProtected is capped at 100', () => {
    const result = calculateScore(baseScore, 10, 0);
    expect(result.servicesProtected).toBeLessThanOrEqual(100);
  });

  it('citizenTrust is not modified by calculateScore', () => {
    const result = calculateScore(baseScore, 0, 0);
    expect(result.citizenTrust).toBe(baseScore.citizenTrust);
  });
});

describe('calculateGrade', () => {
  it('returns A for scores >= 120', () => {
    expect(calculateGrade(120)).toBe('A');
    expect(calculateGrade(200)).toBe('A');
  });

  it('returns B for scores 90–119', () => {
    expect(calculateGrade(90)).toBe('B');
    expect(calculateGrade(119)).toBe('B');
  });

  it('returns C for scores 60–89', () => {
    expect(calculateGrade(60)).toBe('C');
    expect(calculateGrade(89)).toBe('C');
  });

  it('returns D for scores 30–59', () => {
    expect(calculateGrade(30)).toBe('D');
    expect(calculateGrade(59)).toBe('D');
  });

  it('returns F for scores < 30', () => {
    expect(calculateGrade(0)).toBe('F');
    expect(calculateGrade(29)).toBe('F');
  });
});

describe('generateFeedback', () => {
  it('returns a non-empty string for each grade', () => {
    const grades = ['A', 'B', 'C', 'D', 'F'] as const;
    for (const grade of grades) {
      const feedback = generateFeedback(grade, 2, 1);
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
      expect(feedback.length).toBeGreaterThan(10);
    }
  });

  it('mentions number of recovered assets in A grade feedback', () => {
    const feedback = generateFeedback('A', 3, 0);
    expect(feedback).toContain('3');
  });
});

describe('calculateCityHealth', () => {
  it('returns 100 for empty array', () => {
    expect(calculateCityHealth([])).toBe(100);
  });

  it('calculates average correctly', () => {
    expect(calculateCityHealth([80, 60, 100])).toBe(80);
  });

  it('returns 0 when all health is 0', () => {
    expect(calculateCityHealth([0, 0, 0])).toBe(0);
  });
});

describe('getCityStatusLabel', () => {
  it('returns nominal for health >= 90', () => {
    expect(getCityStatusLabel(100)).toBe('ALL SYSTEMS NOMINAL');
    expect(getCityStatusLabel(90)).toBe('ALL SYSTEMS NOMINAL');
  });

  it('returns minor disruptions for health 70–89', () => {
    expect(getCityStatusLabel(70)).toBe('MINOR DISRUPTIONS');
  });

  it('returns critical for health 30–49', () => {
    expect(getCityStatusLabel(40)).toBe('CRITICAL SITUATION');
  });

  it('returns under attack for health < 30', () => {
    expect(getCityStatusLabel(0)).toBe('CITY UNDER ATTACK');
  });
});

describe('summarizeCity', () => {
  const assets = Object.values(INITIAL_ASSETS);

  it('reports a calm, fully secure city at start', () => {
    const summary = summarizeCity(assets);
    expect(summary.health).toBe(100);
    expect(summary.total).toBe(assets.length);
    expect(summary.secure).toBe(assets.length);
    expect(summary.threatLevel).toBe(0);
  });

  it('raises the threat level as assets are compromised', () => {
    const attacked = assets.map((a, i) =>
      i < 4 ? { ...a, status: 'compromised' as const, health: 20 } : a,
    );
    const summary = summarizeCity(attacked);
    expect(summary.compromised).toBe(4);
    expect(summary.secure).toBe(assets.length - 4);
    expect(summary.threatLevel).toBeGreaterThan(0.4);
    expect(summary.threatLevel).toBeLessThanOrEqual(1);
  });

  it('handles an empty asset list', () => {
    expect(summarizeCity([]).threatLevel).toBe(0);
  });
});
