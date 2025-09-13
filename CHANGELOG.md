# Pi Flash Changelog

## [1.1.2] - 2025-09-13

### Performance Improvements
- 🚀 **Major performance optimization**: Reduced backdrop-filter blur from 22px to 8px for significantly better rendering performance
- 🎨 Simplified liquid glass effects while maintaining visual appeal
- ⚡ Removed expensive SVG filters that were causing rendering bottlenecks
- 🔧 Optimized CSS transitions for faster, more responsive interactions
- 📱 Improved performance especially on mid-range and older devices

### Visual Effects
- ✨ Matrix background now always enabled with subtle opacity (15%)
- 🎉 Confetti celebrations permanently enabled for milestone achievements
- 🎯 Removed toggle complexity - effects are always consistent
- 🎪 Maintained visual appeal while prioritizing usability over fancy effects

### User Experience
- 🎮 Removed confusing "Enhanced Effects" toggle button
- 📈 Smoother gameplay experience across all device types
- 🔋 Better battery life due to reduced GPU-intensive effects
- 🎯 Consistent behavior - no more user confusion about effect settings

### Technical Changes
- 🛠️ Removed requestAnimationFrame calls where not needed
- 🧹 Cleaned up unused CSS for better maintainability
- 📦 Optimized bundle size and loading performance
- 🎨 Simplified DOM manipulation for effects

### Accessibility
- ♿ Maintained prefers-reduced-motion support
- 📱 Better performance on older/slower devices
- 🎯 Consistent visual feedback for all users

---

## [1.1.1] - Previous version

### [Previous releases]
- Initial webxdc implementation
- Core Pi memory game functionality
- Liquid glass UI design