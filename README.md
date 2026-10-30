# 📍 Precision Red Map Pin AR - Real-World Address WebAR

A modern mobile WebAR application that places a photorealistic **3D Red Map Pin** directly in physical space on top of any real-world address, landmark, or GPS coordinates, built with **open-source 8thwall.org SLAM**, **A-Frame / Three.js**, and **OpenStreetMap / Google Maps geocoding**.

Live WebAR App: **[https://seansilla.github.io/frattocchie-ar/](https://seansilla.github.io/frattocchie-ar/)**

---

## 🌟 Key Capabilities

1. **Search Any Address Worldwide**:
   - Type any street, building number, landmark, or city (e.g. *Via Aldo Moro 52 Frattocchie*, *Colosseo Roma*, *Times Square NY*).
   - Instant autocomplete suggestions powered by global geocoding.
   - Enter raw coordinates directly (e.g. `41.76370, 12.60930`).
   - Paste **Google Maps URLs** directly (e.g. `https://maps.google.com/?q=41.7637,12.6093`).

2. **Interactive Map Picker (Google / Open Maps)**:
   - Tap **`🗺️ MAP PICKER`** to open a live Leaflet map view with CartoDB Voyager tiles.
   - See your blue GPS location and the red pin marker.
   - Drag the pin or tap any building/rooftop/street to anchor the 3D pin to that exact physical spot.

3. **Photorealistic 3D Red Map Pin**:
   - Sculpted 3D teardrop pin with high-gloss red enamel finish, white central medallion, and chrome bevel rings.
   - Ground contact point with drop shadow and expanding sonar pulse ripples.
   - Floating 3D billboard label above the pin showing the street name and real-time distance that always faces the camera.

4. **Zero-Jitter SLAM Ground Fusion**:
   - Browser GPS has an inherent drift of $\pm 5\text{m}$ to $\pm 15\text{m}$.
   - Tap **`🔒 LOCK GROUND`** or step within proximity: the pin locks into 8thwall.org's physical 6-DoF SLAM tracking, decoupling it from raw GPS drift so it stays permanently pinned to that exact doorstep or paving stone at 60 FPS.

5. **Off-Screen Directional Guidance**:
   - If the address is behind you or out of your camera view, an intelligent HUD arrow appears (*"⟵ TURN LEFT 65° TO PIN"* or *"↻ PIN IS BEHIND YOU"*) pointing you right toward the destination.

6. **Adjustable Elevation & Scale**:
   - Tap **`⚙️ ADJUST`** to scale the pin ($0.3\text{x}$ to $5\text{x}$) or elevate it into the sky ($0\text{m}$ ground to $30\text{m}$ beacon).
   - Standpoint Simulator: Toggle between **`🌐 LIVE GPS`** and **`🏠 AT DESTINATION`** to test the pin from anywhere in the world.

---

## 📁 Project Structure

```
Frattocchie AR/
├── index.html        # Main WebAR experience (8thwall.org SLAM engine binary, A-Frame scene, HUD)
├── style.css         # Modern Google/Apple Maps frosted glass HUD & responsive layout
├── app.js            # 3D Red Map Pin geometry, Leaflet map modal, geocoding, geodesic math, SLAM fusion
├── package.json      # Local dev scripts
├── .gitignore        # Git ignore rules
└── README.md         # Documentation
```

---

## 📱 How to Use On-Site or from Home

1. Open **[https://seansilla.github.io/frattocchie-ar/](https://seansilla.github.io/frattocchie-ar/)** on your phone (Safari on iOS or Chrome on Android).
2. Tap **"START AR CAMERA SCAN"** and grant camera and location permissions.
3. In the top search bar, type your destination address or tap **`🗺️ MAP PICKER`** to drop the pin visually.
4. Follow the live distance indicator, mini radar, and directional arrows.
5. Tap **`🔒 LOCK GROUND`** or **`📌 PIN HERE`** to anchor the pin to the physical ground with rock-solid SLAM stability.
