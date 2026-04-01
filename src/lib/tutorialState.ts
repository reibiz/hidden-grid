/**
 * tutorialState
 *
 * Lightweight localStorage helpers for tracking whether the player has
 * completed the tutorial. Kept outside the player profile so it never
 * triggers a PROFILE_VERSION migration.
 */

const KEY = 'hg-tutorial-done'

export const hasDoneTutorial = (): boolean =>
  localStorage.getItem(KEY) === '1'

export const markTutorialDone = (): void =>
  localStorage.setItem(KEY, '1')
