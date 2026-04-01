/**
 * Shared state for music playback across components
 * Used to track if music was played from splash screen
 */

let musicPlayedFromSplash = false
let mainMenuHasMounted = false // Track if MainMenu has ever been mounted

export function markMusicPlayedFromSplash() {
  musicPlayedFromSplash = true
}

export function hasMusicPlayedFromSplash(): boolean {
  return musicPlayedFromSplash
}

export function markMainMenuMounted() {
  mainMenuHasMounted = true
}

export function hasMainMenuMounted(): boolean {
  return mainMenuHasMounted
}

