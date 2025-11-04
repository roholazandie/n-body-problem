# N-Body Problem Simulation

An interactive 3D simulation of the N-body gravitational problem using vanilla HTML, CSS, and JavaScript with Three.js. This project allows you to visualize gravitational interactions between multiple celestial bodies with realistic physics.

## Features

- **Interactive 3D Visualization**: Real-time rendering of gravitational bodies in 3D space
- **Customizable Parameters**: Adjust number of bodies, mass distribution, and simulation speed
- **Multiple Mass Distributions**: Choose from equal, Gaussian, power-law, or uniform mass distributions
- **Real-time Controls**: Play/pause, speed adjustment, and setup mode for positioning bodies
- **Orbit Trails**: Visual traces showing the paths of celestial bodies
- **Responsive Design**: Works on different screen sizes and devices
- **Pure Vanilla JavaScript**: No frameworks required - just HTML, CSS, and JavaScript

## How to Run

1. **Simple Method**: Open `index.html` directly in a modern web browser
   - Right-click on `index.html` and select "Open with browser"
   - Or double-click the file to open it in your default browser

2. **Local Server Method** (recommended for better performance):
   ```bash
   # Using the included script
   ./start.sh
   
   # Or manually with Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Using PHP (if installed)
   php -S localhost:8000
   ```
   Then open `http://localhost:8000` in your browser.

## Files

- `index.html` - Main HTML structure with UI controls
- `styles.css` - Complete stylesheet for the simulation interface
- `simulation.js` - Core JavaScript logic for the N-body simulation
- `start.sh` - Convenience script to start a local server
- `README.md` - This documentation file

## Project Structure

```
n-body-problem/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── simulation.js       # Main simulation logic
├── start.sh           # Server startup script
└── README.md          # Documentation
```

## Controls

### Setup Mode
- **Number of Bodies**: Slider to adjust how many bodies to simulate (3-100)
- **Mass Distribution**: Choose how masses are distributed:
  - Equal: All bodies have the same mass
  - Gaussian: Masses follow a normal distribution
  - Power Law: Masses follow a power-law distribution
  - Uniform: Masses are uniformly distributed within a range
- **Start Simulation**: Begin the physics simulation

### Simulation Mode
- **Play/Pause**: Space bar or button to pause/resume simulation
- **Speed Control**: Slider to adjust simulation speed (0.1x to 5x)
- **Reset**: Return to setup mode to create a new configuration

### Camera Controls
- **Mouse**: Click and drag to rotate the camera around the scene
- **Mouse Wheel**: Scroll to zoom in/out
- **Touch**: On touch devices, use pinch gestures and touch controls

## Physics

The simulation implements:
- **Gravitational Force**: F = G * m1 * m2 / r²
- **Numerical Integration**: Uses Euler's method for position and velocity updates
- **Collision Detection**: Bodies merge when they get too close
- **Real-time Rendering**: Smooth 60 FPS animation using requestAnimationFrame

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: The simulation requires WebGL support and works best on devices with dedicated graphics.

## Performance Tips

- For smoother performance, reduce the number of bodies
- Close other browser tabs to free up memory
- Use a local server rather than opening the file directly
- On mobile devices, start with fewer bodies (3-10)

## Customization

You can modify the simulation by editing `NBodySimulation.jsx`:
- Adjust gravitational constant `G`
- Change time step `dt` for integration
- Modify body colors and sizes
- Add new mass distribution algorithms
- Implement different numerical integration methods

## Dependencies

The simulation only requires:
- **Three.js r128** - Loaded via CDN for 3D graphics
- **Modern web browser** with WebGL support

No build tools, frameworks, or local installation required!

## Technical Details

### Architecture
- **Vanilla JavaScript Class**: `NBodySimulation` class manages all state and logic
- **DOM Manipulation**: Direct DOM interaction for UI updates
- **Three.js Integration**: Clean separation between physics and rendering
- **Event-Driven**: Responsive to user interactions and parameter changes

### Physics Implementation
- **Gravitational Force**: F = G * m1 * m2 / r²
- **Numerical Integration**: 4th-order Runge-Kutta method for accuracy
- **Collision Detection**: Bodies merge when they get too close
- **Real-time Rendering**: Smooth 60 FPS animation using requestAnimationFrame

### Performance Optimizations
- **Efficient Trail Rendering**: BufferGeometry for smooth orbital trails
- **Adaptive Body Scaling**: Size scaling based on number of bodies
- **Optimized Physics Loop**: Multiple integration steps per frame for higher speeds

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: The simulation requires WebGL support and works best on devices with dedicated graphics.

## Performance Tips

- For smoother performance, reduce the number of bodies
- Close other browser tabs to free up memory
- Use a local server rather than opening the file directly
- On mobile devices, start with fewer bodies (3-10)

## Customization

You can modify the simulation by editing `simulation.js`:
- Adjust gravitational constant `G` in the constructor
- Change time step `dt` for integration accuracy
- Modify body colors in the `colors` array
- Add new mass distribution algorithms in `calculateMass()`
- Implement different numerical integration methods in `integrate()`
- Customize UI styling in `styles.css`

## License

This project is open source and available under the MIT License.