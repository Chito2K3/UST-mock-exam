import { MOCK_QUESTIONS } from '../data/mockQuestions.js';
import { SUBTEST_SPECS, SET_CATALOG } from '../data/setRegistry.js';
import { shuffleArray, shuffleChoices, shuffleQuestionsBySubtest } from './randomizer.js';

/**
 * Intelligent balanced sampler that draws items matching difficulty distribution.
 */
function sampleBalancedItems(pool, targetCount) {
  if (targetCount >= pool.length) {
    return shuffleArray(pool);
  }

  const easy = pool.filter((q) => q.difficulty === 'EASY');
  const medium = pool.filter((q) => q.difficulty === 'MEDIUM');
  const hard = pool.filter((q) => q.difficulty === 'HARD');

  // Realistic USTET Difficulty Ratio: ~30% Easy, ~50% Medium, ~20% Hard
  const easyTarget = Math.max(1, Math.round(targetCount * 0.3));
  const hardTarget = Math.max(1, Math.round(targetCount * 0.2));
  const mediumTarget = targetCount - easyTarget - hardTarget;

  const shuffledEasy = shuffleArray(easy);
  const shuffledMed = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);

  const selected = [
    ...shuffledEasy.slice(0, Math.min(easyTarget, shuffledEasy.length)),
    ...shuffledMed.slice(0, Math.min(mediumTarget, shuffledMed.length)),
    ...shuffledHard.slice(0, Math.min(hardTarget, shuffledHard.length)),
  ];

  // If we still need more to meet targetCount (due to uneven pools)
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remainder = pool.filter((q) => !selectedIds.has(q.id));
    const extraNeeded = targetCount - selected.length;
    selected.push(...shuffleArray(remainder).slice(0, extraNeeded));
  }

  return selected.slice(0, targetCount);
}

/**
 * Main Question Generator function.
 * Generates an accurate, curated, or dynamically balanced exam payload.
 *
 * @param {Object} options
 * @param {string} options.scope - 'full' | 'mental_ability' | 'english' | 'mathematics' | 'science'
 * @param {string} options.setId - 'dynamic' | 'set_a' | 'set_b' | 'express'
 * @param {string} options.lengthMode - 'standard' | 'sprint' | 'express'
 * @param {boolean} options.shuffleQuestions - default true
 * @param {boolean} options.randomizeChoices - default true
 * @param {string} options.difficultyTier - 'all' | 'EASY' | 'MEDIUM' | 'HARD'
 */
export function generateExamSet({
  scope = 'full',
  setId = 'dynamic',
  lengthMode = 'standard',
  shuffleQuestions = true,
  randomizeChoices = true,
  difficultyTier = 'all',
} = {}) {
  let activeSubtests = [];
  if (scope === 'full') {
    activeSubtests = ['mental_ability', 'english', 'mathematics', 'science'];
  } else {
    activeSubtests = [scope];
  }

  const generatedQuestions = [];
  let calculatedDurationMinutes = 0;

  activeSubtests.forEach((subtestKey) => {
    const spec = SUBTEST_SPECS[subtestKey];
    let subtestPool = MOCK_QUESTIONS.filter((q) => q.subtest === subtestKey);

    if (difficultyTier !== 'all') {
      subtestPool = subtestPool.filter((q) => q.difficulty === difficultyTier);
    }

    // Determine target count & duration for this subtest
    let targetCount = spec.standardItems;
    let sectionMinutes = spec.standardMinutes;

    if (lengthMode === 'sprint') {
      targetCount = spec.sprintItems;
      sectionMinutes = spec.sprintMinutes;
    } else if (lengthMode === 'express' || setId === 'express') {
      targetCount = 15;
      sectionMinutes = 11; // 11 mins * 4 = 44~45 mins
    }

    calculatedDurationMinutes += sectionMinutes;

    let sampled = [];

    if (setId === 'dynamic') {
      // Dynamic balanced algorithmic generation
      sampled = sampleBalancedItems(subtestPool, targetCount);
    } else if (setId === 'set_a') {
      if (targetCount >= subtestPool.length) {
        sampled = [...subtestPool];
      } else {
        // Take front half
        sampled = subtestPool.slice(0, targetCount);
      }
    } else if (setId === 'set_b') {
      if (targetCount >= subtestPool.length) {
        // Reverse order / alternating items to feel distinct from set A
        sampled = [...subtestPool].reverse();
      } else {
        // Take back half
        sampled = subtestPool.slice(-targetCount);
      }
    } else if (setId === 'express') {
      sampled = sampleBalancedItems(subtestPool, 15);
    } else {
      sampled = sampleBalancedItems(subtestPool, targetCount);
    }

    generatedQuestions.push(...sampled);
  });

  // Apply choice shuffling if requested
  let finalQuestions = generatedQuestions;
  if (randomizeChoices) {
    finalQuestions = finalQuestions.map((q) => shuffleChoices(q));
  }

  // Apply question order shuffling while keeping sections grouped
  if (shuffleQuestions) {
    finalQuestions = shuffleQuestionsBySubtest(finalQuestions, {
      shuffleQuestions: true,
      randomizeChoices: false, // Already randomized above
    });
  }

  // Construct readable titles and badges
  let title = 'USTET Full 4-Part Simulation';
  let badge = 'Official Simulation';
  let subtitle = 'All 4 standard sections with authentic timing and section locking';

  const setMeta = SET_CATALOG.find((s) => s.id === setId);

  if (scope !== 'full') {
    const spec = SUBTEST_SPECS[scope];
    title = `${spec.title} Focus Examination`;
    badge = `${spec.title} • ${lengthMode.toUpperCase()}`;
    subtitle = `${spec.subtitle} (${finalQuestions.length} Items • ${calculatedDurationMinutes} mins)`;
  } else {
    if (setId === 'dynamic') {
      title = 'USTET Procedural Mock Examination';
      badge = '🎲 Algorithmic Set';
      subtitle = `Synthesized balanced set (${finalQuestions.length} Items across all 4 USTET domains)`;
    } else if (setId === 'set_a') {
      title = 'USTET Calibration Set A';
      badge = 'Curated Set A';
      subtitle = `Standard official calibration (${finalQuestions.length} Items • ${calculatedDurationMinutes} mins)`;
    } else if (setId === 'set_b') {
      title = 'USTET Challenger Set B';
      badge = 'Curated Set B';
      subtitle = `High-yield alternative set (${finalQuestions.length} Items • ${calculatedDurationMinutes} mins)`;
    } else if (setId === 'express' || lengthMode === 'express') {
      title = 'USTET Express Diagnostic';
      badge = 'Express Diagnostic';
      subtitle = `Rapid 60-item diagnostic benchmark (${calculatedDurationMinutes} mins)`;
    }
  }

  return {
    questions: finalQuestions,
    activeSubtests,
    totalItems: finalQuestions.length,
    durationMinutes: calculatedDurationMinutes,
    title,
    badge,
    subtitle,
    setName: title,
    scope,
    setId,
    lengthMode,
    difficultyTier,
  };
}
