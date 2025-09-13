# Pi Flash - Development Agents Guide

## Project Overview
Pi Flash is a single-player memory game built as a webxdc application where players memorize and recall the digits of Pi. The game features a liquid glass UI design with matrix-style background effects.

## Core Technologies
- **Framework**: Vanilla JavaScript (webxdc framework)
- **UI**: Custom CSS with liquid glass effects, SVG filters
- **Architecture**: Single-page application with screen-based navigation
- **Localization**: i18n support via i18n.js
- **Platform**: webxdc (decentralized web apps for messaging)

## File Structure
```
src/
├── index.html       # Main HTML with game screens
├── main.js         # Game logic and state management
├── styles.css      # Styling with liquid glass effects
├── i18n.js         # Internationalization support
├── webxdc.js       # webxdc framework integration
└── icon.png        # App icon
```

## Game Mechanics

### Core Gameplay Loop
1. **Memorization Phase**: Display Pi digits for player to memorize
2. **Input Phase**: Player enters digits using number pad
3. **Progression**: Successfully completing rounds increases digit count
4. **Lives System**: 3 lives, lose one per mistake
5. **Scoring**: Points based on correct digits entered

### Key Features
- Progressive difficulty (starts at 3 digits)
- Debug mode to start at custom digit count
- Timer bar for memorization phase
- Visual feedback for correct/incorrect inputs
- Best score tracking
- Liquid glass UI with animations

## Development Priorities

### 🔴 High Priority
1. **State Persistence**
   - Save game progress between sessions
   - Implement webxdc state synchronization
   
2. **Accessibility**
   - Keyboard navigation support
   - Screen reader improvements
   - High contrast mode option

3. **Performance**
   - Optimize SVG filter animations for mobile
   - Reduce initial load time
   - Implement lazy loading for effects

### 🟡 Medium Priority
1. **Game Features**
   - Add difficulty modes (Easy/Normal/Hard)
   - Implement power-ups or hints system
   - Add achievement system
   
2. **UI/UX Improvements**
   - Add haptic feedback for mobile
   - Improve responsive design for tablets
   - Add sound effects (optional)
   
3. **Multiplayer Support**
   - Leverage webxdc for turn-based multiplayer
   - Add leaderboards
   - Implement challenges between players

### 🟢 Nice to Have
1. **Visual Enhancements**
   - Additional themes beyond liquid glass
   - Particle effects for correct answers
   - Smooth transitions between screens
   
2. **Statistics**
   - Track player progress over time
   - Show learning curve graphs
   - Export statistics
   
3. **Educational Features**
   - Pi facts and trivia
   - Practice mode without lives
   - Tutorial for new players

## Code Quality Guidelines

### JavaScript (main.js)
- Use ES6+ features consistently
- Implement proper error handling
- Add JSDoc comments for main functions
- Consider migrating to TypeScript
- Implement unit tests for game logic

### CSS (styles.css)
- Use CSS custom properties for theming
- Implement CSS Grid/Flexbox consistently
- Add fallbacks for older browsers
- Optimize animations for 60fps

### HTML (index.html)
- Ensure semantic HTML5 structure
- Complete ARIA labels and roles
- Add meta tags for SEO/sharing
- Implement structured data

## Testing Checklist
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness (iOS, Android)
- [ ] Offline functionality
- [ ] webxdc integration in Delta Chat
- [ ] Accessibility (WCAG 2.1 AA compliance)
- [ ] Performance (Lighthouse score > 90)
- [ ] Memory leaks prevention
- [ ] Input validation and sanitization

## Known Issues & Bugs
1. Matrix background may cause performance issues on older devices
2. Timer bar animation needs smoothing
3. Debug level input needs validation bounds
4. Life overlay animation timing needs adjustment
5. Score persistence not implemented

## Future Architecture Considerations
1. **Module System**: Split main.js into modules (game.js, ui.js, state.js)
2. **State Management**: Implement proper state machine for game phases
3. **Event System**: Use custom events for better decoupling
4. **Build Process**: Add bundler (Vite/Webpack) for optimization
5. **Testing Framework**: Integrate Jest or Vitest for unit testing

## API Integration Points
- webxdc.sendUpdate() - Share game state
- webxdc.setUpdateListener() - Receive updates
- localStorage - Store best scores locally
- Vibration API - Haptic feedback
- Web Audio API - Sound effects

## Performance Metrics
- Target FPS: 60
- Initial load: < 2 seconds
- Time to Interactive: < 3 seconds
- Bundle size: < 100KB (compressed)

## Contributing Guidelines
1. Follow existing code style
2. Add comments for complex logic
3. Update this AGENTS.md for major changes
4. Test on multiple devices before submitting
5. Ensure webxdc compatibility

## Resources
- [webxdc Documentation](https://webxdc.org/docs)
- [Pi Digits Reference](https://www.piday.org/million/)
- [Delta Chat Integration](https://delta.chat/en/help#webxdc)