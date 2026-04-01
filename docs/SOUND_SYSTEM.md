# Hidden Grid — Sound System Documentation

This document explains how the sound system works and how to add custom sound files.

## Overview

The sound system uses:
- **HTML5 Audio API** for playing sound files
- **Web Audio API** for programmatically generated fallback sounds
- **React Hook** (`useSound`) for easy integration
- **Automatic fallback** to generated sounds if files are missing

## Sound Effects

The game includes the following sound effects:

| Sound ID | Description | Default Volume | Fallback Sound |
|----------|-------------|----------------|----------------|
| `cell-fill` | When a cell is filled | 0.3 | A4 note (440Hz) |
| `cell-mark` | When a cell is marked (X) | 0.25 | A3 note (220Hz) |
| `cell-clear` | When a cell is cleared | 0.2 | E4 note (330Hz) |
| `row-complete` | When a row is completed | 0.4 | Ascending chord (C-E-G) |
| `col-complete` | When a column is completed | 0.4 | Ascending chord (C-E-G) |
| `puzzle-solved` | When puzzle is solved | 0.6 | Victory fanfare |
| `button-click` | Button clicks | 0.2 | High beep (800Hz) |
| `modal-open` | Modal opens | 0.3 | Medium tone (600Hz) |
| `modal-close` | Modal closes | 0.3 | Lower tone (400Hz) |
| `error` | Error/mistake | 0.4 | Descending notes |
| `level-up` | Level up | 0.5 | Ascending scale |
| `streak-milestone` | Streak milestone | 0.6 | Celebration sound |

## Adding Sound Files

### Step 1: Create the sounds directory

Create a `public/sounds/` directory in your project root:

```
hidden-grid-ts-v1.4-rc2/
  public/
    sounds/
      cell-fill.mp3
      cell-mark.mp3
      cell-clear.mp3
      row-complete.mp3
      col-complete.mp3
      puzzle-solved.mp3
      button-click.mp3
      modal-open.mp3
      modal-close.mp3
      error.mp3
      level-up.mp3
      streak-milestone.mp3
```

### Step 2: Add your sound files

Place your sound files in `public/sounds/` with these exact names:

- `cell-fill.mp3` (or `.wav`, `.ogg`)
- `cell-mark.mp3`
- `cell-clear.mp3`
- `row-complete.mp3`
- `col-complete.mp3`
- `puzzle-solved.mp3`
- `button-click.mp3`
- `modal-open.mp3`
- `modal-close.mp3`
- `error.mp3`
- `level-up.mp3`
- `streak-milestone.mp3`

**Supported formats:** MP3, WAV, OGG

**Recommended specifications:**
- **Format:** MP3 (best compatibility) or OGG (better compression)
- **Sample rate:** 44.1kHz
- **Bitrate:** 128kbps (good balance of quality and size)
- **Duration:** 
  - Short sounds (cell actions, buttons): 0.1-0.3 seconds
  - Medium sounds (completions): 0.3-0.8 seconds
  - Long sounds (puzzle solved, level up): 0.8-2 seconds

### Step 3: Update sound paths (optional)

If you want to use different file names or formats, edit `src/lib/sounds.ts`:

```typescript
export const SOUND_PATHS: Record<SoundEffect, string> = {
  'cell-fill': '/sounds/your-filename.mp3',
  // ... etc
}
```

### Step 4: Adjust volumes (optional)

You can adjust default volumes in `src/lib/sounds.ts`:

```typescript
export const SOUND_VOLUMES: Record<SoundEffect, number> = {
  'cell-fill': 0.3, // 0.0 to 1.0
  // ... etc
}
```

## How It Works

### 1. Sound Preloading

Sounds are preloaded when the game starts (if sound is enabled):

```typescript
useEffect(() => {
  if (soundEnabled) {
    sound.preloadAll()
  }
}, [soundEnabled, sound])
```

### 2. Playing Sounds

Sounds are played automatically based on game events:

```typescript
// In App.tsx
const sound = useSound(soundEnabled)

// Play sound on cell click
sound.playSound('cell-fill')

// Play sound with custom volume
sound.playSound('puzzle-solved', { volume: 0.8 })
```

### 3. Fallback System

If a sound file is missing or fails to load:
1. The system tries to load the file
2. If it fails, it automatically generates a fallback sound using Web Audio API
3. The fallback sound matches the intended effect (e.g., ascending notes for completion)

### 4. Sound Settings

Sounds respect the user's sound setting:
- If `settings.sound === false`, no sounds play
- The setting is stored in the user's profile
- Can be toggled in Settings modal or Main Menu

## Integration Points

Sounds are integrated at:

1. **Cell interactions** (`App.tsx`)
   - Fill, mark, clear actions

2. **Row/Column completion** (`App.tsx`)
   - Detects when rows/columns are completed

3. **Puzzle completion** (`App.tsx`)
   - Plays when puzzle is solved

4. **Level up** (`App.tsx`)
   - Plays when player levels up

5. **Button clicks** (All components)
   - All interactive buttons

6. **Modal interactions** (`CompletionModal`, `SettingsModal`)
   - Open/close sounds

7. **Main Menu** (`MainMenu.tsx`)
   - Menu button clicks, theme changes

## Browser Compatibility

- **Modern browsers:** Full support (Chrome, Firefox, Safari, Edge)
- **Fallback sounds:** Work in all browsers that support Web Audio API
- **Autoplay policy:** The system handles browser autoplay restrictions gracefully

## Performance Considerations

- Sounds are preloaded to reduce latency
- Audio files are cached after first load
- Multiple instances can play simultaneously (for overlapping sounds)
- Fallback sounds are generated on-demand (minimal performance impact)

## Customization

### Adding New Sound Effects

1. Add the sound type to `SoundEffect` type in `src/lib/sounds.ts`:

```typescript
export type SoundEffect =
  | 'cell-fill'
  | 'your-new-sound'  // Add here
```

2. Add the file path:

```typescript
export const SOUND_PATHS: Record<SoundEffect, string> = {
  // ...
  'your-new-sound': '/sounds/your-new-sound.mp3',
}
```

3. Add default volume:

```typescript
export const SOUND_VOLUMES: Record<SoundEffect, number> = {
  // ...
  'your-new-sound': 0.5,
}
```

4. Add fallback sound in `useSound.ts`:

```typescript
case 'your-new-sound':
  generateBeep(440, 0.2, volume)
  break
```

5. Use it in your component:

```typescript
sound.playSound('your-new-sound')
```

## Testing

To test the sound system:

1. **With sound files:**
   - Add sound files to `public/sounds/`
   - Sounds should play automatically

2. **Without sound files:**
   - Remove or rename sound files
   - Fallback sounds should play automatically

3. **Sound disabled:**
   - Toggle sound off in settings
   - No sounds should play

## Troubleshooting

**Sounds not playing:**
- Check browser console for errors
- Verify sound files are in `public/sounds/`
- Check file names match exactly (case-sensitive)
- Verify sound setting is enabled

**Sounds too loud/quiet:**
- Adjust volumes in `src/lib/sounds.ts`
- Or pass custom volume: `sound.playSound('cell-fill', { volume: 0.5 })`

**Fallback sounds not working:**
- Check browser supports Web Audio API
- Check browser console for errors
- Some browsers require user interaction before playing audio

## Resources for Sound Files

Free sound effect resources:
- **Freesound.org** - Community-driven sound library
- **Zapsplat.com** - Free sound effects (requires account)
- **Mixkit.co** - Free sound effects and music
- **OpenGameArt.org** - Game assets including sounds

Recommended search terms:
- "UI click sound"
- "Game button click"
- "Puzzle game sounds"
- "Success sound effect"
- "Level up sound"

