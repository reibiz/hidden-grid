# Sound Files Directory

Place your sound effect files in this directory.

## Required Sound Files

The game expects the following sound files (MP3, WAV, or OGG format):

- `cell-fill.mp3` - When a cell is filled
- `cell-mark.mp3` - When a cell is marked (X)
- `cell-clear.mp3` - When a cell is cleared
- `row-complete.mp3` - When a row is completed
- `col-complete.mp3` - When a column is completed
- `puzzle-solved.mp3` - When the puzzle is solved
- `button-click.mp3` - Button clicks
- `modal-open.mp3` - Modal opens
- `modal-close.mp3` - Modal closes
- `error.mp3` - Error/mistake sound
- `level-up.mp3` - Level up sound
- `streak-milestone.mp3` - Streak milestone reached
- `intro-song.mp3` - Background music for main menu (looping)

## Fallback System

If sound files are not provided, the game will automatically generate fallback sounds using the Web Audio API. This ensures the game always has audio feedback even without custom sound files.

## File Specifications

**Recommended:**
- Format: MP3 (best compatibility) or OGG (better compression)
- Sample rate: 44.1kHz
- Bitrate: 128kbps
- Duration: 0.1-2 seconds (depending on sound type)

**Short sounds** (0.1-0.3s): cell-fill, cell-mark, cell-clear, button-click
**Medium sounds** (0.3-0.8s): row-complete, col-complete, modal-open, modal-close
**Long sounds** (0.8-2s): puzzle-solved, level-up, streak-milestone
**Background music** (30-120s, looping): intro-song - Plays continuously on the main menu screen

## Resources

Free sound effect resources:
- Freesound.org
- Zapsplat.com
- Mixkit.co
- OpenGameArt.org

See `docs/SOUND_SYSTEM.md` for complete documentation.

