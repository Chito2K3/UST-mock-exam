/**
 * Utility functions for question shuffling, option choice randomization,
 * and balanced question set generation.
 */

// Standard Fisher-Yates array shuffle (returns a new array)
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Randomizes the choices (A, B, C, D) for a question while preserving
 * the correct answer pointer.
 */
export function shuffleChoices(question) {
  if (!question.options || question.options.length < 2) return question;

  const correctOption = question.options.find((o) => o.id === question.correctAnswer);
  if (!correctOption) return question;

  const letters = ['A', 'B', 'C', 'D'];
  const shuffledRawOptions = shuffleArray(question.options);

  const newOptions = shuffledRawOptions.map((opt, idx) => ({
    id: letters[idx],
    text: opt.text,
  }));

  const newCorrectOption = newOptions.find((opt) => opt.text === correctOption.text);
  const newCorrectAnswer = newCorrectOption ? newCorrectOption.id : question.correctAnswer;

  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
  };
}

/**
 * Shuffles questions while keeping them grouped in authentic USTET subtest sequence:
 * Part 1: Mental Ability
 * Part 2: English Proficiency
 * Part 3: Mathematics
 * Part 4: Science
 */
export function shuffleQuestionsBySubtest(questions, { shuffleQuestions = true, randomizeChoices = true } = {}) {
  const subtestOrder = ['mental_ability', 'english', 'mathematics', 'science'];
  const result = [];

  // Group by subtest
  const grouped = {};
  subtestOrder.forEach((k) => {
    grouped[k] = questions.filter((q) => q.subtest === k);
  });

  // Handle any other subtests not in the standard 4
  const otherSubtests = Array.from(new Set(questions.map((q) => q.subtest))).filter(
    (k) => !subtestOrder.includes(k)
  );

  const allOrderedSubtests = [...subtestOrder, ...otherSubtests];

  allOrderedSubtests.forEach((subtestKey) => {
    let sectionQuestions = grouped[subtestKey] || questions.filter((q) => q.subtest === subtestKey);
    if (sectionQuestions.length === 0) return;

    if (shuffleQuestions) {
      sectionQuestions = shuffleArray(sectionQuestions);
    }

    if (randomizeChoices) {
      sectionQuestions = sectionQuestions.map((q) => shuffleChoices(q));
    }

    result.push(...sectionQuestions);
  });

  return result;
}

/**
 * Generates balanced subsets drawn from the total question pool.
 * Supports:
 * - 'full' : All 270 items
 * - 'set_a' : Balanced half (135 items: 35 MA, 35 English, 30 Math, 35 Science)
 * - 'set_b' : Alternate balanced half (135 items)
 * - 'express' : Quick 60-item diagnostic (15 items per subtest)
 */
export function generateQuestionSet(allQuestions, {
  setId = 'full',
  shuffleQuestions = true,
  randomizeChoices = true,
} = {}) {
  const subtestOrder = ['mental_ability', 'english', 'mathematics', 'science'];
  let pool = [...allQuestions];

  if (setId === 'full') {
    return shuffleQuestionsBySubtest(pool, { shuffleQuestions, randomizeChoices });
  }

  // Balanced target counts per subtest
  const targets = {
    set_a: { mental_ability: 35, english: 35, mathematics: 30, science: 35 },
    set_b: { mental_ability: 35, english: 35, mathematics: 30, science: 35 },
    express: { mental_ability: 15, english: 15, mathematics: 15, science: 15 },
  };

  const currentTarget = targets[setId] || targets.full;
  if (!currentTarget) {
    return shuffleQuestionsBySubtest(pool, { shuffleQuestions, randomizeChoices });
  }

  const selectedQuestions = [];

  subtestOrder.forEach((subtestKey) => {
    const subtestPool = pool.filter((q) => q.subtest === subtestKey);
    const countNeeded = currentTarget[subtestKey] || subtestPool.length;

    // Split evenly across difficulties if possible (EASY, MEDIUM, HARD)
    const easy = subtestPool.filter((q) => q.difficulty === 'EASY');
    const med = subtestPool.filter((q) => q.difficulty === 'MEDIUM');
    const hard = subtestPool.filter((q) => q.difficulty === 'HARD');

    if (setId === 'set_a') {
      // First slice
      const eCount = Math.round((easy.length / subtestPool.length) * countNeeded);
      const mCount = Math.round((med.length / subtestPool.length) * countNeeded);
      const hCount = countNeeded - eCount - mCount;
      selectedQuestions.push(
        ...easy.slice(0, eCount),
        ...med.slice(0, mCount),
        ...hard.slice(0, hCount)
      );
    } else if (setId === 'set_b') {
      // Second slice (from the remainder of the pool)
      const eCount = Math.round((easy.length / subtestPool.length) * countNeeded);
      const mCount = Math.round((med.length / subtestPool.length) * countNeeded);
      const hCount = countNeeded - eCount - mCount;
      selectedQuestions.push(
        ...easy.slice(-eCount),
        ...med.slice(-mCount),
        ...hard.slice(-hCount)
      );
    } else {
      // Express / random sample
      const shuffledSubPool = shuffleArray(subtestPool);
      selectedQuestions.push(...shuffledSubPool.slice(0, countNeeded));
    }
  });

  return shuffleQuestionsBySubtest(selectedQuestions, { shuffleQuestions, randomizeChoices });
}
