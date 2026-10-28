# 🛸 Tri-Anomaly Geospatial WebAR - Frattocchie & Santa Maria delle Mole

A photorealistic mobile WebAR experience featuring three distinct anomalies anchored across Marino (Rome), built with **8thwall.org Open-Source WebAR** and **A-Frame / Three.js**:

1. **🏛️ Ancient Roman Statue**: In front of **Via Aldo Moro 52, 00047 Frattocchie (Marino, RM)** (`41.76370° N, 12.60930° E`).
2. **▲ Alien Dark Monolith**: In the front plaza of **Centro Commerciale La Nave (Frattocchie)** (`41.76714° N, 12.61603° E`).
3. **🛸 Mothership UFO**: Hovering over **Officine Ibba (Via Silvio Pellico 95, Santa Maria delle Mole)** (`41.77450° N, 12.59720° E`).

Live URL on GitHub Pages: **[https://seansilla.github.io/frattocchie-ar/](https://seansilla.github.io/frattocchie-ar/)**

---

## ⚡ The Solution A Architecture: Geofence Auto-Latch & SLAM Fusion

When 8th Wall transitioned to open-source at [8thwall.org](https://8thwall.org), Niantic shut down proprietary cloud accounts and Lightship VPS point-cloud servers. Mobile browser GPS inherently suffers from $\pm 5\text{m}$ to $\pm 15\text{m}$ error radius, and digital magnetometers experience $10^\circ$ to $30^\circ$ magnetic drift from urban infrastructure.

To deliver millimeter-accurate, jitter-free AR without paid cloud servers, this project implements **Solution A (Geofence Auto-Latch & SLAM Fusion)**:

```
[ Long Distance / Travel ] (> 35m - 85m)
  • Continuous GPS & compass calculate geodesic distance (Haversine) and true bearing.
  • HUD Telemetry & Rotating Mini-Radar guide you toward the landmark blips.
  • Horizon projection keeps the 3D entity visually aligned in the far distance.

                 │
                 ▼ (User enters physical arrival geofence)

[ Near Field / Arrival ] (<= 35m Statue / <= 55m Monolith / <= 85m UFO)
  • AUTO-LATCH TRIGGERS: Decouples the 3D entity from noisy GPS updates!
  • Rigidly anchors the entity to 8th Wall's 60 FPS SLAM ground coordinate space in front of the camera.
  • Plays an ascending futuristic chime and surfaces an on-screen HUD alert.
  • ZERO JITTER: Walk 360° around the Roman Statue or Monolith with rock-solid physical floor tracking.
  • Full manual overrides: Tap [🔒 LATCH ON GROUND], [🎯 RE-LATCH], or [🔓 UNLATCH (USE GPS)].
```

---

## 🌟 Key Features

- **True In-Browser WebAR**: Runs directly in Safari (iOS) and Chrome (Android) without requiring any app download or App Store installation.
- **Photorealistic PBR Materials**:
  - **Ancient Roman Statue**: Hand-crafted procedural Carrara marble with organic mineral veins, subtle patina, carved classical `S · P · Q · R` inscription, and marble pedestal.
  - **Alien Monolith**: $1 : 4 : 9$ Arthur C. Clarke proportions, titanium-obsidian brushed finish, beveled edges, and emissive pulsing runes.
  - **Mothership UFO**: Multi-tiered saucer with counter-rotating quantum induction ring, glowing reactor core, pulsating tractor beam, and anti-collision strobes.
- **Built-in Procedural Audio Synthesizer**:
  - Native **Web Audio API** synthesizes a 55Hz sub-bass alien drone with detuned oscillators and LFO filter modulation.
  - Includes ascending/descending chime feedback on ground latch and release.
- **Interactive Sci-Fi HUD**:
  - **Real-Time Telemetry**: Live latitude/longitude, GPS accuracy radius in meters, and true compass heading.
  - **Rotating Mini-Radar**: Dynamic sweep showing real-time directional blips for all 3 targets.
  - **Compass Trim Slider**: Fine-tune heading by $\pm 90^\circ$ to offset vehicle or rebar magnetic interference.
  - **Sizing Controls & Presets**: Pinch-to-scale + range slider + quick presets (Tabletop, Garden, Monumental, Scout, Cruiser, Mothership).
  - **Standpoint Simulator**: Switch between `LIVE GPS` (real satellites) and simulated standpoints (`VIA ALDO MORO 52`, `STAND AT LA NAVE`, `STAND AT IBBA`).

---

## 📁 Project Structure

```
Frattocchie AR/
├── index.html        # Main WebAR experience (8thwall.org SLAM engine binary, A-Frame scene, HUD)
├── style.css         # Glassmorphism sci-fi HUD, mini-radar, latch alerts & responsive mobile layout
├── app.js            # Procedural PBR textures, geodesic engine, SLAM auto-latch, Web Audio synth
├── package.json      # Project metadata
├── .gitignore        # Git ignore rules
└── README.md         # Architecture, deployment & testing guide
```

---

## 📱 How to Use On-Site

1. Open **[https://seansilla.github.io/frattocchie-ar/](https://seansilla.github.io/frattocchie-ar/)** on your mobile browser (**Safari on iOS** or **Chrome on Android**).
2. Tap **"INITIALIZE AR SCAN"** and grant camera and location permissions.
3. Default mode is **LIVE GPS**:
   - The radar blips and distance indicators guide you toward **Via Aldo Moro 52**, **La Nave**, or **Officine Ibba**.
   - As soon as you arrive within range, **Auto-Latch** locks the object onto the pavement in front of you with zero drift.
   - If you are testing indoors or at home, tap any of the standpoint buttons (e.g., `VIA ALDO MORO 52`) or tap `[🔒 LATCH ON GROUND]` to lock the statue or monolith right onto your living room or garden floor!
