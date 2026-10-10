/**
 * Persistence service for USTET exam sessions.
 * Preserves the active randomized questions, choices, current subtest,
 * current question index, answers, flagged items, remaining timer seconds,
 * total elapsed time, and scratchpad content.
 */

export const ACTIVE_SESSION_STORAGE_KEY = 'ustet_active_exam_session_v2';

/**
 * Saves the current active exam session to localStorage.
 */
export function saveActiveSession(sessionData) {
  if (!sessionData) return;
  try {
    const payload = {
      ...sessionData,
      version: 2,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save active exam session:', err);
  }
}

/**
 * Loads the active exam session if one exists.
 * Returns null if no session is stored or parsing fails.
 */
export function loadActiveSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.activeQuestions && session.activeQuestions.length > 0) {
      return session;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse active exam session:', err);
    return null;
  }
}

/**
 * Checks whether a valid in-progress exam session exists.
 */
export function hasActiveSession() {
  const session = loadActiveSession();
  return !!(session && session.activeQuestions && session.activeQuestions.length > 0);
}

/**
 * Clears the active exam session from storage.
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    // Also clean up any legacy keys
    localStorage.removeItem('ustet_user_answers');
    localStorage.removeItem('ustet_flagged');
  } catch (err) {
    console.error('Failed to clear active exam session:', err);
  }
}
