# Audio Autoplay Solution

## 1. Why This Happens

**Browser Autoplay Policy**: Modern browsers (Chrome, Firefox, Safari, Edge) block autoplay of audio and video without user interaction. This is a security and user experience feature to prevent websites from automatically playing sounds.

**Technical Details**:
- `HTMLAudioElement.play()` returns a rejected promise if called without user interaction
- `AudioContext` starts in a "suspended" state and must be resumed after user interaction
- Web Audio API oscillators can be created and queued, but won't produce sound until AudioContext is resumed

## 2. The Correct Pattern

The standard pattern for handling autoplay restrictions is:

1. **Show a splash/interaction screen first** - User must interact before audio can play
2. **On user interaction** (click, touch, keypress):
   - Unlock AudioContext by calling `audioContext.resume()` or creating audio nodes
   - Start background music immediately after the gesture
   - Transition to the main app
3. **Audio remains unlocked** - Once unlocked, audio can play freely until the page is reloaded

## 3. Implementation

### AudioSplash Component (`src/ui/AudioSplash.tsx`)

This component:
- Shows "Tap to Start" message
- Waits for user interaction (click, touch, or keyboard)
- On interaction:
  - Calls `sound.unlockAudio()` to unlock AudioContext
  - Starts the generated tune
  - Calls `onUnlock()` to show the main menu

### Shell Component (`src/shell/Shell.tsx`)

- Starts with `screen = 'splash'` to show the splash screen
- After audio is unlocked, transitions to `screen = 'menu'`
- When returning from game, goes directly to menu (audio already unlocked)

### MainMenu Component (`src/ui/MainMenu.tsx`)

- Simplified to just start music when component mounts
- Assumes audio is already unlocked (handled by splash screen)
- Fades out music when starting a game

## 4. User Experience Flow

```
1. Page loads → Shows "Tap to Start" splash screen
2. User clicks/taps → Audio unlocks, music starts, shows main menu
3. User plays game → Music fades out
4. User returns to menu → Music restarts automatically
```

## 5. Benefits of This Approach

✅ **Predictable**: User knows they need to interact to start  
✅ **Compliant**: Works with all browser autoplay policies  
✅ **Simple**: No complex autoplay detection or retry logic  
✅ **Reliable**: Audio always works after the initial interaction  

## 6. Alternative Approaches (Not Used)

- **Silent unlock sound**: Play a very quiet sound on page load (still requires user interaction)
- **Visual prompt**: Show a button to enable audio (similar to our splash, but less elegant)
- **No audio on autoplay**: Just don't play music if autoplay fails (poor UX)

The splash screen approach is the industry standard for games and audio-heavy web apps.

