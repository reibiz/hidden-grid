# Hidden Grid - Game Flow Chart

This document provides a comprehensive flowchart of the entire Hidden Grid game, including all screens, user interactions, and game states.

## Quick Reference: Screen Flow

```
App Start
  ↓
Error Boundary (catches errors)
  ↓
Shell Component
  ├─→ Main Menu Screen
  │   ├─→ Difficulty Selector (Daily/Practice)
  │   ├─→ Settings (placeholder)
  │   ├─→ Stats (placeholder)
  │   └─→ Achievements (placeholder)
  │
  └─→ Game View Screen
      ├─→ Gameplay Screen
      │   ├─→ Settings Modal
      │   ├─→ Stats Panel
      │   └─→ Completion Modal
      │
      └─→ Back to Main Menu
```

## Complete Game Flow

```mermaid
flowchart TD
    Start([App Starts]) --> ErrorBoundary{Error Boundary}
    ErrorBoundary -->|Error| ErrorScreen[Error Screen<br/>Show Error Message<br/>Reload Button]
    ErrorBoundary -->|No Error| Shell[Shell Component]
    
    Shell --> ScreenCheck{Screen State}
    
    ScreenCheck -->|menu| MainMenu[Main Menu Screen]
    ScreenCheck -->|game| GameView[Game View Screen]
    
    %% Main Menu Flow
    MainMenu --> MenuActions{User Action}
    
    MenuActions -->|Play Daily Puzzle| DifficultySelect1[Show Difficulty Selector<br/>Daily Mode]
    MenuActions -->|Practice Mode| DifficultySelect2[Show Difficulty Selector<br/>Practice Mode]
    MenuActions -->|Puzzle Archive| ArchiveAlert[Alert: Archive v1.3]
    MenuActions -->|Stats| StatsAlert[Alert: Stats v1.3]
    MenuActions -->|Achievements| AchievementsAlert[Alert: Achievements v1.3]
    MenuActions -->|Settings| SettingsAlert[Alert: Settings v1.3]
    MenuActions -->|Change Theme| ThemeChange[Toggle Theme<br/>Retro ↔ Zen]
    MenuActions -->|Toggle Sound| SoundToggle[Toggle Sound On/Off]
    
    DifficultySelect1 --> DifficultyChoice1{Select Difficulty}
    DifficultySelect2 --> DifficultyChoice2{Select Difficulty}
    
    DifficultyChoice1 -->|Beginner/Medium/Hard| StartDaily[Set Mode: Daily<br/>Set Screen: Game]
    DifficultyChoice2 -->|Beginner/Medium/Hard| StartPractice[Set Mode: Practice<br/>Set Screen: Game]
    
    DifficultyChoice1 -->|Cancel| MainMenu
    DifficultyChoice2 -->|Cancel| MainMenu
    
    StartDaily --> GameView
    StartPractice --> GameView
    
    %% Game View Flow
    GameView --> GameApp[App Component<br/>Main Game]
    
    GameApp --> GameInit[Initialize Game State<br/>- Load Profile<br/>- Generate Puzzle<br/>- Initialize Grid<br/>- Start Timer]
    
    GameInit --> Gameplay[Gameplay Screen]
    
    Gameplay --> GameActions{User Action}
    
    %% Gameplay Actions
    GameActions -->|Click Cell| CycleCell[Cycle Cell State<br/>Empty → Filled → Empty]
    GameActions -->|Right-Click Cell| MarkEmpty[Mark Cell as Empty ✖<br/>Empty ✖ → Empty]
    GameActions -->|Reveal Mistakes| RevealMistakes[Remove Overfilled Cells<br/>Update Grid]
    GameActions -->|Reset Board| ResetBoard[Clear All Cells<br/>Reset Moves<br/>Restart Timer]
    GameActions -->|Change Difficulty| ChangeDifficulty[Update Difficulty<br/>Generate New Puzzle]
    GameActions -->|Switch Mode| SwitchMode[Daily ↔ Practice<br/>Generate New Puzzle]
    GameActions -->|Show Stats| ToggleStats[Toggle Stats Panel]
    GameActions -->|Open Settings| OpenSettings[Open Settings Modal]
    GameActions -->|Back Button| BackToMenu[Return to Main Menu]
    
    CycleCell --> CheckSolve{Check if Solved}
    MarkEmpty --> CheckSolve
    RevealMistakes --> Gameplay
    ResetBoard --> Gameplay
    ChangeDifficulty --> GameInit
    SwitchMode --> GameInit
    ToggleStats --> Gameplay
    OpenSettings --> SettingsModal[Settings Modal]
    BackToMenu --> MainMenu
    
    %% Solve Check
    CheckSolve -->|Counts Match| SolveDetected[Puzzle Solved!]
    CheckSolve -->|Not Solved| Gameplay
    
    %% Completion Flow
    SolveDetected --> CompletionLogic[Completion Logic<br/>useGameCompletion Hook]
    
    CompletionLogic --> CalcResults[Calculate Results<br/>- Time Elapsed<br/>- Medal Award<br/>- XP Gained<br/>- Daily Bonus if Daily]
    
    CalcResults --> UpdateProfile[Update Profile<br/>- Add XP<br/>- Update Streak if Daily<br/>- Record Stats<br/>- Check Achievements<br/>- Award Medal]
    
    UpdateProfile --> CheckLevelUp{Level Up?}
    CheckLevelUp -->|Yes| LevelUp[Level Up Animation]
    CheckLevelUp -->|No| CompletionModal
    
    LevelUp --> CompletionModal[Completion Modal<br/>Show Results]
    
    CompletionModal --> CompletionActions{User Action}
    CompletionActions -->|Next Puzzle| NextPuzzle{Current Mode}
    CompletionActions -->|Close Modal| Gameplay
    
    NextPuzzle -->|Daily| StartDaily
    NextPuzzle -->|Practice| StartPractice
    
    %% Settings Modal Flow
    SettingsModal --> SettingsActions{User Action}
    SettingsActions -->|Change Theme| UpdateTheme[Update Theme Setting]
    SettingsActions -->|Toggle Timer| ToggleTimer[Update Show Timer Setting]
    SettingsActions -->|Toggle Sound| ToggleSound[Update Sound Setting]
    SettingsActions -->|Close| CloseSettings[Close Modal]
    
    UpdateTheme --> SettingsModal
    ToggleTimer --> SettingsModal
    ToggleSound --> SettingsModal
    CloseSettings --> Gameplay
    
    %% Stats Panel Flow
    ToggleStats --> StatsPanel[Stats Panel<br/>- Total Solves<br/>- Perfect Solves<br/>- Best Times<br/>- Average Times]
    StatsPanel -->|Hide Stats| Gameplay
    
    %% Styling
    classDef screen fill:#4a90e2,stroke:#2c5aa0,stroke-width:2px,color:#fff
    classDef action fill:#50c878,stroke:#2d8659,stroke-width:2px,color:#fff
    classDef modal fill:#f39c12,stroke:#d68910,stroke-width:2px,color:#fff
    classDef decision fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    classDef process fill:#9b59b6,stroke:#7d3c98,stroke-width:2px,color:#fff
    
    class MainMenu,GameView,Gameplay,ErrorScreen screen
    class CycleCell,MarkEmpty,RevealMistakes,ResetBoard,ChangeDifficulty,SwitchMode action
    class CompletionModal,SettingsModal,StatsPanel modal
    class ScreenCheck,MenuActions,GameActions,CheckSolve,CheckLevelUp,CompletionActions,SettingsActions,NextPuzzle decision
    class CompletionLogic,CalcResults,UpdateProfile,LevelUp process
```

## Detailed State Flow

### 1. Application Initialization
- Error Boundary wraps entire app
- Shell component manages screen state (menu/game)
- Profile loaded from localStorage

### 2. Main Menu Screen
**Components:**
- MainMenu component
- Profile display (Title, Level, XP Bar)
- Theme toggle (Retro/Zen)
- Sound toggle

**Actions:**
- Play Daily Puzzle → Shows difficulty selector
- Practice Mode → Shows difficulty selector
- Puzzle Archive → Placeholder alert
- Stats → Placeholder alert
- Achievements → Placeholder alert
- Settings → Placeholder alert

### 3. Difficulty Selection
**Modal Overlay:**
- Beginner (6x6, unlimited reveals)
- Medium (8x8, 1 reveal)
- Hard (10x10, 0 reveals)
- Cancel button

### 4. Game Screen
**Initialization:**
- Generate puzzle from seed
- Initialize empty grid
- Start timer
- Reset move counter

**Gameplay Loop:**
- User interacts with grid cells
- System checks row/column counts
- Timer continues running
- Move counter increments

**Available Actions:**
- Click cell: Toggle filled/empty
- Right-click cell: Mark as empty (✖)
- Reveal Mistakes: Remove overfilled cells
- Reset Board: Clear all and restart
- Change Difficulty: New puzzle with new difficulty
- Switch Mode: Daily ↔ Practice
- Show/Hide Stats: Toggle stats panel
- Open Settings: Open settings modal
- Back: Return to main menu

### 5. Puzzle Completion
**Detection:**
- Checks if all row counts match
- Checks if all column counts match
- Allows multiple valid solutions

**Completion Process:**
1. Calculate time elapsed
2. Determine medal (Gold/Silver/Bronze/None)
3. Calculate XP gain
4. Check for daily bonus (if daily mode)
5. Update streak (if daily mode)
6. Record statistics
7. Check achievements
8. Award XP and medals
9. Check for level up
10. Show completion modal

### 6. Completion Modal
**Displays:**
- Time taken
- Medal earned
- XP gained
- Daily bonus (if applicable)
- Level up notification (if applicable)
- New achievements unlocked (if any)

**Actions:**
- Next Puzzle → Starts new puzzle (same mode)
- Close → Returns to game (puzzle remains solved)

### 7. Settings Modal
**Options:**
- Theme: Dark/Light
- Show Timer: Toggle
- Sound: Toggle

**Behavior:**
- Changes saved to profile
- Applied immediately

### 8. Stats Panel
**Displays:**
- Total solves (all difficulties)
- Perfect solves
- Best time per difficulty
- Average time per difficulty

## Key State Management

### useGameState Hook
- Manages puzzle generation
- Grid state (CellState[][])
- Move counter
- Timer
- Row/column counts
- Solve detection

### useGameCompletion Hook
- Monitors solve state
- Handles completion logic
- Updates profile
- Manages completion modal state

### useProfile Hook
- React state for profile
- Automatic localStorage sync
- XP, medals, stats, achievements
- Settings persistence

## Data Flow

```
User Action → Component → Hook → State Update → Re-render → UI Update
```

## Error Handling

- Error Boundary catches React errors
- Shows user-friendly error screen
- Provides reload option
- Logs errors to console

