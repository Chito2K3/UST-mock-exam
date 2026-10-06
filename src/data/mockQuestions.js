import { MENTAL_ABILITY_QUESTIONS } from './questions/mentalAbility.js';
import { ENGLISH_QUESTIONS } from './questions/english.js';
import { MATHEMATICS_QUESTIONS } from './questions/mathematics.js';
import { SCIENCE_QUESTIONS } from './questions/science.js';

export const SUBTEST_METADATA = {
  mental_ability: {
    id: "mental_ability",
    title: "Mental Ability",
    subtitle: "Abstract, Logical, Spatial & Analytical Reasoning",
    defaultDurationMinutes: 30, // Real USTET: 30 mins
    totalTargetItems: 70,
    color: "#EAB308", // Gold
    iconName: "Brain",
  },
  english: {
    id: "english",
    title: "English Proficiency",
    subtitle: "Grammar, Usage, Vocabulary & Reading Comprehension",
    defaultDurationMinutes: 45, // Real USTET: 45 mins
    totalTargetItems: 70,
    color: "#3B82F6", // Blue
    iconName: "BookOpen",
  },
  mathematics: {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Arithmetic, Algebra, Geometry, Trigonometry & Pre-Calculus (No Calculator)",
    defaultDurationMinutes: 45, // Real USTET: 45 mins
    totalTargetItems: 60,
    color: "#EF4444", // Red
    iconName: "Calculator",
  },
  science: {
    id: "science",
    title: "Science",
    subtitle: "General Science, Biology, Chemistry, Physics & Earth Science",
    defaultDurationMinutes: 45, // Real USTET: 45 mins
    totalTargetItems: 70,
    color: "#10B981", // Green
    iconName: "Atom",
  },
};

export const MOCK_QUESTIONS = [
  ...MENTAL_ABILITY_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...MATHEMATICS_QUESTIONS,
  ...SCIENCE_QUESTIONS,
];
